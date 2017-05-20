export interface IInscripcion {
  nombre: string;
  apellido: string;
  documento: string;
  pais: string;
  provincia: string;
  ciudad: string;
  email: string;
  telefono: string;
  primerEti: boolean;
  whatsapp: boolean;
  telefonoEmergencia: string;
  seminario: boolean;
  turnoSeminario: string;
  alojamiento: boolean;
  tipoComida: string;
  fechaLlegada: string;
  fechaSalida: string;
  estado: string;
  comprobante: string;
  fechaInscripcion: Date;
  fechaPreInscripcion: Date;
  referenciaComprobante: string;
}
