"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
    createdAt: Date,
    nombre: String,
    usuario: String,
    password: String,
    eti: String,
    admin: Boolean
});
exports.UserSchema.pre('save', function (next) {
    var now = new Date();
    if (!_this.createdAt) {
        _this.createdAt = now;
    }
    next();
});
exports.User = mongoose_1.model('User', exports.UserSchema);
//# sourceMappingURL=user.model.js.map