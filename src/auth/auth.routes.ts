import * as express from 'express';
import * as authController from './auth.controller';

export const authRoutes = express.Router();

authRoutes.post('/authenticate', authController.authenticate);
