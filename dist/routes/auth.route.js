"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validateResource_1 = __importDefault(require("../middlewares/validateResource"));
const auth_schema_1 = require("../schema/auth.schema");
const router = (0, express_1.Router)();
router.route('/register').post((0, validateResource_1.default)(auth_schema_1.createUserSchema), auth_controller_1.registerController);
router.route('/login').post((0, validateResource_1.default)(auth_schema_1.loginSchema), auth_controller_1.loginController);
router.route('/refresh-token').get(auth_controller_1.refreshTokenController);
router.route('/logout').get(auth_controller_1.logoutController);
router.route("/verify-otp").post((0, validateResource_1.default)(auth_schema_1.verifyOTPSchema), auth_controller_1.verifyOtpController);
router.route("/resend-otp").post((0, validateResource_1.default)(auth_schema_1.resendOTPSchema), auth_controller_1.resendOTPController);
router.route("/forgot-password").post((0, validateResource_1.default)(auth_schema_1.forgotPasswordSchema), auth_controller_1.resetPasswordRequestController);
router.route("/reset").patch((0, validateResource_1.default)(auth_schema_1.resetPasswordSchema), auth_controller_1.resetPasswordController);
exports.default = router;
