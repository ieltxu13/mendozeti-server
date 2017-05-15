import * as express from 'express';
import * as uploadController from './upload.controller';

export const uploadRoutes = express.Router();

uploadRoutes.post('/:etiId/:inscripcionId', uploadController.uploadFile);
