"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var etiController = require("./eti.controller");
var inscripcion_routes_1 = require("../inscripcion/inscripcion.routes");
exports.etiRoutes = express.Router();
exports.etiRoutes.use('/:etiId/inscripcion', inscripcion_routes_1.inscripcionRoutes);
exports.etiRoutes.post('/', etiController.createEti);
exports.etiRoutes.put('/:etiId', etiController.updateEti);
exports.etiRoutes.get('/:etiId', etiController.getEti);
exports.etiRoutes.get('/', etiController.getEtis);
//# sourceMappingURL=eti.routes.js.map