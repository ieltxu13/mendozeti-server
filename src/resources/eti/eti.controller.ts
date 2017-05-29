import { Eti } from './eti.model';

export function createEti(req, res) {
  Eti.create(req.body)
  .then(eti => {
    res.status(201).json(eti);
  })
  .catch(err => {
    res.status(500);
  });
}

export function updateEti(req, res) {
  res.status(500).send('Sin implementar');
}

export function getEti(req, res) {
  Eti.findById(req.params.etiId)
  .then(eti => {
    res.status(200).json(eti);
  })
  .catch(err => {
    res.status(500).send();
  })
}

export function getEtis(req, res) {
  Eti.find()
  .then(etis => {
    res.status(200).json(etis);
  })
  .catch(err => {
    res.status(500).send();
  })
}

export function deleteEti() {
  return true;
}
