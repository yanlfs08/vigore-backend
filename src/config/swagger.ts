import swaggerJsdoc from 'swagger-jsdoc'
import path from 'path'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Clínica Vigore',
      version: '1.0.0',
      description: 'Documentação dos endpoints do sistema de gestão da Clínica Vigore.',
    },
    servers: [
      { url: 'http://localhost:3001' }, // Ajustei para 3001 que é o local
    ],
  },
  // Usando path.resolve para garantir que ele ache os arquivos no Windows
  apis: [path.resolve(__dirname, '../routes/*.ts'), path.resolve(__dirname, '../controllers/*.ts')],
}

export const swaggerSpec = swaggerJsdoc(options)
