import {
  openDatabase,
  SQLTransaction,
  SQLResultSet,
  SQLError,
} from "expo-sqlite/legacy";
import * as FileSystem from "expo-file-system";

const DB_NAME = "lanchonete.db";
let db: ReturnType<typeof openDatabase>;

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
  console.log("Iniciando banco de dados...");
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

          // Tabela de clientes
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS customers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              phone TEXT,
              email TEXT,
              address TEXT,
              notes TEXT,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );`
          );

          // Verificar se a coluna customer_id existe na tabela orders
          tx.executeSql(
            `SELECT name FROM pragma_table_info('orders') WHERE name = 'customer_id'`,
            [],
            (_, { rows }) => {
              if (rows.length === 0) {
                // Adicionar coluna customer_id se não existir
                tx.executeSql(
                  `ALTER TABLE orders ADD COLUMN customer_id INTEGER NULL 
                   REFERENCES customers(id)`,
                  [],
                  () => {
                    console.log("Coluna customer_id adicionada com sucesso");
                  },
                  (_, error) => {
                    // Ignora erro se a coluna já existir
                    if (!error.message.includes("duplicate column name")) {
                      console.error(
                        "Erro ao adicionar coluna customer_id:",
                        error
                      );
                      return false;
                    }
                    return true;
                  }
                );
              }
            }
          );

          // Tabela de movimentações do caixa
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS cash_movements (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              type TEXT NOT NULL, -- 'opening', 'closing', 'sale', 'expense', 'withdrawal', 'deposit'
              amount REAL NOT NULL,
              description TEXT,
              order_id INTEGER NULL,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              user_id INTEGER NOT NULL,
              FOREIGN KEY (order_id) REFERENCES orders(id),
              FOREIGN KEY (user_id) REFERENCES users(id)
            );`
          );

          // Tabela de status do caixa
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS cash_status (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              is_open BOOLEAN NOT NULL DEFAULT 0,
              opened_at TEXT,
              opened_by INTEGER,
              initial_amount REAL,
              current_amount REAL,
              FOREIGN KEY (opened_by) REFERENCES users(id)
            );`
          );

          // Verificar se a coluna user_id existe na tabela orders
          tx.executeSql(
            `SELECT name FROM pragma_table_info('orders') WHERE name = 'user_id'`,
            [],
            (_, { rows }) => {
              if (rows.length === 0) {
                // Adicionar coluna user_id se não existir
                tx.executeSql(
                  `ALTER TABLE orders ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1 
                   REFERENCES users(id)`,
                  [],
                  () => {
                    console.log("Coluna user_id adicionada com sucesso");
                  },
                  (_, error) => {
                    console.error("Erro ao adicionar coluna user_id:", error);
                    return false;
                  }
                );
              }
            }
          );

          // Verificar se precisamos renomear a coluna price para unit_price na tabela order_items
          tx.executeSql(
            `SELECT name FROM pragma_table_info('order_items') WHERE name = 'price'`,
            [],
            (_, { rows }) => {
              if (rows.length > 0) {
                // Renomear coluna price para unit_price
                tx.executeSql(
                  `ALTER TABLE order_items RENAME COLUMN price TO unit_price`,
                  [],
                  () => {
                    console.log(
                      "Coluna price renomeada para unit_price com sucesso"
                    );
                  },
                  (_, error) => {
                    console.error("Erro ao renomear coluna price:", error);
                    return false;
                  }
                );
              }
            }
          );

          // Adicionar à função initDatabase
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS inventory_movements (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              product_id INTEGER NOT NULL,
              type TEXT NOT NULL, -- 'in' ou 'out'
              quantity INTEGER NOT NULL,
              reason TEXT NOT NULL, -- 'sale', 'purchase', 'adjustment'
              order_id INTEGER,
              notes TEXT,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              user_id INTEGER NOT NULL,
              FOREIGN KEY (product_id) REFERENCES products(id),
              FOREIGN KEY (order_id) REFERENCES orders(id),
              FOREIGN KEY (user_id) REFERENCES users(id)
            );`
          );

          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS product_stock (
              product_id INTEGER PRIMARY KEY,
              quantity INTEGER NOT NULL DEFAULT 0,
              min_quantity INTEGER DEFAULT 0,
              last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (product_id) REFERENCES products(id)
            );`
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
  console.log("Obtendo instância do banco de dados...");
  return db;
};
