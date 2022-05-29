import { DBSecurity } from './security';
import { ILogin, ILoginTransportObj } from './../../interfaces/db/ilogin';
import { HelperService } from './../util/helper';
import { SellinBotDB } from '../db/sellinbotdb';
import { IDBSelect } from '../../interfaces/db/select_rows';
import { IUserObject } from '../../interfaces/db/idbcontact';

export class UserService {
    constructor() { }

    async create_new_user(user: IUserObject) {
        const db = new SellinBotDB();
        user.id = Math.floor(Math.random() * 100000000) + 1;
        if (!user.meta) user.meta = {} as any;
        let results = await db.insert_object(user, 'dbusers');
        let result = await this.get_user(results.rows[0]);
        return result;
    }

    async get_user(minimum_user_object: IUserObject) {
        const db = new SellinBotDB();
        let _user: IDBSelect<IUserObject> = {
            "*": minimum_user_object
        }
        let results = await db.get_object<IUserObject>(_user, "AND", 'dbusers');
        return this.parse_user_object(results.rows[0]);

    }
    async update_user(user: IUserObject, newuser: IUserObject) {
        const db = new SellinBotDB();
        let results = await db.update_object<IUserObject>(newuser, user, 'dbusers');
        let result = await this.get_user(user);
        return result;
    }

        
    async delete_user(user: IUserObject) {
        const db = new SellinBotDB();
        let results = await db.delete_object<IUserObject>(user, "AND", 'dbcontact');
        return results;
    }

    async list_users_by_phone(phone_number, limit = 10) {
        const db = new SellinBotDB();
        const query_str = {
            text: `SELECT phone_number FROM dbcontact WHERE phone_number LIKE $1 AND ewallet LIKE ewallet LIMIT $2`,
            values: ["%"+phone_number+"%", limit]
        };
        const client = await db.connect()
        let result = await client.query(query_str);
        return result.rows.map(u=>u.phone_number)
    }
    // TODO: delete user




    async login_or_register_to_otp(_login: ILoginTransportObj): Promise<ILoginTransportObj> {

        // user exists or not
        var user = await this.get_user({ phone_number: _login.phone_number });

        // login using device value
        if (user && _login.device_value) {
            if (user.meta.security.login._device_value == _login.device_value) {
                user.meta.security.login.device_passed = true;
                user.meta.security.login = this.update_has_values(user.meta.security.login);

                // check if fp value or fp value is sent
                if (_login.login._fp_value && user.meta.security.login._fp_value == _login.fp_value) {
                    user.meta.security.login.fp_passed = true;
                    user.meta.security.login = this.update_has_values(user.meta.security.login);
                    user.meta.security.login = this.should_authenticate(user.meta.security.login);
                    await this.update_user({ id: user.id }, user);
                    return { login: user.meta.security.login, id: user.id };
                }
            }
        }


        // if login using otp and pin/fp
        let otp = HelperService.generate_otp();

        // if user make otp request then return
        if (user) {
            user = await this.set_user_otp({ id: user.id }, otp);
            return { login: user.meta.security.login, id: user.id };
        }

        // if not register login
        user = {};
        let new_user: IUserObject = {
            meta:{
                security: this.get_user_security(user)
            },
            phone_number: _login.phone_number
        };
        user = await this.create_new_user(new_user);
        user = await this.set_user_otp({ id: user.id }, otp);
        return { login: user.meta.security.login, id: user.id };
    }

    async confirm_authenticate(user: IUserObject): Promise<IUserObject> {
        user.meta.security.login = this.should_authenticate(user.meta.security.login);
        let newuser = await this.update_user({ id: user.id }, user);
        return newuser
    }


    //#region security handling

    // ========= OTP
    // update user security object to set otp
    async set_user_otp(minimum_user_object: IUserObject, otp: string) {
        // user exists or not
        const db = new SellinBotDB();
        let user = await this.get_user(minimum_user_object);
        user.meta.security.login._otp_value = otp + "";
        user.meta.security.login.otp_passed = true;
        user.meta.security.login = this.update_has_values(user.meta.security.login);

        let updatedUser = await this.update_user({ id: user.id }, user);
        return updatedUser;
    }

    // update user security object to set otp
    async confirm_user_otp(minimum_user_object: IUserObject, otp: number) {
        // user exists or not
        const db = new SellinBotDB();
        let user = await this.get_user(minimum_user_object);
        if (user && user.meta.security && user.meta.security.login._otp_value === otp + "") {
            user.meta.security.login.otp_passed = true;
            user.meta.security.login = this.update_has_values(user.meta.security.login);
            let updatedUser = await this.update_user({ id: user.id }, user);
            return updatedUser;

        } else {
            user.meta.security.login.otp_passed = false;
            let updatedUser = await this.update_user({ id: user.id }, user);
            return updatedUser;
        }
    }


    // ========= PIN
    async set_user_pin(minimum_user_object: IUserObject, pin: string) {
        // user exists or not
        const db = new SellinBotDB();
        let user = await this.get_user(minimum_user_object);
        user.meta.security.login._pin_value = pin + "";
        user.meta.security.login.pin_passed = true;
        user.meta.security.login = this.update_has_values(user.meta.security.login);
        let updatedUser = await this.update_user({ id: user.id }, user);
        updatedUser = await this.confirm_authenticate(updatedUser);
        return updatedUser;
    }

