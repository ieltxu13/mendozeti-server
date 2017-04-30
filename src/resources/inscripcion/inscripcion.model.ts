import { Document, Schema, Model, model } from "mongoose";
import { IInscripcion } from './inscripcion.interface';

export interface IInscripcionModel extends IInscripcion, Document {}

export let InscripcionSchema: Schema = new Schema({
  createdAt: Date,
  nombre: String,
  apellido: String,
  documento: String,
  pais: String,
  provincia: String,
  ciudad: String,
  email: String,
  telefono1: String,
  telefono2: String,
  tipoComida: String,
  fechaLlegada: String,
  fechaSalida: String,
  estado: String
})

InscripcionSchema.pre('save', next => {
  let now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
})

export const Inscripcion: Model<IInscripcionModel> = model<IInscripcionModel>('Inscripcion', InscripcionSchema);
