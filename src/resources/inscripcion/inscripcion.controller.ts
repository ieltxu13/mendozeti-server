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
  // eti.inscripciones = [ ...eti.inscripciones,  inscripcion ];
  inscripcion.fechaInscripcion = new Date();
  eti.inscripciones.push(inscripcion);
  eti.save()
  .then(() => {
    if(inscripcion.estado == "Pre inscripto"){
      createUsuarioPreInscripto(eti, inscripcion).then(usuarioCreado => {
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
        text: '', // plain text body
        html: `
        <b>Tu pre-inscripcion se completó con éxito</b>
        <br>
        <p>Debido a la cantidad de personas que se pre-inscribieron alcanzó la capaciad,</p>
        <p>has quedado en lista de espera, en cuanto se libere un lugar serás informado vía mail</p>
        `      };

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
  let inscripcionIndex = _.findIndex(eti.inscripciones, {'documento': inscripcion.documento});
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
    from: '"Mendozeti" <inscripciones.mendozeti@gmail.com>', // sender address
    to: inscripcion.email, // list of receivers
    subject: 'Confirmación Pre inscripcion Mendozeti ✔', // Subject line
    text: '', // plain text body
    html: `<b>Ya estás preinscripto</b><br/>
    <h2>YA ESTAS PRE-INSCRIPTO!!! </h2>
    En el plazo de SIETE (7) DIAS HÁBILES  desde que recibiste este correo deberás
    hacer el deposito/transferencia  en  esta cuenta y SUBIR EL COMPROBANTE A TRAVES
    DE LA PÁGINA www.etitango.com O ENVIARNOSLO POR EMAIL A inscripciones.mendozeti@gmail.com
     (dentro del mismo plazo):<br>
    <br>
    RESIDENTES EN ARGENTINA <br>
    Bco 191 <br>
    Suc 115 <br>
    Cta CA $ <br>
    Nro Cta. 0176685 <br>
    MuñozJorge Leandro <br>
    CBU 1910115855111501766853 <br>
    ——————— <br>
    RESIDENTES EN EL EXTRANJERO<br>
    cta.Bco Credicoop MendozETI.<br>
    Caja Ahorro<br>
    Swiff: "BCOOAABA"<br>
    Nro.Cta. 17668/5<br>
    CBU: 1910115855111501766853<br>
    Sucursal: 115<br>
    Domicilio: 9 de Julio 1228-Cdad-Mza.<br>
    <br>

     Tenés que transferir el valor  del combo ($650) y si queres asegurarte el seminario y el alojamiento podrás agregar el valor de estos  OPCIONALES (seminario y/o alojamiento x 3 noches)<br>
    a) COMBO: el valor del COMBO $650 <br>
    b) OPCIONAL 1 SEMINARIO de OLGA BESIO: $40 (CUPO 100 personas por cada seminario) <br>
    c) OPCIONAL 2 ALOJAMIENTO ESCUELA HOGAR:  $465 (OPCIONAL  - CUPO 400 PLAZAS) <br>
    <br>
    <p>ENVIANOS EL  COMPROBANTE:   Entrá en www.etitango.com , abrí el menú “Inscripciones MendozETI” y entra en la pestaña “SUBIR COMPROBANTE” y envianos la imagen del comprobante para completar la INSCRIPCION. En un plazo de 72 hs. podrás comprobar tu estado de “inscripto”.  El comprobante deberas guardarlo y tenerlo al momento de la ACREDITACION en Mendoza
    Atencion! Si el deposito corresponde a mas de un inscripto deberas subir nuevamente el comprobante a nombre del/l@s inscript@s </p>
    <br>
    <p style="color: red">No te olvides el PLAZO: 7 DIAS desde que enviamos este correo
     para hacer el DEPÓSITO y SUBIR EL COMPROBANTE!!!!</p>

    Se ha creado un nuevo usuario para que puedas subir tu comprobante de pago
    Usuario: ${usuarioCreado.usuario} y contraseña: ${usuarioCreado.password}`
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
    let inscripcionIndex = _.findIndex(eti.inscripciones, {'_id': ObjectId(req.params.inscripcionId)});
    let estadoViejo = eti.inscripciones[inscripcionIndex].estado;
    eti.inscripciones = [
      ... eti.inscripciones.slice(0, inscripcionIndex),
      req.body,
      ... eti.inscripciones.slice(inscripcionIndex + 1)
    ]
    eti.save()
      .then(eti => {
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
          html: `<b>Inscripcion confirmada</b>
          <p>Ya está todo listo! Te esperamos!</p>
          ` // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.send(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
            res.send();
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