    // update user security object to set pin
    async confirm_user_pin(minimum_user_object: IUserObject, pin: number) {
        // user exists or not
        const db = new SellinBotDB();
        let user = await this.get_user(minimum_user_object);
        if (user && user.meta.security && user.meta.security.login._pin_value === pin + "") {
            user.meta.security.login.pin_passed = true;
            user.meta.security.login = this.update_has_values(user.meta.security.login);
            let updatedUser = await this.update_user({ id: user.id }, user);
            updatedUser = await this.confirm_authenticate(updatedUser);
            return updatedUser;

        } else {
            user.meta.security.login.pin_passed = false;
            let updatedUser = await this.update_user({ id: user.id }, user);
            return updatedUser;
        }
    }

    // ========= FP
    async set_user_fp(minimum_user_object: IUserObject, fp: string) {
        // user exists or not
        const db = new SellinBotDB();
        let user = await this.get_user(minimum_user_object);
        user.meta.security.login._fp_value = fp + "";
        user.meta.security.login.fp_passed = true;
        user.meta.security.login = this.update_has_values(user.meta.security.login);

        let updatedUser = await this.update_user({ id: user.id }, user);
        updatedUser = await this.confirm_authenticate(updatedUser);
        return updatedUser;
    }

    // update user security object to set fp
    async confirm_user_fp(minimum_user_object: IUserObject, fp: number) {
        // user exists or not
        const db = new SellinBotDB();
        let user = await this.get_user(minimum_user_object);
        if (user && user.meta.security && user.meta.security.login._fp_value === fp + "") {
            user.meta.security.login.fp_passed = true;
            user.meta.security.login = this.update_has_values(user.meta.security.login);
            let updatedUser = await this.update_user({ id: user.id }, user);
            updatedUser = await this.confirm_authenticate(updatedUser);
            return updatedUser;

        } else {
            user.meta.security.login.fp_passed = false;
            let updatedUser = await this.update_user({ id: user.id }, user);
            return updatedUser;
        }
    }

    // ========= DEVICE
    async set_user_device(minimum_user_object: IUserObject, device: string) {
        // user exists or not
        const db = new SellinBotDB();
        let user = await this.get_user(minimum_user_object);
        user.meta.security.login._device_value = device + "";
        user.meta.security.login.device_passed = true;
        user.meta.security.login = this.update_has_values(user.meta.security.login);
        this.confirm_authenticate(user);
        let updatedUser = await this.update_user({ id: user.id }, user);
        return updatedUser;
    }

    // update user security object to set device
    async confirm_user_device(minimum_user_object: IUserObject, device: number) {
        // user exists or not
        const db = new SellinBotDB();
        let user = await this.get_user(minimum_user_object);
        if (user && user.meta.security && user.meta.security.login._device_value === device + "") {
            user.meta.security.login.device_passed = true;
            user.meta.security.login = this.update_has_values(user.meta.security.login);
            let updatedUser = await this.update_user({ id: user.id }, user);
            updatedUser = await this.confirm_authenticate(updatedUser);
            return updatedUser;

        } else {
            user.meta.security.login.device_passed = false;
            let updatedUser = await this.update_user({ id: user.id }, user);
            return updatedUser;
        }
    }
    //#endregion


    //#region secuiry
    async refresh_security(user: IUserObject) {
        user.meta.security = this.get_user_security(user);
        await this.update_user({ id: user.id }, user);
    }

    get_user_security(user: IUserObject) {
        let security = new DBSecurity(user.meta.security);
        try {
            security = typeof security === "string" ? JSON.parse(security) : security;
        } catch (error) {
            throw new Error("Security string could not be parsed");
        }
        return security;
    }

    update_has_values(login: ILogin) {
        if (login._otp_value) login.has_otp = true;
        if (login._pin_value) login.has_pin = true;
        if (login._fp_value) login.has_fp = true;
        if (login._device_value) login.has_device = true;
        return login;
    }

    should_authenticate(login: ILogin) {
        if (login.fp_passed && login.device_passed) {
            login.authenticated = true;
        }
        if (login.pin_passed && login.otp_passed) {
            login.authenticated = true;
        }
        if (login.fp_passed && login.otp_passed) {
            login.authenticated = true;
        }
        return login;
    }

    //#endregion

    //#region User parser
    parse_user_object(user: IUserObject) {
        try {
            user.meta = this.parse_if_string(user.meta) as any;
            return user;
        } catch (error) {
            console.error(error);
            return user
        }
    }
    parse_user(user: IUserObject) {
        try {
            user.meta.security = this.parse_if_string(user.meta.security) as any;
            user.meta = this.parse_if_string(user.meta) as any;
            user.meta.rapyd_contact_data = this.parse_if_string(user.meta.rapyd_contact_data) as any;
            user.meta.rapyd_wallet_data = this.parse_if_string(user.meta.rapyd_wallet_data) as any;
            return user;
        } catch (error) {
            console.error(error);
            return user
        }
    }

    parse_if_string(str: string | object) {
        let temp = str;
        if (str && typeof str === "string") {
            try {
                temp = JSON.parse(str);
            } catch (error) {
                console.error(error);
                temp = str;
            }
        } else {
            temp = str;
        }
        return temp;
    }
    //#endregion
}