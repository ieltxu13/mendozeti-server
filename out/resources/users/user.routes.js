"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var userController = require("./user.controller");
exports.userRoutes = express.Router();
exports.userRoutes.post('/', userController.createUser);
exports.userRoutes.get('/:userId', userController.getUser);
exports.userRoutes.get('/', userController.getUsers);
//# sourceMappingURL=user.routes.js.map