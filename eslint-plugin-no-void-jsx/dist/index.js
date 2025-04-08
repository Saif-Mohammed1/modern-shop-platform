"use strict";
let __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const no_bad_event_handlers_1 = __importDefault(require("./rules/no-bad-event-handlers"));
module.exports = {
    rules: {
        "no-bad-event-handlers": no_bad_event_handlers_1.default,
    },
};
