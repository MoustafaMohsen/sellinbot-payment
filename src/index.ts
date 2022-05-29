import { config } from "dotenv";
config();

import SellinBotServer from "./server/core/server-init";

try {
    const server = new SellinBotServer();
    server.init();
    console.log("===Envs===");
    console.log(process.env.DATABASE_URL)
    console.log(process.env.DATABASE_USER)
    console.log(process.env.DATABASE_PASSWORD)
    console.log(process.env.DATABASE_HOST)
    console.log(process.env.DATABASE_NAME)
         
} catch (error) {
    console.log(error);
    
}