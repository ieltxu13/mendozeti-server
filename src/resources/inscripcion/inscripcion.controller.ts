import { Eti } from '../eti/eti.model';
import * as nodemailer from 'nodemailer';

export function createInscripcion(req, res) {
  Eti.findById(req.params.etiId).exec()
  .then(eti => {
    if(eti.estado !== 'activo') {
      res.status(500);
    }
    eti.inscripciones = [ ...eti.inscripciones,  req.body ];
    eti.save()
    .then(() => {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ieltxu.alganaras@gmail.com',
          pass: 'B83f3I4wNpHcezlaDdCaobrJ0DrKMy1p62NeF6ZNxB0n3cRv12'
        }
      });

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Mendozeti" <foo@blurdybloop.com>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Inscripcion Mendozeti ✔', // Subject line
        text: 'Test', // plain text body
        html: '<b>Test</b>' // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.json(eti);
          return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.json(eti);
      });

    })
    .catch(err => {
      res.status(500);
    })
  })
  .catch(err => {
    res.status(500);
  })
}

export function updateInscripcion(req, res) {
  return res.status(500).send('Sin implementar');
}

export function getInscripcion(req, res) {
  Eti.findOne({
    '_id': req.params.etiId,
    'inscripciones._id': req.params.inscripcionId
  }).exec()
  .then(inscripcion => {
    res.json(inscripcion);
  })
  .catch(err => {
    res.status(500);
  })
}

export function getInscripciones(req, res) {

  Eti.findById(req.params.etiId)
  .then(eti => {
    res.json(eti.inscripciones);
  })
  .catch(err => {
    res.status(500);
  })
}

export function deleteInscripcion(req, res) {
  return res.status(500).send('Sin implementar');
}
