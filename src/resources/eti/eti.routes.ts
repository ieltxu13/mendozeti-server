import * as express from 'express';
import * as etiController from './eti.controller';
import { inscripcionRoutes } from '../inscripcion/inscripcion.routes';

export const etiRoutes = express.Router();

etiRoutes.use('/:etiId/inscripcion', inscripcionRoutes)
etiRoutes.post('/', etiController.createEti);
etiRoutes.put('/:etiId', etiController.updateEti);
etiRoutes.get('/:etiId', etiController.getEti);
etiRoutes.get('/', etiController.getEtis);
