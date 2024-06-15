"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = __importDefault(require("./handlers"));
const mailDefinition = (agenda) => __awaiter(void 0, void 0, void 0, function* () {
    agenda.define('send-mail-on-due-date', handlers_1.default.sendMailOnDueDate);
    agenda.define('send-reminder-mails', handlers_1.default.sendReminderMails);
});
const definitions = [mailDefinition];
const allDefinitions = (agenda) => {
    definitions.forEach((definition) => definition(agenda));
};
exports.default = allDefinitions;
