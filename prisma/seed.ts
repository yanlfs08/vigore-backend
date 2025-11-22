import { PrismaClient, TipoPermissao } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10)

  // 1. Admin (Garante que ele existe)
  await prisma.usuario.upsert({
    where: { email: 'admin@vigore.com.br' },
    update: {},
    create: {
      nome_completo: 'Administrador',
      email: 'admin@vigore.com.br',
      senha_hash: passwordHash,
      tipo_permissao: TipoPermissao.ADMIN,
    },
  })

  // 2. Médico Dr. Ricardo
  await prisma.usuario.upsert({
    where: { email: 'ricardo@vigore.com.br' },
    update: {},
    create: {
      nome_completo: 'Dr. Ricardo',
      email: 'ricardo@vigore.com.br',
      senha_hash: passwordHash,
      tipo_permissao: TipoPermissao.MEDICO,
      crm: '12345-SP',
    },
  })

  // 3. Procedimento Padrão
  await prisma.procedimento.upsert({
    where: { nome: 'Consulta de Rotina' },
    update: {},
    create: {
      nome: 'Consulta de Rotina',
      descricao: 'Consulta padrão de urologia/saúde masculina',
      duracao_media_minutos: 30,
      valor: 350.0,
    },
  })

  // 4. Modelo de Atestado
  await prisma.modeloDocumento.upsert({
    where: { nome_modelo: 'Atestado Padrão' },
    update: {},
    create: {
      nome_modelo: 'Atestado Padrão',
      tipo_documento: 'ATESTADO_MEDICO',
      conteudo_template:
        'Atesto para os devidos fins que o paciente {NOME_PACIENTE} esteve sob cuidados médicos e necessita de {DIAS} dias de repouso.',
      dados_padrao_json: {},
    },
  })

  // 5. Modelo de Pedido de Exame (Lista Dinâmica)
  await prisma.modeloDocumento.upsert({
    where: { nome_modelo: 'Perfil Hormonal Masculino' },
    update: {},
    create: {
      nome_modelo: 'Perfil Hormonal Masculino',
      tipo_documento: 'PEDIDO_EXAME',
      conteudo_template: 'Solicito a realização dos exames listados abaixo para avaliação de rotina.',
      dados_padrao_json: [
        'Testosterona Total e Livre',
        'Estradiol',
        'Prolactina',
        'LH e FSH',
        'TSH e T4 Livre',
        'SHBG',
        'Hemograma Completo',
      ],
    },
  })

  console.log('✅ Banco populado com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
