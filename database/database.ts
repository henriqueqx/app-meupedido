import { openDatabase, SQLTransaction, SQLResultSet, SQLError } from 'expo-sqlite/legacy';

const db = openDatabase('lanchonete.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Tabela de níveis de acesso
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS access_levels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
          );`
        );

        // Tabela de usuários
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            access_level_id INTEGER,
            active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT,
            FOREIGN KEY (access_level_id) REFERENCES access_levels (id)
          );`
        );

        // Inserir níveis de acesso padrão
        tx.executeSql(
          `INSERT OR IGNORE INTO access_levels (id, name, description) VALUES 
          (1, 'admin', 'Acesso total ao sistema'),
          (2, 'gerente', 'Acesso a relatórios e gestão'),
          (3, 'caixa', 'Acesso a vendas e consultas'),
          (4, 'atendente', 'Acesso básico ao sistema');`
        );

        // Inserir usuário admin padrão (senha: admin123)
        tx.executeSql(
          `INSERT OR IGNORE INTO users (username, password, name, access_level_id) 
          VALUES ('admin', 'admin123', 'Administrador', 1);`
        );
      },
      (error) => {
        console.error('Erro ao inicializar banco de dados:', error);
        reject(error);
      },
      () => {
        console.log('Banco de dados inicializado com sucesso');
        resolve(true);
      }
    );
  });
}; 