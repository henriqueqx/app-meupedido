import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

// Define types for SQLite operations
interface SQLTransaction {
  executeSql(
    sqlStatement: string,
    args?: any[],
    success?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
    error?: (transaction: SQLTransaction, error: Error) => boolean | void
  ): void;
}

interface SQLResultSet {
  rows: {
    length: number;
    item: (index: number) => any;
    _array: any[];
  };
  insertId?: number;
  rowsAffected: number;
}

const DB_NAME = "lanchonete.db";
let db: SQLite.SQLiteDatabase;

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
    await getDatabasePath();

    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable WAL mode for better performance
    await db.execAsync("PRAGMA journal_mode = WAL");

    // Create products table
    await db.execAsync(`
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
    `);

    // Create orders tables
    await db.execAsync(`
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
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        notes TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      );
    `);

    // Create access levels and users tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS access_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
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
      );
    `);

    // Check and insert default access levels if needed
    const accessLevelsCount = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM access_levels"
    );
    if (accessLevelsCount?.count === 0) {
      await db.execAsync(`
        INSERT INTO access_levels (id, name, description) VALUES 
        (1, 'admin', 'Acesso total ao sistema'),
        (2, 'gerente', 'Acesso a relatórios e gestão'),
        (3, 'caixa', 'Acesso a vendas e consultas'),
        (4, 'atendente', 'Acesso básico ao sistema');
      `);
    }

    // Check and insert default admin user if needed
    const adminCount = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM users WHERE username = ?",
      ["admin"]
    );
    if (adminCount?.count === 0) {
      await db.runAsync(
        "INSERT INTO users (username, password, name, access_level_id) VALUES (?, ?, ?, ?)",
        ["admin", "admin123", "Administrador", 1]
      );
    }

    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error configuring database:", error);
    throw error;
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
};
