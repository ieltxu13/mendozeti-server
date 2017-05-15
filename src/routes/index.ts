import { Router } from 'express';

import { etiRoutes } from '../resources/eti/eti.routes';
import { userRoutes } from '../resources/users/user.routes';
import { uploadRoutes } from '../resources/uploads/upload.routes';
const index: Router = Router();

index.use('/eti', etiRoutes);
index.use('/users', userRoutes);
index.use('/upload', uploadRoutes);

export default index;
