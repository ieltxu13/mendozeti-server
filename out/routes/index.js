"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var eti_routes_1 = require("../resources/eti/eti.routes");
var user_routes_1 = require("../resources/users/user.routes");
var index = express_1.Router();
index.use('/eti', eti_routes_1.etiRoutes);
index.use('/users', user_routes_1.userRoutes);
exports.default = index;
//# sourceMappingURL=index.js.map