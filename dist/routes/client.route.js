"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_controller_1 = require("../controllers/client.controller");
const invoice_controller_1 = require("../controllers/invoice.controller");
const validateResource_1 = __importDefault(require("../middlewares/validateResource"));
const client_schema_1 = require("../schema/client.schema");
const router = express_1.default.Router();
router.route('/').get(client_controller_1.getAllClientsController).post((0, validateResource_1.default)(client_schema_1.clientSchema), client_controller_1.createClientController);
router.route('/:id').get(client_controller_1.getClientController).delete(client_controller_1.deleteClientController).patch((0, validateResource_1.default)(client_schema_1.updateClientSchema), client_controller_1.updateClientController);
router.route('/:id/invoices/:invoiceId').get(invoice_controller_1.getInvoiceController).patch(invoice_controller_1.updateInvoiceController);
exports.default = router;
