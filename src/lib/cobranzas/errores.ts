export class DominioError extends Error {
  public readonly codigo: string;
  public readonly mensaje: string;
  public readonly status: number;

  constructor(codigo: string, mensaje: string, status: number = 400) {
    super(mensaje);
    this.name = "DominioError";
    this.codigo = codigo;
    this.mensaje = mensaje;
    this.status = status;
    Object.setPrototypeOf(this, DominioError.prototype);
  }
}
