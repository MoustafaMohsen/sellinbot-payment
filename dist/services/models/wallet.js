"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
var user_1 = require("./user");
var api_1 = require("../api/api");
var WalletService = (function () {
    function WalletService() {
    }
    WalletService.prototype.create_wallet_and_contact = function (wallet) {
        var apiSrv = new api_1.ApiService();
        return apiSrv.post("user", wallet);
    };
    WalletService.prototype.get_wallet_transactions = function (wallet_id) {
        var apiSrv = new api_1.ApiService();
        return apiSrv.get("user/" + wallet_id + "/transactions");
    };
    WalletService.prototype.generate_idv_page = function (request) {
        var apiSrv = new api_1.ApiService();
        return apiSrv.post("hosted/idv", request);
    };
    WalletService.prototype.create_wallet = function (form, id) {
        return __awaiter(this, void 0, void 0, function () {
            var userSrv, user, wallet;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userSrv = new user_1.UserService();
                        return [4, userSrv.get_user({ id: id })];
                    case 1:
                        user = _a.sent();
                        wallet = {
                            phone_number: user.phone_number,
                            first_name: form.first_name,
                            last_name: form.last_name,
                            email: form.email,
                            type: "person",
                            ewallet_reference_id: id + "",
                            contact: {
                                address: {
                                    line_1: user.line_1,
                                    line_2: user.line_2,
                                    city: user.city,
                                    state: user.state,
                                    country: user.country,
                                    phone_number: user.phone_number,
                                    name: form.first_name + " " + form.last_name
                                },
                                contact_type: "personal",
                                country: form.country,
                                email: form.email,
                                first_name: form.first_name,
                                last_name: form.last_name,
                                phone_number: user.phone_number,
                                date_of_birth: user.date_of_birth
                            }
                        };
                        return [2, new Promise(function (resolve, reject) {
                                _this.create_wallet_and_contact(wallet).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                    var newwallet, rapyd_contact, customer;
                                    var _this = this;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                newwallet = res.body.data;
                                                rapyd_contact = newwallet.contacts.data[0];
                                                user.ewallet_id = newwallet.id;
                                                user.contact_id = rapyd_contact.id;
                                                user.meta.rapyd_wallet_data = newwallet;
                                                user.meta.rapyd_contact_data = rapyd_contact;
                                                return [4, userSrv.update_user({ id: user.id }, user)];
                                            case 1:
                                                user = _a.sent();
                                                customer = {
                                                    name: rapyd_contact.first_name + " " + rapyd_contact.last_name,
                                                    phone_number: rapyd_contact.phone_number,
                                                    metadata: {
                                                        contact_reference_id: user.id
                                                    },
                                                    business_vat_id: "123456789",
                                                    ewallet: newwallet.id,
                                                    email: form.email,
                                                    invoice_prefix: this.makeid(4) + "-"
                                                };
                                                this.create_customer(customer).then(function (customer) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                user.customer_id = customer.body.data.id;
                                                                user.meta.customer = customer.body.data;
                                                                return [4, userSrv.update_user({ id: user.id }, user)];
                                                            case 1:
                                                                user = _a.sent();
                                                                return [4, this.add_funds(newwallet.id, 100, "USD").catch(function (error) {
                                                                        var _a, _b;
                                                                        console.error(error);
                                                                        reject((_b = (_a = error === null || error === void 0 ? void 0 : error.body) === null || _a === void 0 ? void 0 : _a.status) === null || _b === void 0 ? void 0 : _b.message);
                                                                    })];
                                                            case 2:
                                                                _a.sent();
                                                                return [4, this.refresh_user_wallet_account(user.id)];
                                                            case 3:
                                                                user = _a.sent();
                                                                resolve(user);
                                                                return [2];
                                                        }
                                                    });
                                                }); }).catch(function (error) {
                                                    var _a, _b;
                                                    console.error(error);
                                                    reject((_b = (_a = error === null || error === void 0 ? void 0 : error.body) === null || _a === void 0 ? void 0 : _a.status) === null || _b === void 0 ? void 0 : _b.message);
                                                });
                                                return [2];
                                        }
                                    });
                                }); }).catch(function (error) {
                                    var _a, _b;
                                    console.error(error);
                                    reject((_b = (_a = error === null || error === void 0 ? void 0 : error.body) === null || _a === void 0 ? void 0 : _a.status) === null || _b === void 0 ? void 0 : _b.message);
                                });
                            })];
                }
            });
        });
    };
    WalletService.prototype.update_contact = function (ewallet, contact, body) {
        var apiSrv = new api_1.ApiService();
        return apiSrv.post("ewallets/" + ewallet + "/contacts/" + contact, body);
    };
    WalletService.prototype.get_rates = function (query) {
        var apiSrv = new api_1.ApiService();
        var url = "rates/daily?action_type=".concat(query.action_type, "&buy_currency=").concat(query.buy_currency, "&sell_currency=").concat(query.sell_currency);
        return apiSrv.get(url);
    };
    WalletService.prototype.reduce_accounts_to_amount = function (accounts, currency) {
        var filterd = accounts.filter(function (a) { return a.currency == currency; });
        if (filterd) {
            var ballances = {
                balance: filterd.reduce(function (a, b) { return (a.balance + b.balance); }).balance,
                on_hold_balance: filterd.reduce(function (a, b) { return (a.on_hold_balance + b.on_hold_balance); }).balance,
                received_balance: filterd.reduce(function (a, b) { return (a.received_balance + b.received_balance); }).balance,
                reserve_balance: filterd.reduce(function (a, b) { return (a.reserve_balance + b.reserve_balance); }).balance,
            };
            return ballances;
        }
        else {
            return { balance: 0, on_hold_balance: 0, received_balance: 0, reserve_balance: 0 };
        }
    };
    WalletService.prototype.transfer_to_wallet = function (transfer_object) {
        var apiSrv = new api_1.ApiService();
        return apiSrv.post("account/transfer", transfer_object);
    };
    WalletService.prototype.set_transfer_response = function (set_object) {
        var apiSrv = new api_1.ApiService();
        return apiSrv.post("account/transfer/response", set_object);
    };
    WalletService.prototype.create_customer = function (customer) {
        var apiSrv = new api_1.ApiService();
        return apiSrv.post("customers", customer);
    };
    WalletService.prototype.add_funds = function (ewallet, amount, currency) {
        if (currency === void 0) { currency = "USD"; }
        var apiSrv = new api_1.ApiService();
        return apiSrv.post("account/deposit", {
            ewallet: ewallet,
            amount: amount,
            currency: currency
        });
    };
    WalletService.prototype.refresh_user_wallet_account = function (id, currency) {
        if (currency === void 0) { currency = "USD"; }
        return __awaiter(this, void 0, void 0, function () {
            var userSrv, user, wallet_id, apiSrv;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userSrv = new user_1.UserService();
                        return [4, userSrv.get_user({ id: id })];
                    case 1:
                        user = _a.sent();
                        wallet_id = user.ewallet_id;
                        user.meta = user.meta || {};
                        apiSrv = new api_1.ApiService();
                        return [2, new Promise(function (resolve, reject) {
                                apiSrv.get("user/" + wallet_id + "/accounts").then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                    var wallet_accounts, balances;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                wallet_accounts = res.body.data;
                                                user.meta.rapyd_wallet_data.accounts = wallet_accounts;
                                                balances = this.reduce_accounts_to_amount(user.meta.rapyd_wallet_data.accounts, currency);
                                                user.wallet_balance = balances.balance;
                                                user.wallet_on_hold_balance = balances.on_hold_balance;
                                                user.wallet_received_balance = balances.received_balance;
                                                user.wallet_reserve_balance = balances.reserve_balance;
                                                return [4, userSrv.update_user({ id: id }, user)];
                                            case 1:
                                                user = _a.sent();
                                                resolve(user);
                                                return [2];
                                        }
                                    });
                                }); }).catch(function (error) {
                                    console.error(error);
                                    reject(error);
                                });
                            })];
                }
            });
        });
    };
    WalletService.prototype.update_wallet_accounts = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var userSrv, user, wallet_id, apiSrv;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userSrv = new user_1.UserService();
                        return [4, userSrv.get_user({ id: id })];
                    case 1:
                        user = _a.sent();
                        wallet_id = user.meta.rapyd_contact_data.ewallet;
                        apiSrv = new api_1.ApiService();
                        return [2, new Promise(function (resolve, reject) {
                                apiSrv.get("user/" + wallet_id + "/accounts").then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                    var wallet_accounts;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                wallet_accounts = res.body.data;
                                                user.meta.rapyd_wallet_data.accounts = wallet_accounts;
                                                return [4, userSrv.update_user({ id: id }, { meta: user.meta })];
                                            case 1:
                                                user = _a.sent();
                                                resolve(user);
                                                return [2];
                                        }
                                    });
                                }); }).catch(function (error) {
                                    console.error(error);
                                    reject(error);
                                });
                            })];
                }
            });
        });
    };
    WalletService.prototype.makeid = function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    };
    return WalletService;
}());
exports.WalletService = WalletService;
//# sourceMappingURL=wallet.js.map