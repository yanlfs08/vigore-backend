-- CreateTable
CREATE TABLE "agendas_padrao" (
    "id" SERIAL NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "horario_inicio" TEXT NOT NULL,
    "horario_fim" TEXT NOT NULL,

    CONSTRAINT "agendas_padrao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueios_agenda" (
    "id" SERIAL NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bloqueios_agenda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "agendas_padrao" ADD CONSTRAINT "agendas_padrao_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueios_agenda" ADD CONSTRAINT "bloqueios_agenda_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
