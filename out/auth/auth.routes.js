"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var authController = require("./auth.controller");
exports.authRoutes = express.Router();
exports.authRoutes.post('/authenticate', authController.authenticate);
//# sourceMappingURL=auth.routes.js.map