import express from 'express';
import { getAllInvoicesController, getClientInvoicesController, createInvoiceController, sendInvoiceToClientController } from '../controllers/invoice.controller';
import { invoiceSchema } from '../schema/invoice.schema';
import validateResource from '../middlewares/validateResource';

const router = express.Router()


router.route('/').get(getAllInvoicesController).post(validateResource(invoiceSchema), createInvoiceController)
router.route('/:clientId').get(getClientInvoicesController)
router.route('/:id/send').post(sendInvoiceToClientController)

export default router