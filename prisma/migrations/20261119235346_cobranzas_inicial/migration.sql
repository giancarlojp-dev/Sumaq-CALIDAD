-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "EstadoComprobante" AS ENUM ('EMITIDO');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "documento" VARCHAR(20) NOT NULL,
    "email" VARCHAR(120),
    "telefono" VARCHAR(30),
    "proyecto" VARCHAR(150) NOT NULL,
    "responsableId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuota" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "concepto" VARCHAR(150) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fechaVencimiento" DATE NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "cuotaId" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "montoMora" DECIMAL(12,2) NOT NULL,
    "montoCapital" DECIMAL(12,2) NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "referencia" VARCHAR(60),
    "idempotencyKey" VARCHAR(100),
    "registradoPorId" TEXT NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comprobante" (
    "id" TEXT NOT NULL,
    "pagoId" TEXT NOT NULL,
    "serie" VARCHAR(10) NOT NULL,
    "numero" INTEGER NOT NULL,
    "montoTotal" DECIMAL(12,2) NOT NULL,
    "emitidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emitidoPorId" TEXT NOT NULL,
    "estado" "EstadoComprobante" NOT NULL DEFAULT 'EMITIDO',

    CONSTRAINT "Comprobante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerieComprobante" (
    "serie" VARCHAR(10) NOT NULL,
    "ultimoNumero" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SerieComprobante_pkey" PRIMARY KEY ("serie")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_documento_key" ON "Cliente"("documento");

-- CreateIndex
CREATE INDEX "Cliente_responsableId_idx" ON "Cliente"("responsableId");

-- CreateIndex
CREATE INDEX "Cuota_clienteId_idx" ON "Cuota"("clienteId");

-- CreateIndex
CREATE INDEX "Cuota_fechaVencimiento_idx" ON "Cuota"("fechaVencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "Cuota_clienteId_numero_key" ON "Cuota"("clienteId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_idempotencyKey_key" ON "Pago"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Pago_cuotaId_idx" ON "Pago"("cuotaId");

-- CreateIndex
CREATE INDEX "Pago_registradoPorId_idx" ON "Pago"("registradoPorId");

-- CreateIndex
CREATE UNIQUE INDEX "Comprobante_pagoId_key" ON "Comprobante"("pagoId");

-- CreateIndex
CREATE INDEX "Comprobante_pagoId_idx" ON "Comprobante"("pagoId");

-- CreateIndex
CREATE UNIQUE INDEX "Comprobante_serie_numero_key" ON "Comprobante"("serie", "numero");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_cuotaId_fkey" FOREIGN KEY ("cuotaId") REFERENCES "Cuota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Disparador propuesto para inmutabilidad estricta a nivel de BD (PostgreSQL)
-- CREATE OR REPLACE FUNCTION impedir_modificacion_comprobante()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   RAISE EXCEPTION 'COMPROBANTE_INMUTABLE: No se permite modificar ni eliminar un comprobante emitido.';
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER trg_comprobante_inmutable
-- BEFORE UPDATE OR DELETE ON "Comprobante"
-- FOR EACH ROW
-- EXECUTE FUNCTION impedir_modificacion_comprobante();
