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
      if (eti.estado !== 'activo') {
        res.status(500).send('El eti no esta activo');
      }
      let duplicatedDocument = _.find(eti.inscripciones, { 'documento': inscripcion.documento });
      if (duplicatedDocument) {
        res.status(500).send('Ya existe alguien inscripto con ese documento');
        return;
      }
      if (_.filter(eti.inscripciones, (i) => i.estado != 'Vencido').length < eti.capacidad) {
        inscripcion.estado = "Pre inscripto";
        inscripcion.fechaPreInscripcion = new Date();
      } else {
        inscripcion.estado = "En lista de espera";
      }
      updateEti(eti, inscripcion, req, res);
    })
    .catch(err => {
      res.status(500).send('No se encontro el eti');
    })
}

function updateEti(eti, inscripcion, req, res) {
  // eti.inscripciones = [ ...eti.inscripciones,  inscripcion ];
  inscripcion.fechaInscripcion = new Date();
  eti.inscripciones.push(inscripcion);
  eti.save()
    .then(() => {
      if (inscripcion.estado == "Pre inscripto") {
        createUsuarioPreInscripto(eti, inscripcion).then(usuarioCreado => {
          handleUsusarioPreInscripto(eti, inscripcion, usuarioCreado, res);
        },
          error => {
            res.status(500).send('Error al crear el usuario');
          });
      } else {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'inscripciones.mendozeti@gmail.com',
            pass: 'eti23mendozeti'
          }
        });

        // setup email data with unicode symbols
        let mailOptions = {
          from: '"Mendozeti" <foo@blurdybloop.com>', // sender address
          to: req.body.email, // list of receivers
          subject: `Inscripcion Mendozeti ✔ ${inscripcion.nombre} ${inscripcion.apellido}`, // Subject line
          text: '', // plain text body
          html: `
        <b>Tu pre-inscripcion se completó con éxito</b>
        <br>
        <p>Debido a la cantidad de personas que se pre-inscribieron se alcanzó el límite</p>
        <p>has quedado en lista de espera, en cuanto se libere un lugar serás informado vía mail</p>
        <p>No realices ningún depósito y/o transferencia hasta que no te avisemos que ya tenés un lugar y podés hacerlo.</p>
        <p>Podés acceder al listado de inscriptos <a href="http://inscripcioneseti.com/eti/${eti._id}">AQUÍ</a></p>
        `
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
      res.status(500).send('Error al guardar la inscripcion');
    })
}

async function createUsuarioPreInscripto(eti, inscripcion) {
  let inscripcionIndex = _.findIndex(eti.inscripciones, { 'documento': inscripcion.documento });
  inscripcion = eti.inscripciones[inscripcionIndex];
  var usuario = {
    'usuario': inscripcion.documento,
    'password': Math.random().toString(36).slice(-8),
    'eti': eti._id,
    'admin': false,
    'nombre': `${inscripcion.nombre} ${inscripcion.apellido}`,
    'inscripcionId': inscripcion._id
  }

  return User.create(usuario);
}

