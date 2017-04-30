"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.InscripcionSchema = new mongoose_1.Schema({
    createdAt: Date,
    nombre: String,
    apellido: String,
    documento: String,
    pais: String,
    provincia: String,
    ciudad: String,
    email: String,
    telefono1: String,
    telefono2: String,
    tipoComida: String,
    fechaLlegada: String,
    fechaSalida: String,
    estado: String
});
exports.InscripcionSchema.pre('save', function (next) {
    var now = new Date();
    if (!_this.createdAt) {
        _this.createdAt = now;
    }
    next();
});
exports.Inscripcion = mongoose_1.model('Inscripcion', exports.InscripcionSchema);
//# sourceMappingURL=inscripcion.model.js.map