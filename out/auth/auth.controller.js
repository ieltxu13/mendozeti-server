"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var user_model_1 = require("../resources/users/user.model");
var jwt = require("jsonwebtoken");
function authenticate(req, res) {
    user_model_1.User.findOne({ 'usuario': req.body.usuario }).exec()
        .then(function (user) {
        console.log(user.password == req.body.password);
        if (user.password == req.body.password) {
            var token = jwt.sign({
                nombre: user.nombre
            }, 'secret');
            res.json(token);
        }
        else {
            res.status(401);
        }
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.authenticate = authenticate;
//# sourceMappingURL=auth.controller.js.map