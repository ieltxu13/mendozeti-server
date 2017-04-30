import { Document, Schema, Model, model } from "mongoose";
import { IUser } from './user.interface';

export interface IUserModel extends IUser, Document {}

export let UserSchema: Schema = new Schema({
  createdAt: Date,
  nombre: String,
  usuario: String,
  password: String,
  eti: String,
  admin: Boolean
})

UserSchema.pre('save', next => {
  let now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
})

export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
