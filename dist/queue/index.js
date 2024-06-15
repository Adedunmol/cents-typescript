"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = exports.redisConnOptions = void 0;
const ioredis_1 = require("ioredis");
exports.redisConnOptions = {
    host: 'localhost',
    port: 6379,
    password: '' // process.env.REDIS_PASSWORD,
};
exports.connection = process.env.ENVIRONMENT === 'production' ? new ioredis_1.Redis(process.env.REDIS_URL) : exports.redisConnOptions;
