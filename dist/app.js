"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverAdapter = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const response_time_1 = __importDefault(require("response-time"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const verifyJWT_1 = require("./middlewares/verifyJWT");
const connect_db_1 = require("./config/connect-db");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const invoice_route_1 = __importDefault(require("./routes/invoice.route"));
const client_route_1 = __importDefault(require("./routes/client.route"));
const route_not_found_1 = require("./middlewares/route-not-found");
const error_handler_1 = require("./middlewares/error-handler");
const events_1 = __importDefault(require("./events/"));
const metrics_1 = require("./utils/metrics");
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const express_2 = require("@bull-board/express");
const producer_1 = require("./queue/producer");
const yamljs_1 = __importDefault(require("yamljs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
//@ts-ignore
const xss_clean_1 = __importDefault(require("xss-clean"));
const app = (0, express_1.default)();
// emailJobEvents.on('send-reminder-mails', async (data: emailData) => {
//     await schedule.reminderMails(data.invoice._id)
// })
// emailJobEvents.on('dueMail', async (data: emailData) => {
//     console.log('due email has been emitted')
//     await schedule.dueDateMail(data.invoice._id, data.dueDate)
// })
exports.serverAdapter = new express_2.ExpressAdapter();
const bullBoard = (0, api_1.createBullBoard)({
    queues: [new bullMQAdapter_1.BullMQAdapter(producer_1.emailQueue), new bullMQAdapter_1.BullMQAdapter(producer_1.invoiceQueue)],
    serverAdapter: exports.serverAdapter
});
exports.serverAdapter.setBasePath('/bull-board');
app.set('emailJobEvents', events_1.default);
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
(0, connect_db_1.connectDB)(process.env.DATABASE_URI);
app.use((0, response_time_1.default)((req, res, time) => {
    var _a;
    if ((_a = req === null || req === void 0 ? void 0 : req.route) === null || _a === void 0 ? void 0 : _a.path) {
        metrics_1.restResponseTimeHistogram.observe({
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode
        }, time * 1000);
    }
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, xss_clean_1.default)());
const docsPath = path_1.default.join(__dirname, '..', 'swagger.yaml');
const swaggerDocument = yamljs_1.default.load(docsPath);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.get('/', (req, res) => {
    const docs = req.protocol + '://' + req.get('host') + '/api-docs';
    return res.status(200).json({ status: 'success', message: '', data: { docs } });
});
app.use('/bull-board', exports.serverAdapter.getRouter());
app.get('/', (req, res) => {
    return res.send('hello');
});
app.use('/api/v1/auth', auth_route_1.default);
app.use(verifyJWT_1.verifyJWT);
app.use('/api/v1/users/', user_route_1.default);
app.use('/api/v1/clients', client_route_1.default);
app.use('/api/v1/invoices', invoice_route_1.default);
app.use(route_not_found_1.routeNotFound);
app.use(error_handler_1.errorHandler);
exports.default = app;
