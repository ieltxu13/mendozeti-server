import { User } from '../resources/users/user.model';
import * as jwt from 'jsonwebtoken';

export function authenticate(req, res) {
  User.findOne({ 'usuario': req.body.usuario }).exec()
    .then(user => {
      console.log(user.password == req.body.password);
      if(user.password == req.body.password) {
        var token = jwt.sign({
          nombre: user.nombre
        }, 'secret');

        res.json(token);
      } else {
        res.status(401);
      }
    })
    .catch(err => {
      res.status(500);
    })
}
