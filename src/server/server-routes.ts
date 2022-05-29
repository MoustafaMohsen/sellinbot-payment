import { UserService } from './../services/models/user';
import { VccService } from './../services/models/vcc';
import { PaymentService } from './../services/models/payment';
import { ICreateWallet, IDBWallet, IWallet2Wallet } from './../interfaces/db/idbwallet';
import { IDBContact, IUserObject } from './../interfaces/db/idbcontact';
import { SellinBotDB } from './../services/db/sellinbot-payment-db';
import { ICreateChckoutPage, ICurrency, IdentityVerification, IWallet } from '../interfaces/rapyd/iwallet';
import { WalletService } from '../services/models/wallet';
import { ApiService } from '../services/api/api';
import performance from "perf_hooks";
import express from "express";
import SellinBotServerCore from './core/server-core';
import { RapydUtilties } from '../services/util/utilities';
import { ISetCardStatus, ISimulateCardAuthorization, IssueVcc, IssueVccRequestForm } from '../interfaces/rapyd/ivcc';

export default class SellinBotServerRoutes extends SellinBotServerCore {

    setupRoute() {

        function send(res: express.Response, response, t0) {
            let pre = performance.performance.now() - t0;
            console.log(`-->Request for:'${res.req.path}', from client:'${res.req.ip}' took:${pre}ms`);
            if (!res.headersSent) {
                res.send(JSON.stringify({ performance: pre, success: true, data: { ...response } }))
            } else {
                res.write(JSON.stringify({ performance: pre, success: true, data: { ...response } }));
                res.end();
            }
        }

        function err(res: express.Response, message, t0, statuscode = 400) {
            // res.status(statuscode);
            let pre = performance.performance.now() - t0;
            console.log(`-->Request errored for:'${res.req.path}', from client:'${res.req.ip}' took:${pre}ms`);
            console.error(message);
            res.send(JSON.stringify({ data: {}, response_status: 400, message, performance: pre, success: false }))
        }

        // #region Admin
        this.app.get('/admin/', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            try {
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.get('/admin/test-db', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            const db = new SellinBotDB();
            try {
                data.result = (await db.connect());
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/admin/setup-db/' + process.env.SELLINBOT_KEY, async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            const db = new SellinBotDB();
            try {
                await db.setupDb();
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        // #endregion

        // Create user and create wallet
        this.app.post('/user/get', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let body: IUserObject = req.body;
                userSrv.get_user(body).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })


        this.app.post('/user/create', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let body: IUserObject = req.body;
                userSrv.create_new_user(body).then((user) => {
                    console.log("user created");
                    console.log(user);
                    const walletSrv = new WalletService();
                    const wallet_request: ICreateWallet.Form = {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        country: user.country,
                        email: user.email
                    }
                    walletSrv.create_wallet(wallet_request, user.id).then((d) => {
                        send(res, d, t0)
                    }).catch(e => {
                        err(res, e, t0)
                    })

                }).catch(e => {
                    err(res, e, t0)
                })

            } catch (message) {
                err(res, message, t0)
            }
        })

        // Create user and create wallet
        this.app.post('/user/update', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let newUser: IUserObject = req.body.new_user;
                let oldUser: IUserObject = req.body.old_user;
                userSrv.update_user(oldUser, newUser).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/user/delete', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let body: IUserObject = req.body;
                userSrv.delete_user(body).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        // ================================================
        // ==================== VCC =======================
        // ================================================
        this.app.post('/vcc/get', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const vccSrv = new VccService();
                vccSrv.get_contact_cards(req.body.id).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (message) {
                err(res, message, t0)
            }
        })

        this.app.post('/vcc/create', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const vccSrv = new VccService();
                let body: IssueVcc = req.body;
                vccSrv.create_vcc_to_user(body).then((user) => {
                    send(res, user, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (message) {
                err(res, message, t0)
            }
        })

        this.app.post('/vcc/transactions', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const vccSrv = new VccService();
                let body: { card_id: number } = req.body;
                vccSrv.list_card_transactions(body.card_id).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (message) {
                err(res, message, t0)
            }
        })

        this.app.post('/vss/status/set', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const vccSrv = new VccService();
                let body: ISetCardStatus = req.body;
                vccSrv.set_card_status(body).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (message) {
                err(res, message, t0)
            }
        })

        this.app.post('/vcc/authorization', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            let act = new VccService();
            try {
                let body: ISimulateCardAuthorization = req.body;
                act.simulate_card_authorization(body).then(r => {
                    send(res, r, t0)
                }).catch(error => {
                    err(res, error, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        // ================================================
        // =================== wallet =====================
        // ================================================

        this.app.post('/wallet/transactions', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            try {
                let walletSrv = new WalletService();
                let userSrv = new UserService();
                let body = req.body;
                let user = await userSrv.get_user({ id: body.id });
                walletSrv.get_wallet_transactions(user.ewallet_id).then(r => {
                    send(res, { data: Object.values(r.body.data) }, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/wallet/create', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                var user = await userSrv.get_user(req.body.id)
                const walletSrv = new WalletService();
                const wallet_request: ICreateWallet.Form = {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    country: user.country,
                    email: user.email
                }

                walletSrv.create_wallet(wallet_request, user.id).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (message) {
                err(res, message, t0)
            }
        })

        this.app.post('/wallet/accounts/update', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const walletSrv = new WalletService();
                let body: { id: number } = req.body;
                walletSrv.update_wallet_accounts(body.id).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (message) {
                err(res, message, t0)
            }
        })


        // ================================================
        // =================== checkout =====================
        // ================================================
        this.app.post('/checkout/', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            let paymentSrv = new PaymentService();
            try {
                let request: ICreateChckoutPage.Request = {
                    custom_elements: {
                        save_card_default: true,
                        display_description: true,
                        payment_fees_display: true,
                        merchant_currency_only: true,
                        billing_address_collect: true,
                        dynamic_currency_conversion: true,
                        merchant_color: "#FF0000"
                    },
                    cardholder_preferred_currency: true,
                    language: "en",
                    requested_currency: "USD",
                    fixed_side: "sell",
                    ...req.body
                }
                paymentSrv.generate_checkout_page(request).then(r => {
                    send(res, r.body.data, t0)
                }).catch(error => {
                    err(res, error?.body?.status?.message, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        // ================================================
        // =========== Identity Verification ==============
        // ================================================
        this.app.post('/idv', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            let walletSrv = new WalletService();
            try {
                let body: IdentityVerification.Request = req.body;
                walletSrv.generate_idv_page(body).then(r => {
                    send(res, r.body.data, t0)
                }).catch(error => {
                    err(res, error, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        // ================================================
        // =================== Authentication =====================
        // ================================================
        //#region OTP
        this.app.post('/confirm-otp', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let body: {
                    otp: number,
                    user: IDBContact
                } = req.body;
                userSrv.confirm_user_otp(body.user, body.otp).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/set-otp', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let body: {
                    otp: string,
                    user: IDBContact
                } = req.body;
                userSrv.set_user_otp(body.user, body.otp).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion

        //#region PIN
        this.app.post('/confirm-pin', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let body: {
                    pin: number,
                    user: IDBContact
                } = req.body;
                userSrv.confirm_user_pin(body.user, body.pin).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/set-pin', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let body: {
                    pin: string,
                    user: IDBContact
                } = req.body;
                userSrv.set_user_pin(body.user, body.pin).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion



        // ================================================
        // =================== Others =====================
        // ================================================
        this.app.get('/countries', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            let api = new ApiService();
            try {
                let body = req.body;
                var rapydUti = new RapydUtilties();
                const data = await rapydUti.makeRequest('GET', '/v1/data/countries');
                send(res, data.body.data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })


        this.app.get('/rates', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const walletSrv = new WalletService();
                let body: ICurrency.QueryRequest = req.body;
                walletSrv.get_rates(body).then((d) => {
                    let rates = d.body.data
                    send(res, rates, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })


    }

}