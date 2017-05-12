import { IInscripcion } from './../inscripcion/inscripcion.interface';

export interface IEti {
  nombre: string;
  estado: string;
  capacidad: number;
  inscripciones: IInscripcion[];
}
