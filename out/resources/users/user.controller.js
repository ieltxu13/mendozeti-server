"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var user_model_1 = require("./user.model");
function createUser(req, res) {
    user_model_1.User.create(req.body)
        .then(function (user) {
        res.status(201).json(user);
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.createUser = createUser;
function updateUser(req, res) {
    res.status(500).send('Sin implementar');
}
exports.updateUser = updateUser;
function getUser(req, res) {
    Eti.findById(req.params.userId)
        .then(function (eti) {
        res.status(200).json(eti);
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.getUser = getUser;
function getUsers(req, res) {
    user_model_1.User.find()
        .then(function (users) {
        console.log(etis);
        res.status(200).json(users);
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.getUsers = getUsers;
function deleteUser() {
    return true;
}
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.controller.js.map