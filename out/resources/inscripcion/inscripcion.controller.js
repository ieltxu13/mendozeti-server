"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eti_model_1 = require("../eti/eti.model");
var nodemailer = require("nodemailer");
function createInscripcion(req, res) {
    var inscripcion = req.body;
    eti_model_1.Eti.findById(req.params.etiId).exec()
        .then(function (eti) {
        if (eti.estado !== 'activo') {
            res.status(500);
        }
        if (eti.inscripciones.length < eti.capacidad) {
            inscripcion.estado = "Pre inscripto";
        }
        else {
            inscripcion.estado = "En lista de espera";
        }
        eti.inscripciones = eti.inscripciones.concat([inscripcion]);
        eti.save()
            .then(function () {
            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ieltxu.alganaras@gmail.com',
                    pass: 'B83f3I4wNpHcezlaDdCaobrJ0DrKMy1p62NeF6ZNxB0n3cRv12'
                }
            });
            // setup email data with unicode symbols
            var mailOptions = {
                from: '"Mendozeti" <foo@blurdybloop.com>',
                to: req.body.email,
                subject: 'Inscripcion Mendozeti ✔',
                text: 'Test',
                html: '<b>Test</b>' // html body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.json(eti);
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                res.json(eti);
            });
        })
            .catch(function (err) {
            res.status(500);
        });
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.createInscripcion = createInscripcion;
function updateInscripcion(req, res) {
    return res.status(500).send('Sin implementar');
}
exports.updateInscripcion = updateInscripcion;
function getInscripcion(req, res) {
    eti_model_1.Eti.findOne({
        '_id': req.params.etiId,
        'inscripciones._id': req.params.inscripcionId
    }).exec()
        .then(function (inscripcion) {
        res.json(inscripcion);
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.getInscripcion = getInscripcion;
function getInscripciones(req, res) {
    eti_model_1.Eti.findById(req.params.etiId)
        .then(function (eti) {
        res.json(eti.inscripciones);
    })
        .catch(function (err) {
        res.status(500);
    });
}
exports.getInscripciones = getInscripciones;
function deleteInscripcion(req, res) {
    return res.status(500).send('Sin implementar');
}
exports.deleteInscripcion = deleteInscripcion;
//# sourceMappingURL=inscripcion.controller.js.map