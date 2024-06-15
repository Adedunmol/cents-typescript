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
const agenda_1 = __importDefault(require("agenda"));
const definitions_1 = __importDefault(require("./definitions"));
const logger_1 = __importDefault(require("../utils/logger"));
const agenda = new agenda_1.default({
    name: 'mail queue',
    db: {
        address: process.env.DATABASE_URI,
        collection: 'agendaJobs',
    },
    maxConcurrency: 20,
    processEvery: '1 minute'
});
//check if agenda has started
agenda
    .on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    yield agenda.start();
    logger_1.default.info('Agenda has started');
}))
    .on('error', (err) => logger_1.default.error('Agenda has not started', err));
//need to create the definitions(jobs) before
(0, definitions_1.default)(agenda);
exports.default = agenda;
