-- CreateEnum
CREATE TYPE "CanalCaptacao" AS ENUM ('INDICACAO', 'MIDIA_SOCIAL', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusPaciente" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "pacientes" (
    "id" SERIAL NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "cpf" TEXT,
    "data_nascimento" DATE,
    "telefone_principal" TEXT NOT NULL,
    "telefone_secundario" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "data_primeira_consulta" DATE NOT NULL,
    "canal_captacao" "CanalCaptacao",
    "status" "StatusPaciente" NOT NULL DEFAULT 'ATIVO',
    "observacoes_gerais" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");
