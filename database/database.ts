import {
  openDatabase,
  SQLTransaction,
  SQLResultSet,
  SQLError,
} from "expo-sqlite/legacy";
import * as FileSystem from "expo-file-system";

const DB_NAME = "lanchonete.db";
let db: ReturnType<typeof openDatabase>;
//
const getDatabasePath = async () => {
  const documentDirectory = FileSystem.documentDirectory;
  return documentDirectory ? `${documentDirectory}SQLite/${DB_NAME}` : DB_NAME;
};

const ensureDatabaseDirectoryExists = async () => {
  const dbDirectory = `${FileSystem.documentDirectory}SQLite`;
  const { exists } = await FileSystem.getInfoAsync(dbDirectory);
  if (!exists) {
    await FileSystem.makeDirectoryAsync(dbDirectory, { intermediates: true });
  }
};

export const initDatabase = async () => {
  try {
    await ensureDatabaseDirectoryExists();
    const dbPath = await getDatabasePath();

    db = openDatabase(DB_NAME);

    // Criar tabela de produtos
    await new Promise<void>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image TEXT,
            active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `,
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return true; // Indica que o erro foi tratado
          }
        );
      });
    });

    // Criar tabelas de pedidos
    await new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          // Tabela de pedidos
          tx.executeSql(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            table_number INTEGER,
            status TEXT NOT NULL,
            total REAL NOT NULL,
            payment_method TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

          // Tabela de itens do pedido
          tx.executeSql(`
          CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            notes TEXT,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
          )
        `);

          resolve();
        },
        (error) => {
          reject(error);
          return true;
        }
      );
    });

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

          // Verificar se já existem níveis de acesso
          tx.executeSql(
            "SELECT COUNT(*) as count FROM access_levels",
            [],
            (_, { rows }) => {
              if (rows.item(0).count === 0) {
                // Inserir níveis de acesso padrão apenas se não existirem
                tx.executeSql(
                  `INSERT INTO access_levels (id, name, description) VALUES 
                  (1, 'admin', 'Acesso total ao sistema'),
                  (2, 'gerente', 'Acesso a relatórios e gestão'),
                  (3, 'caixa', 'Acesso a vendas e consultas'),
                  (4, 'atendente', 'Acesso básico ao sistema');`
                );
              }
            }
          );

          // Verificar se já existe usuário admin
          tx.executeSql(
            "SELECT COUNT(*) as count FROM users WHERE username = ?",
            ["admin"],
            (_, { rows }) => {
              if (rows.item(0).count === 0) {
                // Inserir usuário admin padrão apenas se não existir
                tx.executeSql(
                  `INSERT INTO users (username, password, name, access_level_id) 
                  VALUES ('admin', 'admin123', 'Administrador', 1);`
                );
              }
            }
          );
        },
        (error) => {
          console.error("Erro ao inicializar banco de dados:", error);
          reject(error);
        },
        () => {
          console.log("Banco de dados inicializado com sucesso");
          resolve(true);
        }
      );
    });
  } catch (error) {
    console.error("Erro ao configurar banco de dados:", error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    db = openDatabase(DB_NAME);
  }
  return db;
};
