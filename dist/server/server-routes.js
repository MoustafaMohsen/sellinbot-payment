"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var user_1 = require("./../services/models/user");
var payment_1 = require("./../services/models/payment");
var sellinbot_payment_db_1 = require("./../services/db/sellinbot-payment-db");
var wallet_1 = require("../services/models/wallet");
var api_1 = require("../services/api/api");
var perf_hooks_1 = __importDefault(require("perf_hooks"));
var server_core_1 = __importDefault(require("./core/server-core"));
var utilities_1 = require("../services/util/utilities");
var SellinBotServerRoutes = (function (_super) {
    __extends(SellinBotServerRoutes, _super);
    function SellinBotServerRoutes() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SellinBotServerRoutes.prototype.setupRoute = function () {
        var _this = this;
        function send(res, response, t0) {
            var pre = perf_hooks_1.default.performance.now() - t0;
            console.log("-->Request for:'".concat(res.req.path, "', from client:'").concat(res.req.ip, "' took:").concat(pre, "ms"));
            if (!res.headersSent) {
                res.send(JSON.stringify({ performance: pre, success: true, data: __assign({}, response) }));
            }
            else {
                res.write(JSON.stringify({ performance: pre, success: true, data: __assign({}, response) }));
                res.end();
            }
        }
        function err(res, message, t0, statuscode) {
            if (statuscode === void 0) { statuscode = 400; }
            var pre = perf_hooks_1.default.performance.now() - t0;
            console.log("-->Request errored for:'".concat(res.req.path, "', from client:'").concat(res.req.ip, "' took:").concat(pre, "ms"));
            console.error(message);
            res.send(JSON.stringify({ data: {}, response_status: 400, message: message, performance: pre, success: false }));
        }
        this.app.get('/admin/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, data;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                data = {};
                try {
                    send(res, data, t0);
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.get('/admin/test-db', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, data, db, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        t0 = perf_hooks_1.default.performance.now();
                        data = {};
                        db = new sellinbot_payment_db_1.SellinBotDB();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = data;
                        return [4, db.connect()];
                    case 2:
                        _a.result = (_b.sent());
                        send(res, data, t0);
                        return [3, 4];
                    case 3:
                        error_1 = _b.sent();
                        err(res, error_1, t0);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
        this.app.post('/admin/prepare-db/' + process.env.SELLINBOT_KEY, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, data, db, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t0 = perf_hooks_1.default.performance.now();
                        data = {};
                        db = new sellinbot_payment_db_1.SellinBotDB();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, db.setupDb()];
                    case 2:
                        _a.sent();
                        send(res, data, t0);
                        return [3, 4];
                    case 3:
                        error_2 = _a.sent();
                        err(res, error_2, t0);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
        this.app.post('/user/get', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, body;
            var _this = this;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    userSrv = new user_1.UserService();
                    body = req.body;
                    userSrv.get_user(body).then(function (d) { return __awaiter(_this, void 0, void 0, function () {
                        var wallet, user;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(d && d.id)) return [3, 2];
                                    wallet = new wallet_1.WalletService();
                                    return [4, wallet.refresh_user_wallet_account(d.id)];
                                case 1:
                                    user = _a.sent();
                                    send(res, user, t0);
                                    return [3, 3];
                                case 2:
                                    err(res, "Incorrect Password", t0);
                                    _a.label = 3;
                                case 3: return [2];
                            }
                        });
                    }); }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.post('/user/create' + process.env.SELLINBOT_KEY, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, body;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    userSrv = new user_1.UserService();
                    body = req.body;
                    userSrv.create_new_user(body).then(function (user) {
                        console.log("user created");
                        console.log(user);
                        var walletSrv = new wallet_1.WalletService();
                        var wallet_request = {
                            first_name: user.first_name,
                            last_name: user.last_name,
                            country: user.country,
                            email: user.email
                        };
                        walletSrv.create_wallet(wallet_request, user.id).then(function (d) {
                            send(res, d, t0);
                        }).catch(function (e) {
                            err(res, e, t0);
                        });
                    }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (message) {
                    err(res, message, t0);
                }
                return [2];
            });
        }); });
        this.app.post('/user/update', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, newUser, oldUser;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    userSrv = new user_1.UserService();
                    newUser = req.body.new_user;
                    oldUser = req.body.old_user;
                    userSrv.update_user(oldUser, newUser).then(function (d) {
                        send(res, d, t0);
                    }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.post('/user/delete' + process.env.SELLINBOT_KEY, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, body;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    userSrv = new user_1.UserService();
                    body = req.body;
                    userSrv.delete_user(body).then(function (d) {
                        send(res, d, t0);
                    }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.post('/wallet/transactions', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, data, walletSrv, userSrv, body, user, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t0 = perf_hooks_1.default.performance.now();
                        data = {};
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        walletSrv = new wallet_1.WalletService();
                        userSrv = new user_1.UserService();
                        body = req.body;
                        return [4, userSrv.get_user({ id: body.id })];
                    case 2:
                        user = _a.sent();
                        walletSrv.get_wallet_transactions(user.ewallet_id).then(function (r) {
                            send(res, { data: Object.values(r.body.data) }, t0);
                        });
                        return [3, 4];
                    case 3:
                        error_3 = _a.sent();
                        err(res, error_3, t0);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
        this.app.post('/wallet/create', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, user, walletSrv, wallet_request, message_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t0 = perf_hooks_1.default.performance.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        userSrv = new user_1.UserService();
                        return [4, userSrv.get_user(req.body.id)];
                    case 2:
                        user = _a.sent();
                        walletSrv = new wallet_1.WalletService();
                        wallet_request = {
                            first_name: user.first_name,
                            last_name: user.last_name,
                            country: user.country,
                            email: user.email
                        };
                        walletSrv.create_wallet(wallet_request, user.id).then(function (d) {
                            send(res, d, t0);
                        }).catch(function (e) {
                            err(res, e, t0);
                        });
                        return [3, 4];
                    case 3:
                        message_1 = _a.sent();
                        err(res, message_1, t0);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
        this.app.post('/wallet/accounts/update', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, walletSrv, user, message_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t0 = perf_hooks_1.default.performance.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        walletSrv = new wallet_1.WalletService();
                        return [4, user_1.UserService.getUser()];
                    case 2:
                        user = _a.sent();
                        walletSrv.update_wallet_accounts(user.id).then(function (d) {
                            send(res, d, t0);
                        }).catch(function (e) {
                            err(res, e, t0);
                        });
                        return [3, 4];
                    case 3:
                        message_2 = _a.sent();
                        err(res, message_2, t0);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
        this.app.post('/checkout/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, data, paymentSrv, user, ewallet, request, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t0 = perf_hooks_1.default.performance.now();
                        data = {};
                        paymentSrv = new payment_1.PaymentService();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, user_1.UserService.getUser()];
                    case 2:
                        user = _a.sent();
                        ewallet = user.ewallet_id;
                        request = __assign({ custom_elements: {
                                save_card_default: true,
                                display_description: true,
                                payment_fees_display: true,
                                merchant_currency_only: true,
                                billing_address_collect: true,
                                dynamic_currency_conversion: true,
                                merchant_color: "#FF0000"
                            }, language: "en", payment_method_type: "us_mastercard_card", country: "US", currency: "USD", ewallet: ewallet }, req.body);
                        paymentSrv.generate_checkout_page(request).then(function (r) {
                            send(res, r.body.data, t0);
                        }).catch(function (error) {
                            var _a, _b;
                            err(res, (_b = (_a = error === null || error === void 0 ? void 0 : error.body) === null || _a === void 0 ? void 0 : _a.status) === null || _b === void 0 ? void 0 : _b.message, t0);
                        });
                        return [3, 4];
                    case 3:
                        error_4 = _a.sent();
                        err(res, error_4, t0);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
        this.app.post('/idv', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, data, walletSrv, body;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                data = {};
                walletSrv = new wallet_1.WalletService();
                try {
                    body = req.body;
                    walletSrv.generate_idv_page(body).then(function (r) {
                        send(res, r.body.data, t0);
                    }).catch(function (error) {
                        err(res, error, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.post('/confirm-otp', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, body;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    userSrv = new user_1.UserService();
                    body = req.body;
                    userSrv.confirm_user_otp(body.user, body.otp).then(function (d) {
                        send(res, d, t0);
                    }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.post('/set-otp', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, body;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    userSrv = new user_1.UserService();
                    body = req.body;
                    userSrv.set_user_otp(body.user, body.otp).then(function (d) {
                        send(res, d, t0);
                    }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.post('/confirm-pin', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, body;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    userSrv = new user_1.UserService();
                    body = req.body;
                    userSrv.confirm_user_pin(body.user, body.pin).then(function (d) {
                        send(res, d, t0);
                    }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.post('/set-pin', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, userSrv, body;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    userSrv = new user_1.UserService();
                    body = req.body;
                    userSrv.set_user_pin(body.user, body.pin).then(function (d) {
                        send(res, d, t0);
                    }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
        this.app.get('/countries', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, data, api, body, rapydUti, data_1, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t0 = perf_hooks_1.default.performance.now();
                        data = {};
                        api = new api_1.ApiService();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        body = req.body;
                        rapydUti = new utilities_1.RapydUtilties();
                        return [4, rapydUti.makeRequest('GET', '/v1/data/countries')];
                    case 2:
                        data_1 = _a.sent();
                        send(res, data_1.body.data, t0);
                        return [3, 4];
                    case 3:
                        error_5 = _a.sent();
                        err(res, error_5, t0);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        }); });
        this.app.get('/rates', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var t0, walletSrv, body;
            return __generator(this, function (_a) {
                t0 = perf_hooks_1.default.performance.now();
                try {
                    walletSrv = new wallet_1.WalletService();
                    body = req.body;
                    walletSrv.get_rates(body).then(function (d) {
                        var rates = d.body.data;
                        send(res, rates, t0);
                    }).catch(function (e) {
                        err(res, e, t0);
                    });
                }
                catch (error) {
                    err(res, error, t0);
                }
                return [2];
            });
        }); });
    };
    return SellinBotServerRoutes;
}(server_core_1.default));
exports.default = SellinBotServerRoutes;
//# sourceMappingURL=server-routes.js.map