# Sistema Financeiro Rancho

Sistema web completo para controle financeiro e de estoque de restaurante, desenvolvido com React + TypeScript + Firebase.

## 🚀 Funcionalidades

### 📊 Dashboard
- Resumo geral com cards informativos
- Gráfico de evolução do caixa
- Gráfico de gastos mensais
- Alertas de estoque baixo

### 💰 Movimento de Caixa Diário
- CRUD completo para movimentações diárias
- Campos: data, entrada, saída, saldo final, observações
- Gráfico de evolução do caixa

### 📋 Gastos Mensais
- CRUD completo para gastos
- Categorização por tipo de gasto
- Relatórios mensais com totalizadores
- Comparação entre meses

### 📦 Controle de Estoque
- CRUD completo para itens do estoque
- Categorias: Peixes, Carnes, Frios/Congelados
- Sistema de movimentação (entrada/saída)
- Alertas automáticos para estoque baixo
- Dados iniciais pré-carregados com produtos típicos

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + TailwindCSS Forms
- **Charts**: Recharts
- **Backend**: Firebase Firestore
- **Autenticação**: Firebase Auth
- **Build**: Create React App

## 📋 Pré-requisitos

- Node.js 16+
- Conta no Firebase
- npm ou yarn

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd financeiro-rancho
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Firestore Database
3. Ative o Authentication (Email/Password)
4. Copie as configurações do projeto

### 4. Configure as variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env`
```bash
cp .env.example .env
```

2. Preencha as variáveis com os dados do seu projeto Firebase:
```env
REACT_APP_FIREBASE_API_KEY=sua_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=seu_projeto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
REACT_APP_FIREBASE_APP_ID=seu_app_id
```

### 5. Configure as regras do Firestore

No Firebase Console, vá em Firestore Database > Rules e configure

## 🚀 Executando o projeto

```bash
npm start
```

O aplicativo estará disponível em `http://localhost:3000`

## 📱 Como usar

### Primeiro acesso
1. Acesse o sistema e crie uma conta
2. Faça login com suas credenciais
3. Os dados de estoque serão inicializados automaticamente

### Funcionalidades principais

#### Dashboard
- Visualize resumos financeiros e de estoque
- Monitore alertas de estoque baixo
- Acompanhe gráficos de evolução

#### Movimento de Caixa
- Registre entradas e saídas diárias
- Acompanhe o saldo final de cada dia
- Visualize a evolução do caixa em gráfico

#### Gastos Mensais
- Categorize e registre todos os gastos
- Filtre por mês/ano
- Compare gastos entre períodos

#### Controle de Estoque
- Gerencie produtos por categoria
- Registre entradas e saídas
- Configure alertas de estoque mínimo
- Movimente estoque com histórico

## 🗂️ Estrutura do Projeto

```
src/
├── components/
│   ├── auth/           # Componentes de autenticação
│   └── ui/             # Componentes reutilizáveis
├── config/
│   └── firebase.ts     # Configuração do Firebase
├── hooks/
│   ├── useAuth.ts      # Hook de autenticação
│   └── useFirestore.ts # Hooks do Firestore
├── pages/              # Páginas principais
├── services/           # Serviços do Firebase
├── types/              # Tipos TypeScript
└── utils/              # Utilitários
```

## 📊 Dados Iniciais

O sistema vem com dados de estoque pré-configurados:

### Peixes
- Tilápia (1kg e 1,5kg)
- Camarão (15g e 30g)
- Manjuba, Filé Branquinho, Salmão

### Carnes
- Contra Filé, Picanha, Fraldinha
- Frango (Peito, Passarinho, Desossado)
- Porco (Barriga, Bacon, Pé, Orelha, Rabo)
- Filé Mignon, Carneiro, Galinha Caipira
- Carne de Sol

### Frios/Congelados
- Queijos (Mussarela, Coalho)
- Presunto, Cheddar, Catupiry
- Calabresa, Sorvete
- Salgados (Pastéis, Bolinhos, Croquetes)

## 🔒 Segurança

- Autenticação obrigatória para todas as funcionalidades
- Regras de segurança do Firestore configuradas
- Dados isolados por usuário autenticado

## 🐛 Solução de Problemas

### Erro de conexão com Firebase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Firebase está ativo
- Verifique as regras do Firestore

### Problemas de build
- Execute `npm install` novamente
- Limpe o cache: `npm start -- --reset-cache`
- Verifique a versão do Node.js

## 📝 Licença

Este projeto é de uso interno para o restaurante.

## 🤝 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
