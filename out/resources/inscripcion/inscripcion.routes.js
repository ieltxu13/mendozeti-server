"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var inscripcionController = require("./inscripcion.controller");
exports.inscripcionRoutes = express.Router({ mergeParams: true });
exports.inscripcionRoutes.post('/', inscripcionController.createInscripcion);
exports.inscripcionRoutes.put('/:inscripcionId', inscripcionController.updateInscripcion);
exports.inscripcionRoutes.get('/:inscripcionId', inscripcionController.getInscripcion);
exports.inscripcionRoutes.get('/', inscripcionController.getInscripciones);
exports.inscripcionRoutes.delete('/:inscripcionId', inscripcionController.deleteInscripcion);
//# sourceMappingURL=inscripcion.routes.js.map