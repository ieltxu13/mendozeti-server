"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var inscripcion_model_1 = require("../inscripcion/inscripcion.model");
exports.EtiSchema = new mongoose_1.Schema({
    createdAt: Date,
    nombre: String,
    estado: String,
    inscripciones: [inscripcion_model_1.Inscripcion.schema]
});
exports.EtiSchema.pre('save', function (next) {
    var now = new Date();
    if (!_this.createdAt) {
        _this.createdAt = now;
    }
    next();
});
exports.Eti = mongoose_1.model('Eti', exports.EtiSchema);
//# sourceMappingURL=eti.model.js.map