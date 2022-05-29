import { ICreateCustomer, IDBContact, ICreateCustomerResponse } from '../../interfaces/db/idbcontact';
import { UserService } from './user';
import { IResponseCreateWallet } from '../../interfaces/db/idbwallet';
import { ApiService } from '../api/api';
import { ISetCardStatus, ISimulateCardAuthorization, IssueVcc, IssueVccRequest, IssueVccRequestForm, IssueVccResponse, ListIssuedVcc, ListIssuedVccTransactions } from '../../interfaces/rapyd/ivcc';

export class VccService {
    constructor() { }

    create_vcc(card_info: IssueVccRequest) {
        var apiSrv = new ApiService();
        return apiSrv.post<IssueVccResponse>("issuing/cards", card_info)
    }

    activate_card(card_number: string) {
        var apiSrv = new ApiService();
        return apiSrv.post<IssueVccResponse>("issuing/cards/activate", {
            card: card_number
        })
    }

    list_cards() {
        var apiSrv = new ApiService();
        return apiSrv.get<ListIssuedVcc.Response[]>("issuing/cards/")
    }

    list_card_transactions(card_id) {
        var apiSrv = new ApiService();
        return apiSrv.get<ListIssuedVccTransactions.Response[]>("issuing/cards/" + card_id + "/transactions/")
    }

    set_card_status(obj: ISetCardStatus) {
        var apiSrv = new ApiService();
        return apiSrv.post<ListIssuedVccTransactions.Response[]>("issuing/cards/status", obj)
    }

    simulate_card_authorization(obj: ISimulateCardAuthorization) {
        var apiSrv = new ApiService();
        return apiSrv.post<ListIssuedVccTransactions.Response>("issuing/cards/authorization", obj)
    }

    async get_contact_cards(id): Promise<ListIssuedVcc.Response[]> {
        let res = await this.list_cards();

        let userSrv = new UserService()
        let user = await userSrv.get_user({ id })

        if (user && res.body.status.status == "SUCCESS") {
            if (res.body.data) {
                let cards = res.body.data;
                cards = cards.filter(c => c.ewallet_contact.id == user.contact_id);
                return cards;
            }
        }
        throw "User not found";
    }

    create_vcc_to_user(request:IssueVcc):Promise<IDBContact> {
        return new Promise(async (resolve, reject) => {
            let userSrv = new UserService();
            var user = await userSrv.get_user({ id:request.id })
            this.create_vcc({
                country: user.country,
                ewallet_contact: user.contact_id,
                metadata:request.metadata,
                card_program: request.card_program
            }).then(async (card) => {
                var card_data_all = card.body.data;
                this.activate_card(card_data_all.card_number).then(async (card_data) => {
                    if (card_data.body.status.status !== "SUCCESS") throw card_data;
                    let updated = {
                        ...card_data_all,
                        ...card_data.body.data
                    }
                    user.meta.vcc = user.meta.vcc || [];
                    user.meta.vcc.push(updated);
                    user = await userSrv.update_user({id:user.id},user);
                    resolve(user);
                }).catch(error => {
                    console.error(error);
                    reject(error);
                })
            }).catch(error => {
                console.error(error);
                reject(error?.body?.status?.message);
            })
        })
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