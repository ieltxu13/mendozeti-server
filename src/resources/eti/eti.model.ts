import { Document, Schema, Model, model } from "mongoose";
import { IEti } from './eti.interface';
import { Inscripcion } from '../inscripcion/inscripcion.model';

export interface IEtiModel extends IEti, Document {}

export let EtiSchema: Schema = new Schema({
  createdAt: Date,
  nombre: String,
  estado: String,
  capacidad: Number,
  inscripcionesAbiertas: Boolean,
  precioCombo: Number,
  precioAlojamiento: Number,
  precioSeminario: Number,
  capacidadAlojamiento: Number,
  inscripciones: [Inscripcion.schema]
})

EtiSchema.pre('save', next => {
  let now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
})

export const Eti: Model<IEtiModel> = model<IEtiModel>('Eti', EtiSchema);
