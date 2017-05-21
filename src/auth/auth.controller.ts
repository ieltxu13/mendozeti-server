import { User } from '../resources/users/user.model';
import * as jwt from 'jsonwebtoken';

export function authenticate(req, res) {
  User.findOne({ 'usuario': req.body.usuario }).exec()
    .then(user => {
      console.log(user.password == req.body.password);
      if(user.password == req.body.password) {
        var token = jwt.sign({
          inscripcionId: user.inscripcionId,
          nombre: user.nombre,
          admin: user.admin,
          eti: user.eti
        }, 'secret');

        res.json(token);
      } else {
        res.status(401).send();;
      }
    })
    .catch(err => {
      res.status(500).send();
    })
}
