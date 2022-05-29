import { Client, ClientConfig, QueryConfig, QueryResult } from "pg";

export class SellinBotDB {
    dbsettings: ClientConfig = {
        // connectionString: process.env.DATABASE_URL,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        port:parseInt(process.env.DATABASE_PORT)
    }
    amIChecked = false;
    constructor(opts?: { host?: string; user?: string; password?: string; port?: number; database?}) {
        this.dbsettings = { ...this.dbsettings, ...(opts as any) };
    }

    async setupDb() {
        const client = await this.connect();
        await this.create_user_tabel(client);
        await client.end();
        console.log("DB is ready");
        return
    }

    async create_index(client: Client, tablename, columnname) {
        const query = `CREATE INDEX idx_${tablename}_${columnname} 
        ON ${tablename}(${columnname});`
        return await client.query(query);
    }



    async connect(database?) {
        const set = database ? { ...this.dbsettings, database } : this.dbsettings;
        const client = new Client(set);
        await client.connect();
        return client;
    }


    async createDB(client: Client, dbname = "sellinbotdb") {
        await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${dbname}'
        AND pid <> pg_backend_pid();`)
        await client.query("DROP DATABASE IF EXISTS " + dbname + ";")
        const query = `CREATE DATABASE ${dbname}`
        let result = await client.query(query);
        return result;
    }

    // ======= Create Tables
    async create_user_tabel(client: Client, tablename = "checkouts") {
        await client.query("DROP TABLE IF EXISTS " + tablename + ";")
        let result = await client.query(`CREATE TABLE IF NOT EXISTS ${tablename} (
            id SERIAL PRIMARY KEY,
            checkout_id VARCHAR ( 255 ),
            meta TEXT,
            timestamp timestamp default current_timestamp
);`)
        return result;
    }
    // Create Tables =======

    async insertRows(tabelname, client: Client, cols: string[], values: string[][]) {
        const queries = this.create_multiple_insert_queries(tabelname, cols, values);
        // callback
        let done = 0;
        new Promise((resolve, reject) => {
            for (let i = 0; i < queries.length; i++) {
                const q = queries[i];
                // promsies.push(client.query(q));
                client.query(q).then((results) => {
                    let t = q;
                    // console.log(q); 
                    done++;
                    if (done == queries.length) {
                        resolve(true);
                    }

                },
                    (err) => {
                        console.error(err);
                        console.log(q);
                        reject(err)
                    })
            }
        })
        // return Promise.all(promsies)
        // return Promise.resolve

    }

    create_multiple_insert_queries(tabelname, cols: string[], values_array: string[][]) {
        const queries: QueryConfig[] = [];
        for (let i = 0; i < values_array.length; i++) {
            const values = values_array[i]
            const query = this.create_insert_query(tabelname, cols, values);
            queries.push(query);
        }
        return queries;
    }

    // ========== Query helpers

    create_select_query(tablename, cols: string[] | string, values: {}, relation: "OR" | "AND"): QueryConfig {
        let equals_keys = Object.keys(values);
        let equals = Object.values(values);
        let _tmp_keys = equals_keys ? "WHERE " : "";
        for (let i = 0; i < equals_keys.length; i++) {
            const key = equals_keys[i];
            const value = values[key];
            _tmp_keys = _tmp_keys + key + `=$${i + 1} ` + (i != equals_keys.length - 1 ? relation : "");
        }
        let _tmp_cols = cols ? typeof cols == "string" ? cols : cols.join(", ") : "*";
        const query = {
            text: `SELECT  ${_tmp_cols} FROM ${tablename} ${_tmp_keys}`,
            values: equals
        }
        return query;
    }
    create_delete_query(tablename, cols: string[] | string, values: {}, relation: "OR" | "AND"): QueryConfig {
        let equals_keys = Object.keys(values);
        let equals = Object.values(values);
        let _tmp_keys = equals_keys ? "WHERE " : "";
        for (let i = 0; i < equals_keys.length; i++) {
            const key = equals_keys[i];
            const value = values[key];
            _tmp_keys = _tmp_keys + key + `=$${i + 1} ` + (i != equals_keys.length - 1 ? relation : "");
        }
        let _tmp_cols = cols ? typeof cols == "string" ? cols : cols.join(", ") : "*";
        const query = {
            text: `DELETE  ${_tmp_cols} FROM ${tablename} ${_tmp_keys}`,
            values: equals
        }
        return query;
    }

    create_insert_query(tabelname, cols: string[], values: string[], returnedField = "id"): QueryConfig {
        let _tmp_cols_arr = [];
        for (let i = 0; i < cols.length; i++) {
            _tmp_cols_arr.push("$" + (i + 1));
        }
        let _tmp_val_replace = _tmp_cols_arr.join(", ");
        let _tmp_cols = cols.map(d => d.replace("'", "''")).join(", ");
        let returnQuery = returnedField?" RETURNING "+returnedField:"";
        const query = {
            text: `INSERT INTO ${tabelname} (${_tmp_cols}) VALUES(${_tmp_val_replace}) `+ returnQuery,
            values
        }
        return query;
    }

    create_update_query(tabelname, object: object, condition, relation: "OR" | "AND" = "AND"): QueryConfig {

        let equals_keys = Object.keys(object);
        let equals = Object.values(object);
        let _set_string = "";
        var last = 0;
        for (let i = 0; i < equals_keys.length; i++) {
            const key = equals_keys[i];
            const value = object[key];
            _set_string = _set_string + key + `=$${i + 1} ` + (i != equals_keys.length - 1 ? ", " : "");
            last = i;
        }
        last++;

        let cond_keys = Object.keys(condition);
        let cond = Object.values(condition);
        let _where_string = cond_keys ? "WHERE " : "";
        for (let i = 0; i < cond_keys.length; i++) {
            const key = cond_keys[i];
            const value = condition[key];
            _where_string = _where_string + key + `=$${i + 1 + last} ` + (i != cond_keys.length - 1 ? relation + " " : "");
        }

        const query = {
            text: `UPDATE ${tabelname} SET ${_set_string} ${_where_string}`,
            values: equals.concat(cond)
        }
        return query;
    }

    // Query helpers ==========

    /**
     * @deprecated
     * @param cols 
     * @param values 
     * @returns 
     */
    _createOneInsertQuery(cols: string[], values: string[][]) {

        let _tmp_values_arr = [];
        for (let i = 0; i < values.length; i++) {
            _tmp_values_arr.push("$" + (i + 1));
        }
        let _tmp_cols = cols.map(d => "'" + d.replace("'", "\\'") + "'").join(", ");
        let _values = values.map((v) => {
            return "(" + v.map(d => "'" + d.replace("'", "\\'") + "'").join(", ") + ")"
        }).join(", ")
        const query = `INSERT INTO users(${_tmp_cols}) VALUES(${_values})`
        return query;
    }

    async insert_object(data: object, tabelname, dbname = "sellinbotdb") {
        let keys = Object.keys(data);
        let values = Object.values(data);
        const query = this.create_insert_query(tabelname, keys, values);
        const client = await this.connect(dbname);
        let result = await client.query(query);
        await client.end();
        return result;
    }

    async update_object<T = any>(data: object, condition: object, tabelname, dbname = "sellinbotdb") {
        const query = this.create_update_query(tabelname, data, condition);
        const client = await this.connect(dbname);
        let result = await client.query<T>(query);
        await client.end();
        return result;
    }

    async get_object<T = any>(data: object, relation: "OR" | "AND", tabelname, dbname = "sellinbotdb") {
        let keys = Object.keys(data)[0];
        let values = Object.values(data)[0];
        const query = this.create_select_query(tabelname, keys, values, relation);
        const client = await this.connect(dbname);
        let result = await client.query<T>(query);
        await client.end();
        return result;
    }

    async delete_object<T = any>(data: object, relation: "OR" | "AND", tabelname, dbname = "sellinbotdb") {
        let keys = Object.keys(data)[0];
        let values = Object.values(data)[0];
        const query = this.create_delete_query(tabelname, keys, values, relation);
        const client = await this.connect(dbname);
        let result = await client.query<T>(query);
        await client.end();
        return result;
    }

}