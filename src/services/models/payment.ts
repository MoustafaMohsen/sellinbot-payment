import { ApiService } from '../api/api';
import { ListPayments, RequiredFields, PostCreatePayment, IPayment } from '../../interfaces/rapyd/ipayment';
import { ICreateChckoutPage } from '../../interfaces/rapyd/iwallet';

export class PaymentService {
    constructor() { }

    list_payment_methods(country: string) {
        var apiSrv = new ApiService();
        return apiSrv.get<ListPayments.Response[]>("payment_methods/country?country=" + country)
    }

    payment_method_required_fields(payment_method_type: string) {
        var apiSrv = new ApiService();
        return apiSrv.get<RequiredFields.Response>("payment_methods/required_fields/" + payment_method_type)
    }

    create_payment(create_payment_object: PostCreatePayment.Request) {
        var apiSrv = new ApiService();
        return apiSrv.post<PostCreatePayment.Response>("payments", create_payment_object)
    }

    get_payment(payment_id: string) {
        var apiSrv = new ApiService();
        return apiSrv.get<PostCreatePayment.Response>("payments/" + payment_id);
    }

    generate_checkout_page(request: ICreateChckoutPage.Request) {
        var apiSrv = new ApiService();
        return apiSrv.post<ICreateChckoutPage.Response>("checkout/", request);
    }

    complete_payment(payment_id: string) {
        return new Promise((resolve, reject) => {
            this.get_payment(payment_id).then(res => {
                let payment = res.body.data;
                if (payment.status == "CLO") {
                    resolve(payment);
                    return;
                }
                var id = payment.id;
                let request: any = {
                    token: id
                }
                if (payment.payment_method_type_category == "bank_transfer") {
                    request.param1 = payment.amount
                }
                if (payment.payment_method_type_category == "bank_redirect") {
                    request.param1 = "rapyd"
                    request.param2 = "success"
                }
                var apiSrv = new ApiService();
                apiSrv.post<PostCreatePayment.Response>("payments/completePayment", request).then(res => {
                    let payment = res.body.data
                    resolve(payment);
                }).catch(error => {
                    console.error(error);
                    reject(error)
                })

            }).catch(error => {
                console.error(error);
                reject(error)
            })
        })
    }
}