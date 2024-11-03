# Lanchonete App

Aplicativo mobile desenvolvido em React Native para gestão completa de lanchonetes, oferecendo funcionalidades de vendas, controle de estoque, gestão de usuários e relatórios.

## 🚀 Sobre o Projeto

Este aplicativo foi desenvolvido para atender às necessidades de lanchonetes de pequeno e médio porte, oferecendo uma solução completa e intuitiva para gestão do negócio através de dispositivos móveis.

## 💻 Tecnologias Utilizadas

- React Native
- TypeScript
- SQLite
- Redux
- React Navigation
- Styled Components

## 📱 Funcionalidades Principais

- Gestão de vendas e pedidos
- Controle de estoque
- Gestão de usuários e permissões
- Relatórios gerenciais
- Funcionamento offline
- Backup automático

## 📋 Requisitos do Sistema

### Requisitos Funcionais

#### Gestão de Usuários
- Cadastro de funcionários com níveis de acesso
- Autenticação com login e senha
- Recuperação de senha
- Edição de perfil

#### Gestão de Vendas
- Registro de vendas com itens e quantidades
- Geração de número único por venda
- Cálculo automático de valores
- Múltiplas formas de pagamento
- Histórico de vendas

#### Gestão de Estoque
- Cadastro e controle de produtos
- Atualização automática após vendas
- Sistema de alertas
- Histórico de movimentações

#### Relatórios
- Vendas por período
- Produtos mais vendidos
- Movimentação de estoque
- Fluxo de caixa

### Requisitos Não Funcionais

#### Usabilidade
- Interface intuitiva para mobile
- Modo escuro/claro
- Tempo de resposta < 2s
- Feedback visual

#### Performance
- Funcionamento offline
- Suporte multi-usuário
- Backup automático

#### Segurança
- Criptografia de dados
- Log de operações
- Logout automático
- Validação de dados

## 🔧 Configuração do Ambiente

1. Clone o repositório

```bash
git clone https://github.com/your-username/lanchonete-app.git
```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
