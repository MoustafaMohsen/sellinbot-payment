import { IWallet } from './../rapyd/iwallet';
import { address_id, customer_id, dateformate, kycid_id, sender_id } from './../rapyd/types.d';
import { IContact } from "../rapyd/icontact";
import { ewallet_id } from "../rapyd/types";
import { IDBSecurity } from "./isecurity";
import { IResponseCreateWallet } from './idbwallet';
import { IAddress } from '../rapyd/iaddress';
import { IssueVccResponse } from '../rapyd/ivcc';

export interface IUserObject {
    /** local contact id */
    id?: number;

    // input fields
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    date_of_birth?: dateformate;
    country?: string;
    password_hash?: string;
    line_1?: string
    line_2?: string
    city?: string
    state?: string
    zip?: string
    // verification field
    gender?: string; // male female other not_applicable
    identification_type?: string
    identification_number?: string
    verification_status?: string;



    /** wallet */
    contact_id?: string;
    customer_id?: string;
    ewallet_id?: ewallet_id;
    ewallet_status?: string
    ewallet_category?: any
    wallet_currency?: string
    wallet_alias?: string
    wallet_balance?: number
    wallet_received_balance?: number
    wallet_on_hold_balance?: number
    wallet_reserve_balance?: number


    // More data
    meta?: {
        rapyd_wallet_data?:IResponseCreateWallet.Root
        rapyd_contact_data?:IResponseCreateWallet.Daum
        customer?:ICreateCustomerResponse
        vcc?:IssueVccResponse[]
        security?: IDBSecurity;
    };
    timestamp?: number;

}


export interface IDBContact {
    /** local contact id */
    contact_reference_id?: number;
    /** rapyd id */
    contact?: string;
    email?: string;
    ewallet?: ewallet_id;
    customer?: customer_id;
    kycid?: kycid_id;

    /** data stored in rapyd servers */
    rapyd_contact_data?: IContact;
    /** data stored in rapyd servers */
    rapyd_wallet_data?: IResponseCreateWallet.Root;

    phone_number?: string;
    security?: IDBSecurity;
    meta?: object;
}

export interface ICreateCustomer {
    business_vat_id: string
    email: string
    ewallet: string
    invoice_prefix: string
    metadata: any
    name: string
    phone_number: string
}

export interface ICreateCustomerResponse {
    id: string
    delinquent: boolean
    discount: any
    name: string
    default_payment_method: string
    description: string
    email: string
    phone_number: string
    invoice_prefix: string
    addresses: any[]
    payment_methods: any
    subscriptions: any
    created_at: number
    metadata: any
    business_vat_id: string
    ewallet: string
}
