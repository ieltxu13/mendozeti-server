"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eti_model_1 = require("./eti.model");
function createEti(req, res) {
    console.log('body', req.body);
    eti_model_1.Eti.create(req.body)
        .then(function (eti) {
        res.status(201).json(eti);
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.createEti = createEti;
function updateEti(req, res) {
    res.status(500).send('Sin implementar');
}
exports.updateEti = updateEti;
function getEti(req, res) {
    eti_model_1.Eti.findById(req.params.etiId)
        .then(function (eti) {
        res.status(200).json(eti);
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.getEti = getEti;
function getEtis(req, res) {
    eti_model_1.Eti.find()
        .then(function (etis) {
        console.log(etis);
        res.status(200).json(etis);
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.getEtis = getEtis;
function deleteEti() {
    return true;
}
exports.deleteEti = deleteEti;
//# sourceMappingURL=eti.controller.js.map