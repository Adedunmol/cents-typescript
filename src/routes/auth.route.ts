import { Router } from 'express';
import { registerController } from '../controllers/auth.controller';
import validateResource from '../middlewares/validateResource';
import { createUserSchema } from '../schema/auth.schema';

const router = Router();

router.route('/register').post(validateResource(createUserSchema), registerController)

export default router;