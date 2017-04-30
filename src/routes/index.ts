import { Router } from 'express';

import { etiRoutes } from '../resources/eti/eti.routes';
import { userRoutes } from '../resources/users/user.routes';
const index: Router = Router();

index.use('/eti', etiRoutes);
index.use('/users', userRoutes);

export default index;
