import * as express from 'express';
import * as comprobanteController from './comprobante.controller';

export const comprobanteRoutes = express.Router();

comprobanteRoutes.post('/:etiId', comprobanteController.createComprobante);
comprobanteRoutes.get('/:etiId', comprobanteController.getComprobantes);
