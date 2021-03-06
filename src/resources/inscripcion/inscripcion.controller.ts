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
  eti.inscripciones.push(inscripcion);
  eti.save()
    .then(() => {
      if (inscripcion.estado == "Pre inscripto") {
        inscripcion.fechaPreInscripcion = new Date();
        createUsuarioPreInscripto(eti, inscripcion).then(usuarioCreado => {
          handleUsusarioPreInscripto(eti, inscripcion, usuarioCreado, res);
        },
          error => {
            res.status(500).send('Error al crear el usuario');
          });
      } else {
        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport({
              service: 'Outlook365', // Office 365 server
              auth: {
                  user: 'mendozeti@inscripcioneseti.com',
                  pass: '%9PDRwXyEXdKD%v0'
              }
          });

        // setup email data with unicode symbols
        let mailOptions = {
          from: '"Mendozeti" <mendozeti@inscripcioneseti.com>', // sender address
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

export function reenviarMail(req, res) {

  Eti.findById(req.params.etiId).exec()
    .then(eti => {
      let inscripcion = _.find(eti.inscripciones, { '_id': ObjectId(req.params.inscripcionId) });
      User.findOne({ usuario: inscripcion.documento })
      .then((usuarioCreado:any) => {
        var transporter = nodemailer.createTransport({
              service: 'Outlook365', // Office 365 server
              auth: {
                  user: 'mendozeti@inscripcioneseti.com',
                  pass: '%9PDRwXyEXdKD%v0'
              }
          });
        let alojamiento = inscripcion.alojamiento ? eti.precioAlojamiento : 0;
        let seminario = inscripcion.seminario ? eti.precioSeminario : 0;
        let remera = inscripcion.remera ? eti.precioRemera : 0;
        let totalAPagar = eti.precioCombo + alojamiento + seminario + remera;

        // setup email data with unicode symbols
        let mailOptions = {
          from: '"Mendozeti" <mendozeti@inscripcioneseti.com>', // sender address
          to: inscripcion.email, // list of receivers
          subject: `Confirmación Pre inscripcion Mendozeti ✔ ${inscripcion.nombre} ${inscripcion.apellido}`, // Subject line
          text: '', // plain text body
          html: `
          <h4>YA ESTAS PRE-INSCRIPTO!!! :) …. pero te faltan dos pasos más, el pago y subir el comprobante del mismo … Tenés que hacer así:</h4>

          <p>1) <b>PAGO:</b> Hacé la transferencia o depósito en la cuenta bancaria del ETI</p>

          <li>Desde Argentina</li>
          <b>Al banco Credicoop (191) Suc. Mendoza (115) Cta CA $ Nro 0182844</b>
          <b>Titular PANNOCCHIA JOSE LUCIANO</b>
          <b>CUIL: 20121870100</b>
          <b>CBU 1910115855111501828449</b>
          ———————
          <li>Desde OTRO PAIS</li>
          <b>Caja Ahorro Swiff: "BCOOAABA"</b>
          <b>Nro.Cta. 0182844   -   CBU 1910115855111501828449</b>
          <b>Sucursal: 115 - Domicilio: 9 de Julio 1228-Cdad-Mza.</b>

          <p>2) <b>SUBIR COMPROBANTE.</b> Ahora tenés que SUBIR AL SISTEMA una imagen del comprobante de pago y los datos de referencia para individualizar los pagos del                     depósito. <b>El depósito</b> debe ser por el combo y <b>podrás incluir  en el mismo depósito, LOS OPCIONALES que elegiste al inscribirte (seminario y/o remera y/o alojamiento)</b></p>
          <p>Estas son tus CREDENCIALES (usuario dni y clave generada por sistema) para ingresar al SISTEMA.</p>
          <p style="color: red; font-weight: bold;">Usuario:  ${usuarioCreado.usuario}</p>
          <p style="color: red; font-weight: bold;">Contraseña: ${usuarioCreado.password}</p>
          <p><b>Una vez en que hiciste el deposito podes entrar al SISTEMA y SUBIR COMPROBANTE haciendo click …. </b><a href="http://inscripcioneseti.com/login">AQUÍ</a></p>
      <br>
          <p><b>Tenés un plazo 7 días hábiles para subir el comprobante, si no lo haces tu solicitud de inscripción  quedará sin efecto y deberas inscribirte nuevamente.</b></p>

          <h3>IMPORTANTE LEER AQUÍ!!</h3>
          <ul>
          <li>La inscripción es PERSONAL e INTRANSFERIBLE y por SISTEMA. No compres combos a nadie. Si te arrepentiste o no podés  participar del ETI podes renunciar a tu inscripción y te devolveremos dinero.</li>
          <li>Si el depósito corresponde a más de un solicitante, cada uno deberá subir el comprobante al SISTEMA, entrando con las credenciales de usuario y contraseña que recibió en el CORREO que le enviamos y tiene en SU CASILLA DE MAILS (la dirección de mail que puso en el formulario)</li>
          <li>No olviden que tienen SIETE DIAS HABILES PARA SUBIR EL COMPROBANTE  DEL PAGO (imagen jpg) al SISTEMA , SI NO LO HACEN LA INSCRIPCIÓN SE CAE AUTOMATICAMENTE  Y DEBERÁN INICIAR EL PROCESO DE INSCRIPCION NUEVAMENTE!!!</li>
          <li>Costos</li>
          </ul>

         <p>Tenés que transferir el valor  de:$ ${totalAPagar} </p>
         <p>
         Detalle:
         </p>
         <p>-COMBO: ($${eti.precioCombo}) </p>
         <p>${inscripcion.alojamiento ? '-ALOJAMIENTO: ($' + eti.precioAlojamiento + ')' : ''}</p>
         <p>${inscripcion.seminario ? '-SEMINARIO: ($' + eti.precioSeminario + ')' : ''}</p>
         <p>${inscripcion.remera ? '-REMERA: ($' + eti.precioRemera + ')' : ''}</p>

         PREGUNTAS Y DUDAS? … escribimos a mendozeti@gmail.com
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
      },
      error => {
        console.log(error);
        res.status(500).send('Error al reenviar mail')
      });
    },
    error => {
      console.log(error);
      res.status(500).send('Error al reenviar mail');
    });
}

export function mailAvisoVencimiento(req, res) {
  Eti.findById(req.params.etiId).exec()
    .then(eti => {
      let mails = _.map(_.filter(eti.inscripciones, (inscripto: any) => {
        let fechaDeHoy = new Date().getDate();
        let fechaVencimiento = contarDiasHabiles(inscripto.fechaPreInscripcion, 7).getDate();
        return inscripto.estado == 'Pre inscripto' && inscripto.comprobante == undefined && fechaVencimiento == fechaDeHoy + 1;
      }), 'email');
      if(!mails.length) {
        res.send('nadie a quien avisar');
      }

      // create reusable transporter object using the default SMTP transport
      var transporter = nodemailer.createTransport({
            service: 'Outlook365', // Office 365 server
            auth: {
                user: 'mendozeti@inscripcioneseti.com',
                pass: '%9PDRwXyEXdKD%v0'
            }
        });

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Mendozeti" <mendozeti@inscripcioneseti.com>', // sender address
        to: mails, // list of receivers
        subject: `QUEDA UN DÍA PARA HACER TU PAGO!`, // Subject line
        text: '', // plain text body
        html: `
        <p>¡¡¡El mendozeti va a estar buenísimo!! Después no digas que no te avisamos!!</p>
        <p>😀😆😊😋😎😍😇☺😛😚😚😘</p>

        <p>Hola!!!!!</p>
        <p>Este email es para recordarte que <span style="color: red">¡sólo <b>te queda 1 día</b> para hacer el pago y subir el comprobante!</span>  (Antes de subir el comprobante al sistema, fijate que no pese más de 1MB, si no sabes cómo hacerlo, envialo a mendozeti@gmail.com, con tu nombre y DNI).
        Si no recibimos el comprobante pasado ese período, tu inscripción se vence y va a ser dada de baja.
        Si esto sucede, vas a tener que inscribirte otra vez. Si hay gente en lista de espera, vas a quedar después de ellos y puede que pierdas tu lugar</p>
        <p><b>No te duermas...</b></p>
        <p>Abrazo del equipo Mendozeti!!!</p>
      `
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.json('Error al enviar mail de aviso');
          return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.json(mails);
      });
    })
    .catch(err => {
      res.status(500).send('Error al enviar mail de aviso');
    })
}
function handleUsusarioPreInscripto(eti, inscripcion, usuarioCreado, res) {
  // create reusable transporter object using the default SMTP transport
  // let transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'inscripciones.mendozeti@gmail.com',
  //     pass: 'eti23mendozeti'
  //   }
  // });
  var transporter = nodemailer.createTransport({
        service: 'Outlook365', // Office 365 server
        auth: {
            user: 'mendozeti@inscripcioneseti.com',
            pass: '%9PDRwXyEXdKD%v0'
        }
    });
  let alojamiento = inscripcion.alojamiento ? eti.precioAlojamiento : 0;
  let seminario = inscripcion.seminario ? eti.precioSeminario : 0;
  let remera = inscripcion.remera ? eti.precioRemera : 0;
  let totalAPagar = eti.precioCombo + alojamiento + seminario + remera;

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Mendozeti" <mendozeti@inscripcioneseti.com>', // sender address
    to: inscripcion.email, // list of receivers
    subject: `Confirmación Pre inscripcion Mendozeti ✔ ${inscripcion.nombre} ${inscripcion.apellido}`, // Subject line
    text: '', // plain text body
    html: `
    <h4>YA ESTAS PRE-INSCRIPTO!!! :) …. pero te faltan dos pasos más, el pago y subir el comprobante del mismo … Tenés que hacer así:</h4>

    <p>1) <b>PAGO:</b> Hacé la transferencia o depósito en la cuenta bancaria del ETI</p>

    <li>Desde Argentina</li>
    <b>Al banco Credicoop (191) Suc. Mendoza (115) Cta CA $ Nro 0182844</b>
    <b>Titular PANNOCCHIA JOSE LUCIANO</b>
    <b>CUIL: 20121870100</b>
    <b>CBU 1910115855111501828449</b>
    ———————
    <li>Desde OTRO PAIS</li>
    <b>Caja Ahorro Swiff: "BCOOAABA"</b>
    <b>Nro.Cta. 0182844  -   CBU 1910115855111501828449</b>
    <b>Sucursal: 115 - Domicilio: 9 de Julio 1228-Cdad-Mza.</b>

    <p>2) <b>SUBIR COMPROBANTE.</b> Ahora tenés que SUBIR AL SISTEMA una imagen del comprobante de pago y los datos de referencia para individualizar los pagos del                     depósito. <b>El depósito</b> debe ser por el combo y <b>podrás incluir  en el mismo depósito, LOS OPCIONALES que elegiste al inscribirte (seminario y/o remera y/o alojamiento)</b></p>
    <p>Estas son tus CREDENCIALES (usuario dni y clave generada por sistema) para ingresar al SISTEMA.</p>
    <p style="color: red; font-weight: bold;">Usuario:  ${usuarioCreado.usuario}</p>
    <p style="color: red; font-weight: bold;">Contraseña: ${usuarioCreado.password}</p>
    <p><b>Una vez en que hiciste el deposito podes entrar al SISTEMA y SUBIR COMPROBANTE haciendo click …. </b><a href="http://inscripcioneseti.com/login">AQUÍ</a></p>
<br>
    <p><b>Tenés tiempo hasta el 30/06 para subir el comprobante, si no lo haces tu solicitud de inscripción  quedará sin efecto y deberas inscribirte nuevamente.</b></p>

    <h3>IMPORTANTE LEER AQUÍ!!</h3>
    <ul>
    <li>La inscripción es PERSONAL e INTRANSFERIBLE y por SISTEMA. No compres combos a nadie. Si te arrepentiste o no podés  participar del ETI podes renunciar a tu inscripción y te devolveremos dinero.</li>
    <li>Si el depósito corresponde a más de un solicitante, cada uno deberá subir el comprobante al SISTEMA, entrando con las credenciales de usuario y contraseña que recibió en el CORREO que le enviamos y tiene en SU CASILLA DE MAILS (la dirección de mail que puso en el formulario)</li>
    <li>No olviden que tienen SIETE DIAS HABILES PARA SUBIR EL COMPROBANTE  DEL PAGO (imagen jpg) al SISTEMA , SI NO LO HACEN LA INSCRIPCIÓN SE CAE AUTOMATICAMENTE  Y DEBERÁN INICIAR EL PROCESO DE INSCRIPCION NUEVAMENTE!!!</li>
    <li>Costos</li>
    </ul>

   <p>Tenés que transferir el valor  de:$ ${totalAPagar} </p>
   <p>
   Detalle:
   </p>
   <p>-COMBO: ($${eti.precioCombo}) </p>
   <p>${inscripcion.alojamiento ? '-ALOJAMIENTO: ($' + eti.precioAlojamiento + ')' : ''}</p>
   <p>${inscripcion.seminario ? '-SEMINARIO: ($' + eti.precioSeminario + ')' : ''}</p>
   <p>${inscripcion.remera ? '-REMERA: ($' + eti.precioRemera + ')' : ''}</p>

   PREGUNTAS Y DUDAS? … escribimos a mendozeti@gmail.com
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
      if (req.body.estado == 'Pre inscripto' && estadoViejo == 'En lista de espera') {
        req.body.fechaPreInscripcion = new Date();
      }
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
            var transporter = nodemailer.createTransport({
                  service: 'Outlook365', // Office 365 server
                  auth: {
                      user: 'mendozeti@inscripcioneseti.com',
                      pass: '%9PDRwXyEXdKD%v0'
                  }
              });

            // setup email data with unicode symbols
            let mailOptions = {
              from: '"Mendozeti" <mendozeti@inscripcioneseti.com>', // sender address
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
            if(req.body.estado == 'Vencido' && estadoViejo == 'Pre inscripto') {
              // create reusable transporter object    "nombre": "Verónica",
              var transporter = nodemailer.createTransport({
                    service: 'Outlook365', // Office 365 server
                    auth: {
                        user: 'mendozeti@inscripcioneseti.com',
                        pass: '%9PDRwXyEXdKD%v0'
                    }
                });

              // setup email data with unicode symbols
              let mailOptions = {
                from: '"Mendozeti" <mendozeti@inscripcioneseti.com>', // sender address
                to: req.body.email, // list of receivers
                subject: `Comunicado del equipo Mendozeti ✔ ${req.body.nombre} ${req.body.apellido}`, // Subject line
                text: '', // plain text body
                html: `
                <p>${req.body.nombre} ${req.body.apellido},</p>
                <p>Tu plazo para hacer el pago venció y tu inscripción se ha dado de baja 😔</p>

                <p>Pero todavía podes participar... </p>
                <p>Inscribite nuevamente!! </p>

                <p>¡¡El mendozeti va a estar buenísimo!! Te lo vas a perder???</p>
                <p>😀😆😊😋😎😍🤗😇☺😛😚😚😘</p>

                <p>Abrazo del equipo</p>
              ` // html body
              };

              // send mail with defined transport object
              transporter.sendMail(mailOptions, (error, info) => {
              });
            }

            if (inscripcionEnEspera) {
              createUsuarioPreInscripto(eti, inscripcionEnEspera).then(usuarioCreado => {
                handleUsusarioPreInscripto(eti, inscripcionEnEspera, usuarioCreado, res);
              },
              error => res.status(500).send('Error al actualizar inscripcion')
              )
            }
            if (req.body.estado == 'Pre inscripto' && estadoViejo == 'En lista de espera') {
              createUsuarioPreInscripto(eti, req.body).then(usuarioCreado => {
                handleUsusarioPreInscripto(eti, req.body, usuarioCreado, res);
              },
              error => res.status(500).send('Error al actualizar inscripcion')
              )
            }
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
  Eti.findOne({
    '_id': req.params.etiId
  }).exec()
    .then(eti => {
      let inscripcionIndex = _.findIndex(eti.inscripciones, { '_id': ObjectId(req.params.inscripcionId) });
      eti.inscripciones = [
        ...eti.inscripciones.slice(0, inscripcionIndex),
        ...eti.inscripciones.slice(inscripcionIndex + 1)
      ];
      eti.save().then((eti) => {
        res.send('ok eliminado')
      })
      .catch((err) => {
        res.status(500).send(err);
      });
    })
    .catch(err => {
      res.status(500).send(err);
    })
}

function contarDiasHabiles(fecha, dias): Date{
  let diasDeLaSemana = [1, 2, 3, 4, 5];

  let msPorDia = 1000*60*60*24;
  let msFecha = fecha.getTime();
  let diasHabilesPasados = 1;
  let fechaPasadosLosDias;
  while(diasHabilesPasados <= dias) {
    msFecha = msFecha + msPorDia;
    let mañanaDate = new Date(msFecha);
    if(_.includes(diasDeLaSemana, mañanaDate.getDay())) {
      diasHabilesPasados++;
      fechaPasadosLosDias = mañanaDate;
    }
  }
  return fechaPasadosLosDias;
}
