"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSchema = void 0;
const zod_1 = require("zod");
const serviceSchema = (0, zod_1.object)({
    item: (0, zod_1.string)(),
    rate: (0, zod_1.number)(),
    hours: (0, zod_1.number)(),
    paid: (0, zod_1.boolean)().optional()
});
exports.invoiceSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        clientId: (0, zod_1.string)({ required_error: "clientId is required" }),
        services: (0, zod_1.array)(serviceSchema),
        dueDate: (0, zod_1.string)({ required_error: "dueDate is required" }),
        frequency: (0, zod_1.number)({ required_error: "frequency is required" }),
        interval: (0, zod_1.string)({ required_error: "interval is required" })
    })
});
