import * as express from 'express';
import * as userController from './user.controller';

export const userRoutes = express.Router();

userRoutes.post('/', userController.createUser);
userRoutes.get('/:userId', userController.getUser);
userRoutes.get('/', userController.getUsers);
