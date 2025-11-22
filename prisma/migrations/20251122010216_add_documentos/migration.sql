-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('ATESTADO_MEDICO', 'ATESTADO_COMPARECIMENTO', 'PEDIDO_EXAME', 'RECEITA');

-- CreateTable
CREATE TABLE "documentos" (
    "id" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "tipo_documento" "TipoDocumento" NOT NULL,
    "conteudo_gerado" TEXT NOT NULL,
    "dados_especificos_json" JSONB,
    "data_geracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos_documentos" (
    "id" SERIAL NOT NULL,
    "nome_modelo" TEXT NOT NULL,
    "tipo_documento" "TipoDocumento" NOT NULL,
    "conteudo_template" TEXT NOT NULL,
    "dados_padrao_json" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modelos_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modelos_documentos_nome_modelo_key" ON "modelos_documentos"("nome_modelo");

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
