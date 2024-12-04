Documentação do Projeto - Lanchonete App
1. Visão Geral do Projeto
1.1 Introdução
O Lanchonete App é uma aplicação mobile desenvolvida em React Native para gestão completa de lanchonetes e pequenos restaurantes. O sistema oferece funcionalidades essenciais para o gerenciamento do negócio, incluindo controle de vendas, gestão de estoque, administração financeira e geração de relatórios.
1.2 Objetivos

Digitalizar processos operacionais de lanchonetes
Facilitar o controle de vendas e pedidos
Melhorar a gestão de estoque
Fornecer controle financeiro eficiente
Disponibilizar informações gerenciais
Permitir operação em dispositivos móveis
Funcionar offline

1.3 Público-Alvo

Proprietários de lanchonetes
Gerentes
Atendentes
Operadores de caixa

2. Arquitetura do Sistema
2.1 Tecnologias Utilizadas

Frontend: React Native com Expo
Banco de Dados: SQLite
Gerenciamento de Estado: Context API
Navegação: Expo Router
Autenticação: AsyncStorage
UI/UX: Componentes nativos e custom

2.2 Estrutura do Projeto
Copyapp/
├── components/       # Componentes reutilizáveis
├── screens/         # Telas da aplicação
├── contexts/        # Contextos do React
├── database/        # Configuração e repositories
├── utils/          # Utilitários e helpers
└── hooks/          # Custom hooks
2.3 Banco de Dados
O sistema utiliza SQLite para armazenamento local, com as seguintes tabelas principais:

users (Usuários)
products (Produtos)
orders (Pedidos)
order_items (Itens dos pedidos)
customers (Clientes)
cash_movements (Movimentações de caixa)

3. Funcionalidades Principais
3.1 Autenticação e Autorização

Login com usuário e senha
Níveis de acesso:

Administrador
Gerente
Caixa
Atendente


Gestão de permissões
Controle de sessão

3.2 Gestão de Produtos

Cadastro de produtos
Categorização
Precificação
Controle de estoque
Produtos ativos/inativos

3.3 Gestão de Pedidos

Criação de pedidos
Seleção de produtos
Controle de quantidades
Observações por item
Status do pedido
Vinculação com cliente/mesa

3.4 Controle Financeiro

Abertura/fechamento de caixa
Registro de vendas
Entradas/saídas
Saldo atual
Histórico de movimentações

3.5 Gestão de Clientes

Cadastro de clientes
Histórico de pedidos
Busca e filtros
Dados de contato

3.6 Relatórios

Vendas por período
Produtos mais vendidos
Movimentação financeira
Histórico de operações


Componentes comuns:

Botões
Campos de entrada
Cards
Listas
Modais



4.2 Fluxos Principais

Login

Entrada de credenciais
Validação
Redirecionamento


Venda

Seleção de produtos
Quantidade e observações
Cliente/mesa
Confirmação


Caixa

Abertura
Movimentações
Fechamento
Conferência


5. Segurança e Performance
5.1 Segurança

Autenticação local
Validação de dados
Controle de acesso por nível


6. Requisitos Técnicos
6.1 Ambiente de Desenvolvimento

Node.js 18+
Expo CLI
Android Studio / Xcode
VS Code (recomendado)
Git

6.2 Instalação e Configuração
bashCopy# Clonar repositório
git clone https://github.com/username/lanchonete-app.git

# Instalar dependências
cd lanchonete-app
npm install

# Iniciar aplicação
npx expo start
6.3 Build e Deploy

8. Considerações Finais
8.1 Limitações Conhecidas

Operação somente local
Sem sincronização em nuvem
Limite de armazenamento local
Performance em grandes volumes