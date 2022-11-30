import { Router } from 'express';
import { registerController } from '../controllers/auth.controller';
import { validateResource } from '../middlewares/validateResource';
import { createUserSchema } from '../schema/auth.schema';

const router = Router();

router.use('/register').post(validateResource(createUserSchema), registerController)