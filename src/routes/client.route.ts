import express from 'express';
import { createClientController, getAllClientsController, getClientController, deleteClientController, updateClientController } from '../controllers/client.controller'
import { createInvoiceController, getInvoiceController, getClientInvoicesController, updateInvoiceController } from '../controllers/invoice.controller'
import validateResource from '../middlewares/validateResource';
import { clientSchema, updateClientSchema } from '../schema/client.schema';
import { invoiceSchema } from '../schema/invoice.schema';

const router = express.Router()


router.route('/').get(getAllClientsController).post(validateResource(clientSchema), createClientController)
router.route('/:id').get(getClientController).delete(deleteClientController).patch(validateResource(updateClientSchema), updateClientController)
router.route('/:id/invoices/:invoiceId').get(getInvoiceController).patch(updateInvoiceController)

export default router