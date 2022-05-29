import SellinBotServerRoutes from '../server-routes';


export default class SellinBotServer extends SellinBotServerRoutes {

    init() {
        this.setupMiddleware();
        this.setupRoute();
        this.listen();
    }
}