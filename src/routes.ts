import { Router } from 'express'
import { AuthController } from './controllers/AuthController'
import { UserController } from './controllers/UserController'
import { PatientController } from './controllers/PatientController'
import { AppointmentController } from './controllers/AppointmentController'
import { AuthMiddleware } from './middlewares/auth'
import { DocumentController } from './controllers/DocumentController'
import { ChatController } from './controllers/ChatController'
import { ModelDocumentController } from './controllers/ModelDocumentController'
import { ScheduleConfigController } from './controllers/ScheduleConfigController'

const router = Router()
const authController = new AuthController()
const userController = new UserController()
const patientController = new PatientController()
const appointmentController = new AppointmentController()
const docController = new DocumentController()
const chatController = new ChatController()
const modelController = new ModelDocumentController()
const scheduleController = new ScheduleConfigController()

// --- Rotas Públicas ---
router.post('/auth/login', authController.login)

// --- Rotas Protegidas (Cadeado) ---
router.use(AuthMiddleware)

// Usuários
router.get('/usuarios', userController.index)
router.post('/usuarios', userController.create)
router.put('/usuarios/:id', userController.update)
router.patch('/usuarios/alterar-senha', userController.changePassword)

// Chat
router.get('/chat/history/:id', chatController.getHistory)

// Pacientes
router.get('/pacientes', patientController.index)
router.post('/pacientes', patientController.create)
router.get('/pacientes/:id_paciente/documentos', docController.index)

// Agendamentos
router.get('/agendamentos', appointmentController.index)
router.post('/agendamentos', appointmentController.create)

// Configuração de Agenda
router.post('/agenda/padrao', scheduleController.upsertStandard) // Define dias fixos
router.get('/agenda/padrao/:id_medico', scheduleController.getStandard)

// Configuração de Bloqueios (Feriados/Folgas)
router.post('/agenda/bloqueios', scheduleController.addBlock)
router.get('/agenda/bloqueios/:id_medico', scheduleController.getBlocks)
router.delete('/agenda/bloqueios/:id', scheduleController.removeBlock)

// Documentos
router.post('/documentos', docController.create)

// Gestão de Modelos de Documentos
router.get('/modelos-documentos', modelController.index) // Médicos usam para listar
router.post('/modelos-documentos', modelController.create) // Admin cria
router.put('/modelos-documentos/:id', modelController.update) // Admin edita
router.delete('/modelos-documentos/:id', modelController.delete) // Admin remove

export { router }
