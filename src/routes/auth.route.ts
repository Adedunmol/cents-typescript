import { Router } from 'express';
import { loginController, logoutController, refreshTokenController, registerController, verifyOtpController, resendOTPController, resetPasswordController, resetPasswordRequestController } from '../controllers/auth.controller';
import validateResource from '../middlewares/validateResource';
import { createUserSchema, loginSchema, verifyOTPSchema, resendOTPSchema, forgotPasswordSchema, resetPasswordSchema } from '../schema/auth.schema';

const router = Router();

router.route('/register').post(validateResource(createUserSchema), registerController)
router.route('/login').post(validateResource(loginSchema), loginController)
router.route('/refresh-token').get(refreshTokenController)
router.route('/logout').get(logoutController)
router.route("/verify-otp").post(validateResource(verifyOTPSchema), verifyOtpController)
router.route("/resend-otp").post(validateResource(resendOTPSchema), resendOTPController)
router.route("/forgot-password").post(validateResource(forgotPasswordSchema), resetPasswordRequestController)
router.route("/reset").patch(validateResource(resetPasswordSchema), resetPasswordController)

export default router;