import dotenv from 'dotenv';
import app from './app';

// Carrega as variáveis de ambiente (.env)
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ################################################
  🛡️  Servidor rodando na porta: ${PORT} 🛡️
  ################################################
  `);
});
