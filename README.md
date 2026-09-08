# Educação Matrix

Educação Matrix é um **SaaS Multi-Tenant** voltado para gestão educacional, projetado com uma interface moderna, clean e com regras de negócio seguras e escaláveis.

## 🚀 Funcionalidades Principais

1. **Autenticação e Planos (Multi-tenant)**
   - O sistema isola totalmente os dados por `institutionId` garantindo privacidade total.
   - Flow de Cadastro em Wizard para novas instituições.
   - Planos limitam a criação de alunos/professores no painel de admin.

2. **Administração Escolar**
   - Dashboard com gráficos gerais.
   - Gestão de Turmas e Disciplinas.
   - Gestão de Professores e Alunos (com criação automática de usuários).
   - Relatório Acadêmico Global (Visão gerencial de desempenho com suporte a impressão).

3. **Caderneta Digital do Professor**
   - Painel para lançamento simplificado de frequência (chamada do dia).
   - Criação de avaliações e planilhas de lançamento de notas bimestrais/trimestrais.
   - Diário de Classe para anotações de conteúdos lecionados.

4. **Painel do Aluno**
   - Dashboard para acompanhamento e resumo rápido de status/faltas.
   - Visualização do Histórico (progressão por anos).
   - Boletim Escolar rico com cálculo de média, % de presença e layout limpo para impressão (PDF).

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, Prisma ORM, MySQL, JWT, Zod (Validação).
- **Frontend**: React (Vite), CSS Puro (Variáveis modernas CSS, Glassmorphism, Print Media Queries), Chart.js, Lucide-React.

## 📦 Como rodar localmente

### 1. Clonar e configurar
\`\`\`bash
# Configurar Banco de Dados
cd backend
npm install
# Crie e preencha seu arquivo .env com a string do banco
\`\`\`

### 2. Rodar Migrations e Seed (Dados Iniciais)
\`\`\`bash
npx prisma migrate dev --name init
npx prisma db seed
\`\`\`
*Obs: O Seed cria instituições, planos e a escola de exemplo com turmas, alunos e professores populados.*

### 3. Iniciar Servidores
Em um terminal (Backend):
\`\`\`bash
cd backend
npm run dev
\`\`\`

Em outro terminal (Frontend):
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### 4. Credenciais de Teste (Seed)
Acesse: `http://localhost:5173/login`
- **Admin**: `admin@escolaexemplo.com.br` / `123456`
- **Professor**: `prof.carlos@escolaexemplo.com.br` / `123456`
- **Aluno**: `joao.silva@escolaexemplo.com.br` / `123456`

## 🎨 Design UI / UX
O projeto foi cuidadosamente estilizado com CSS Puro usando melhores práticas: CSS Variables, layouts responsivos (Grid e Flexbox) em `layout.css`, e separação em `components.css`. Possui um modo de impressão (print.css) exclusivo que formata e limpa a interface perfeitamente para gerar relatórios e boletins em folha A4.
