import { ICreateCustomer, IDBContact, ICreateCustomerResponse, IUserObject } from './../../interfaces/db/idbcontact';
import { UserService } from './user';
import { ICreateWallet, IDBWallet, IResponseCreateWallet } from '../../interfaces/db/idbwallet';
import { ApiService } from '../api/api';
import { IContact } from '../../interfaces/rapyd/icontact';
import { ICurrency, IdentityVerification, IWalletTransaction, TransferToWallet, WalletBalanceResponse } from '../../interfaces/rapyd/iwallet';
import { IUtilitiesResponse } from '../../interfaces/rapyd/rest-response';

export class WalletService {
    constructor() { }

    create_wallet_and_contact(wallet: ICreateWallet.Root) {
        var apiSrv = new ApiService();
        return apiSrv.post<IResponseCreateWallet.Root>("user", wallet)
    }
    get_wallet_transactions(wallet_id) {
        var apiSrv = new ApiService();
        return apiSrv.get<IWalletTransaction[]>("user/"+wallet_id+"/transactions")
    }

    generate_idv_page(request: IdentityVerification.Request) {
        var apiSrv = new ApiService();
        return apiSrv.post<IdentityVerification.Response>("hosted/idv", request);
    }

    async create_wallet(form: ICreateWallet.Form, id: number): Promise<IUserObject> {
        let userSrv = new UserService();
        let user = await userSrv.get_user({ id });

        let wallet: ICreateWallet.Root = {
            phone_number: user.phone_number,
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            type: "person",
            ewallet_reference_id: id + "",
            contact: {
                address: {
                    line_1:user.line_1,
                    line_2:user.line_2,
                    city:user.city,
                    state:user.state,
                    country:user.country,
                    phone_number:user.phone_number,
                    name: form.first_name + " " + form.last_name
                },
                contact_type: "personal",
                country: form.country,
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
                phone_number: user.phone_number,
                date_of_birth:user.date_of_birth
            }
        }
        return new Promise((resolve, reject) => {
            this.create_wallet_and_contact(wallet).then(async (res) => {
                let newwallet = res.body.data;

                // update db refrences
                let rapyd_contact = newwallet.contacts.data[0]
                user.ewallet_id = newwallet.id as any;
                user.contact_id = rapyd_contact.id as any;
                user.meta.rapyd_wallet_data = newwallet;
                user.meta.rapyd_contact_data = rapyd_contact as any;

                user = await userSrv.update_user({ id: user.id }, user);

                // create customer from contact
                let customer: ICreateCustomer = {
                    name: rapyd_contact.first_name + " " + rapyd_contact.last_name,
                    phone_number: rapyd_contact.phone_number,
                    metadata: {
                        contact_reference_id: user.id
                    },
                    business_vat_id: "123456789",
                    ewallet: newwallet.id,
                    email: form.email,
                    invoice_prefix: this.makeid(4) + "-"
                }
                this.create_customer(customer).then(async (customer) => {
                    // update db references
                    user.customer_id = customer.body.data.id as any;
                    user.meta.customer = customer.body.data as any;
                    user = await userSrv.update_user({ id: user.id }, user);

                    // add funds
                    await this.add_funds(newwallet.id, 100, "USD").catch(error => {
                        console.error(error);
                        reject(error?.body?.status?.message);
                    });
                    user = await this.refresh_user_wallet_account(user.id);
                    resolve(user)

                }).catch(error => {
                    console.error(error);
                    reject(error?.body?.status?.message);
                })


            }).catch(error => {
                console.error(error);
                reject(error?.body?.status?.message);
            })

        })
    }


    update_contact(ewallet: string, contact: string, body: IContact) {
        var apiSrv = new ApiService();
        return apiSrv.post<IContact>("ewallets/" + ewallet + "/contacts/" + contact, body)
    }

    get_rates(query: ICurrency.QueryRequest) {
        var apiSrv = new ApiService();
        let url = `rates/daily?action_type=${query.action_type}&buy_currency=${query.buy_currency}&sell_currency=${query.sell_currency}`
        return apiSrv.get<ICurrency.Response>(url)
    }

    reduce_accounts_to_amount(accounts: WalletBalanceResponse[], currency: string) {
        let filterd = accounts.filter(a => a.currency == currency);
        if (filterd) {
            let ballances = {
                balance : filterd.reduce((a, b) =>  ((a.balance + b.balance) as any) ).balance,
                on_hold_balance : filterd.reduce((a, b) =>  ((a.on_hold_balance + b.on_hold_balance) as any) ).balance,
                received_balance : filterd.reduce((a, b) =>  ((a.received_balance + b.received_balance) as any) ).balance,
                reserve_balance : filterd.reduce((a, b) =>  ((a.reserve_balance + b.reserve_balance) as any) ).balance,

            }
            return ballances;
        } else {
            return {balance:0,on_hold_balance:0,received_balance:0,reserve_balance:0}
        }
    }

    transfer_to_wallet(transfer_object: TransferToWallet.Request) {
        var apiSrv = new ApiService();
        return apiSrv.post<TransferToWallet.Response>("account/transfer", transfer_object)
    }

    set_transfer_response(set_object: TransferToWallet.Set_Response) {
        var apiSrv = new ApiService();
        return apiSrv.post<TransferToWallet.Response>("account/transfer/response", set_object)
    }


    create_customer(customer: ICreateCustomer) {
        var apiSrv = new ApiService();
        return apiSrv.post<ICreateCustomerResponse>("customers", customer)
    }

    add_funds(ewallet: any, amount: number, currency = "USD") {
        var apiSrv = new ApiService();
        return apiSrv.post<IResponseCreateWallet.Root>("account/deposit", {
            ewallet,
            amount,
            currency
        })
    }

    async refresh_user_wallet_account(id: number, currency = "USD"): Promise<IUserObject> {
        var userSrv = new UserService();
        var user = await userSrv.get_user({ id })
        let wallet_id = user.ewallet_id;
        user.meta = user.meta || {} as any;

        var apiSrv = new ApiService();
        return new Promise((resolve, reject) => {
            apiSrv.get<WalletBalanceResponse[]>("user/" + wallet_id + "/accounts").then(async (res) => {
                let wallet_accounts = res.body.data;
                user.meta.rapyd_wallet_data.accounts = wallet_accounts;
                let balances = this.reduce_accounts_to_amount(user.meta.rapyd_wallet_data.accounts, currency);
                user.wallet_balance = balances.balance;
                user.wallet_on_hold_balance = balances.on_hold_balance;
                user.wallet_received_balance = balances.received_balance;
                user.wallet_reserve_balance = balances.reserve_balance;
                user = await userSrv.update_user({ id }, user);
                resolve(user);
            }).catch((error: IUtilitiesResponse) => {
                console.error(error);
                reject(error)
            })
        })
    }

    async update_wallet_accounts(id: number): Promise<IDBContact> {
        var userSrv = new UserService();
        var user = await userSrv.get_user({ id })
        let wallet_id = user.meta.rapyd_contact_data.ewallet;
        var apiSrv = new ApiService();
        return new Promise((resolve, reject) => {
            apiSrv.get<WalletBalanceResponse[]>("user/" + wallet_id + "/accounts").then(async (res) => {
                let wallet_accounts = res.body.data;
                user.meta.rapyd_wallet_data.accounts = wallet_accounts;
                user = await userSrv.update_user({ id }, { meta:user.meta });
                resolve(user);
            }).catch((error: IUtilitiesResponse) => {
                console.error(error);
                reject(error)
            })
        })
    }



    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
}