function handleUsusarioPreInscripto(eti, inscripcion, usuarioCreado, res) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'inscripciones.mendozeti@gmail.com',
      pass: 'eti23mendozeti'
    }
  });
  let alojamiento = inscripcion.alojamiento ? eti.precioAlojamiento : 0;
  let seminario = inscripcion.seminario ? eti.precioSeminario : 0;
  let remera = inscripcion.remera ? eti.precioRemera : 0;
  let totalAPagar = eti.precioCombo + alojamiento + seminario;

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Mendozeti" <inscripciones.mendozeti@gmail.com>', // sender address
    to: inscripcion.email, // list of receivers
    subject: `Confirmación Pre inscripcion Mendozeti ✔ ${inscripcion.nombre} ${inscripcion.apellido}`, // Subject line
    text: '', // plain text body
    html: `
    <h2>YA ESTAS PRE-INSCRIPTO!!! </h2>
    <h3>Pasos a seguir:</h3>
    <p>En el plazo de SIETE (7) DIAS HÁBILES deberás:
    <p>1) hacer el deposito/transferencia en  esta cuenta:</p>

    RESIDENTES EN ARGENTINA
    Bco 191
    Suc 115
    Cta CA $
    Nro Cta. 0182844
    PANNOCCHIA JOSE LUCIANO
    CBU 1910115855111501828449
    ———————
    RESIDENTES EN EL EXTRANJERO
    cta.Bco Credicoop MendozETI.
    Caja Ahorro
    Swiff: "BCOOAABA"
    Nro.Cta. 18233/2
    CBU 1910115855111501828449
    Sucursal: 115
    Domicilio: 9 de Julio 1228-Cdad-Mza.

    <p>2) Envianos el comprobante con estas credenciales: </p>
    <p style="color: red; font-weight: bold;">Usuario:  ${usuarioCreado.usuario}</p>
    <p style="color: red; font-weight: bold;">Contraseña: ${usuarioCreado.password}</p>
    <p>una vez adentro, podrás subir un archivo de tu computadoracon la imagen o pdf del comprobante para completar la INSCRIPCION.
    <p>Entra <a href="http://inscripcioneseti.com/login">AQUÍ</a></p>

    <h3>NO TE OLVIDES!!</h3>
    <p>El comprobante deberas guardarlo y tenerlo al momento de la ACREDITACION en Mendoza.</p>
    <p>Si el deposito corresponde a mas de un inscripto deberas subir nuevamente el comprobante a nombre del/l@s inscript@s. entrando al sistema con las credenciales enviadas al correo para esa persona</p>
    <p>En un plazo de 72 hs. podrás comprobar tu estado de "INSCRIPCION" entrando <a href="http://inscripcioneseti.com/eti/${eti._id}">AQUÍ</a>.</p>
    <p>Tambien podrás enviar el comprobante a inscripciones.mendozeti@gmail.com indicando a quienes corresponde el deposito.</p>


   <p>Tenés que transferir el valor  de:$ ${totalAPagar} </p>
   <p>
   Detalle:
   </p>
   <p>-COMBO: ($${eti.precioCombo}) </p>
   <p>${inscripcion.alojamiento ? '-ALOJAMIENTO: ($' + eti.precioAlojamiento + ')' : ''}</p>
   <p>${inscripcion.seminario ? '-SEMINARIO: ($' + eti.precioSeminario + ')' : ''}</p>
   <p>${inscripcion.remera ? '-REMERA: ($' + eti.precioRemera + ')' : ''}</p>

   <p style="color: red">No te olvides el PLAZO: 7 DIAS desde que enviamos este correo
   para hacer el DEPÓSITO y SUBIR EL COMPROBANTE!!!!</p>
     `

  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json(eti);
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    res.send();
  });
}

export function updateInscripcion(req, res) {
  Eti.findById(req.params.etiId).exec()
    .then(eti => {
      let inscripcionIndex = _.findIndex(eti.inscripciones, { '_id': ObjectId(req.params.inscripcionId) });
      let estadoViejo = eti.inscripciones[inscripcionIndex].estado;
      eti.inscripciones = [
        ...eti.inscripciones.slice(0, inscripcionIndex),
        req.body,
        ...eti.inscripciones.slice(inscripcionIndex + 1)
      ];
      let inscripcionEnEspera;
      if (req.body.estado == 'Vencido' && estadoViejo == 'Pre inscripto') {
        inscripcionEnEspera = _.find(eti.inscripciones, { 'estado': "En lista de espera" });
        if (inscripcionEnEspera) {
          inscripcionEnEspera.estado = 'Pre inscripto';
          inscripcionEnEspera.fechaPreInscripcion = new Date();
        }
      }
      eti.save()
        .then(eti => {
          if (req.body.estado == 'Inscripto' && estadoViejo == 'Pre inscripto') {
            // create reusable transporter object    "nombre": "Verónica",
            let transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'inscripciones.mendozeti@gmail.com',
                pass: 'eti23mendozeti'
              }
            });

            // setup email data with unicode symbols
            let mailOptions = {
              from: '"Mendozeti" <foo@blurdybloop.com>', // sender address
              to: req.body.email, // list of receivers
              subject: `Confirmación Inscripcion Mendozeti ✔ ${req.body.nombre} ${req.body.apellido}`, // Subject line
              text: '', // plain text body
              html: `<b>Inscripcion confirmada</b>
          <p>Ya está todo listo! Te esperamos!</p>
          ` // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                res.json(eti);
                return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
              res.send();
            });
          } else {
            res.send();
          }
        },
        error => res.status(500).send('Error al actualizar inscripcion'));
    },
    error => res.status(500).send('Error al actualizar inscripcion')
    );
}

export function getInscripcion(req, res) {
  Eti.findOne({
    '_id': req.params.etiId
  }).exec()
    .then(eti => {
      var inscripcion = _.find(eti.inscripciones, { '_.id': req.params.inscripcionId });

      res.json(inscripcion);

    })
    .catch(err => {
      res.status(500).send();
    })
}

export function getInscripciones(req, res) {

  Eti.findById(req.params.etiId)
    .then(eti => {
      res.json(eti.inscripciones);
    })
    .catch(err => {
      res.status(500).send();
    })
}

export function deleteInscripcion(req, res) {
  return res.status(500).send('Sin implementar');
}
