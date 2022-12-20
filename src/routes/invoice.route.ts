import express from 'express';
import { getAllInvoicesController } from '../controllers/invoice.controller';

const router = express.Router()


router.route('/').get(getAllInvoicesController)


export default router