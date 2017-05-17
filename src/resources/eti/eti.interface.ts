import { IInscripcion } from './../inscripcion/inscripcion.interface';

export interface IEti {
  nombre: string;
  estado: string;
  capacidad: number;
  inscripcionesAbiertas: boolean;
  inscripciones: IInscripcion[];
}
