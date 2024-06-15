"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_controller_1 = require("../controllers/invoice.controller");
const invoice_schema_1 = require("../schema/invoice.schema");
const validateResource_1 = __importDefault(require("../middlewares/validateResource"));
const router = express_1.default.Router();
router.route('/').get(invoice_controller_1.getAllInvoicesController).post((0, validateResource_1.default)(invoice_schema_1.invoiceSchema), invoice_controller_1.createInvoiceController);
router.route('/:clientId').get(invoice_controller_1.getClientInvoicesController);
router.route('/:id/send').post(invoice_controller_1.sendInvoiceToClientController);
exports.default = router;
