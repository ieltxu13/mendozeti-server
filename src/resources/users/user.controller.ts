import { User } from './user.model';

export function createUser(req, res) {
  User.create(req.body)
  .then(user => {
    res.status(201).json(user);
  })
  .catch(err => {
    res.status(500).send('Error al crear el usuario');
  });
}

export function updateUser(req, res) {
  res.status(500).send('Sin implementar');
}

export function getUser(req, res) {
  User.findById(req.params.userId)
  .then(eti => {
    res.status(200).json(eti);
  })
  .catch(err => {
    res.status(500);
  })
}

export function getUsers(req, res) {
  User.find()
  .then(users => {
    console.log(users);
    res.status(200).json(users);
  })
  .catch(err => {
    res.status(500).send('Error al obtener usuarios');
  })
}

export function deleteUser() {
  return true;
}
