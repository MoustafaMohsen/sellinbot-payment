"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var server_init_1 = __importDefault(require("./server/core/server-init"));
try {
    var server = new server_init_1.default();
    server.init();
    console.log("===Envs===");
    console.log(process.env.DATABASE_URL);
    console.log(process.env.DATABASE_USER);
    console.log(process.env.DATABASE_PASSWORD);
    console.log(process.env.DATABASE_HOST);
    console.log(process.env.DATABASE_NAME);
}
catch (error) {
    console.log(error);
}
//# sourceMappingURL=index.js.map