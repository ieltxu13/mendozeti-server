import * as express from 'express';
import * as inscripcionController from './inscripcion.controller';

export const inscripcionRoutes = express.Router({mergeParams: true});

inscripcionRoutes.post('/', inscripcionController.createInscripcion);
inscripcionRoutes.put('/:inscripcionId', inscripcionController.updateInscripcion);
inscripcionRoutes.get('/maildeaviso', inscripcionController.mailAvisoVencimiento);
inscripcionRoutes.get('/:inscripcionId', inscripcionController.getInscripcion);
inscripcionRoutes.get('/:inscripcionId/reenviarmail', inscripcionController.reenviarMail);
inscripcionRoutes.get('/', inscripcionController.getInscripciones);
//inscripcionRoutes.delete('/:inscripcionId', inscripcionController.deleteInscripcion);
