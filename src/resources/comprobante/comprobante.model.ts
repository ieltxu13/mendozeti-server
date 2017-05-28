import { Document, Schema, Model, model } from "mongoose";
import { IComprobante } from './comprobante.interface';

export interface IComprobanteModel extends IComprobante, Document {}

export let ComprobanteSchema: Schema = new Schema({
  createdAt: Date,
  referencia: {type: String, unique: true},
  combos: Number,
  alojamientos: Number,
  seminarios: Number,
  fechaYHora: String,
  total: Number,
  eti: String
})

ComprobanteSchema.pre('save', next => {
  let now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
})

export const Comprobante: Model<IComprobanteModel> = model<IComprobanteModel>('Comprobante', ComprobanteSchema);
