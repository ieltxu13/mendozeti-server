import { Router } from 'express';

import { etiRoutes } from '../resources/eti/eti.routes';
import { userRoutes } from '../resources/users/user.routes';
import { uploadRoutes } from '../resources/uploads/upload.routes';
import { comprobanteRoutes } from '../resources/comprobante/comprobante.routes';
const index: Router = Router();

index.use('/eti', etiRoutes);
index.use('/users', userRoutes);
index.use('/upload', uploadRoutes);
index.use('/comprobantes', comprobanteRoutes);

export default index;
