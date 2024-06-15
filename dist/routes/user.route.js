"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const validateResource_1 = __importDefault(require("../middlewares/validateResource"));
const user_schema_1 = require("../schema/user.schema");
const router = (0, express_1.Router)();
router.route('/update').patch((0, validateResource_1.default)(user_schema_1.updateUserSchema), user_controller_1.updateUserController);
exports.default = router;
