import { Eti } from '../eti/eti.model';
import { User } from '../users/user.model';
import * as nodemailer from 'nodemailer';
import * as _ from 'lodash';
import * as mongoose from 'mongoose';
let ObjectId = mongoose.Types.ObjectId

export function createInscripcion(req, res) {
  let inscripcion = req.body;
  Eti.findById(req.params.etiId).exec()
  .then(eti => {
    if(eti.estado !== 'activo') {
      res.status(500);
    }
    if(eti.inscripciones.length < eti.capacidad) {
      inscripcion.estado = "Pre inscripto";
    } else {
      inscripcion.estado = "En lista de espera";
    }
    updateEti(eti, inscripcion, req, res);
  })
  .catch(err => {
    res.status(500);
  })
}

function updateEti(eti, inscripcion, req, res){
  eti.inscripciones = [ ...eti.inscripciones,  inscripcion ];
  eti.save()
  .then(() => {
    if(inscripcion.estado == "Pre inscripto"){
      createUsuarioPreInscripto(eti, inscripcion).then(usuarioCreado => {
        console.log('que onda wacho', usuarioCreado);
        handleUsusarioPreInscripto(eti, inscripcion, usuarioCreado, res);
      });
    }else{
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
    }
  })
  .catch(err => {
    res.status(500);
  })
}

async function createUsuarioPreInscripto(eti, inscripcion){

  var usuario = {
    'usuario': inscripcion.documento,
    'password': '1234',
    'eti': eti._id,
    'admin': false,
    'nombre': `${inscripcion.nombre} ${inscripcion.apellido}`
  }

  return User.create(usuario);
}

function handleUsusarioPreInscripto(eti, inscripcion, usuarioCreado, res){
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
    to: inscripcion.email, // list of receivers
    subject: 'Confirmación inscripción Mendozeti ✔', // Subject line
    text: 'Test', // plain text body
    html: `<b>Inscripcion confirmada</b><br/>
    Se ha creado un nuevo usuario para que puedas subir tu comprobante de pago
    Usuario: ${usuarioCreado.usuario} y contraseña: ${usuarioCreado.password}` // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json(eti);
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    res.send('okeyyyyy');
  });
}

export function updateInscripcion(req, res) {
  Eti.findById(req.params.etiId).exec()
  .then(eti => {
    let inscripcionIndex = _.findIndex(eti.inscripciones, {'_id': ObjectId(req.params.inscripcionId)});
    let estadoViejo = eti.inscripciones[inscripcionIndex].estado;
    eti.inscripciones = [
      ... eti.inscripciones.slice(0, inscripcionIndex),
      req.body,
      ... eti.inscripciones.slice(inscripcionIndex + 1)
    ]
    eti.save()
      .then(eti => {
        console.log('estado viejo', estadoViejo);
        console.log('estado nuevo', req.body.estado);
        if (req.body.estado == 'Inscripto' && estadoViejo == 'Pre inscripto') {
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
          subject: 'Confirmación inscripción Mendozeti ✔', // Subject line
          text: 'Test', // plain text body
          html: `<b>Inscripcion confirmada</b>` // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.send(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
            res.send('okeyyyyy');
        });
      }
    });
  });
}

export function getInscripcion(req, res) {
  Eti.findOne({
    '_id': req.params.etiId
  }).exec()
  .then(eti => {
    var inscripcion = _.find(eti.inscripciones, {'_.id' : req.params.inscripcionId});

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
