import { Router } from 'express';
import { loginController, logoutController, refreshTokenController, registerController } from '../controllers/auth.controller';
import validateResource from '../middlewares/validateResource';
import { createUserSchema, loginSchema } from '../schema/auth.schema';

const router = Router();

router.route('/register').post(validateResource(createUserSchema), registerController)
router.route('/login').post(validateResource(loginSchema), loginController)
router.route('/refresh-token').get(refreshTokenController)
router.route('/logout').get(logoutController)

export default router;