import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import patientRoutes from './routes/patient.routes'
import { router } from './routes'

const swaggerDocument = require('./swagger.json')
const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

// --- Rota da Documentação ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Sistema Clínica Vigore - API Online 🚀' })
})

app.use(router)
export default app
