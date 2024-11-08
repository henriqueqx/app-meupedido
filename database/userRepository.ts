import { getDatabase } from './database';

export interface User {
  id?: number;
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  access_level_id: number;
  active?: number;
  created_at?: string;
  last_login?: string;
}

export const userRepository = {
  create: (user: User): Promise<number> => {
    return new Promise((resolve, reject) => {
      getDatabase().transaction((tx) => {
        tx.executeSql(
          `INSERT INTO users (username, password, name, email, phone, access_level_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            user.username, 
            user.password, 
            user.name, 
            user.email || null, 
            user.phone || null, 
            user.access_level_id
          ],
          (_, result) => resolve(result.insertId || 0),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  authenticate: (username: string, password: string): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      getDatabase().transaction((tx) => {
        tx.executeSql(
          `SELECT u.*, al.name as access_level_name 
           FROM users u 
           JOIN access_levels al ON u.access_level_id = al.id 
           WHERE u.username = ? AND u.password = ? AND u.active = 1`,
          [username, password],
          (_, { rows }) => {
            if (rows.length > 0) {
              tx.executeSql(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [rows.item(0).id]
              );
              resolve(rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  findAll: (): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      getDatabase().transaction((tx) => {
        tx.executeSql(
          `SELECT u.*, al.name as access_level_name 
           FROM users u 
           JOIN access_levels al ON u.access_level_id = al.id`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  update: (id: number, user: Partial<User>): Promise<void> => {
    const fields = Object.keys(user).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(user).map(v => v ?? null), id];

    return new Promise((resolve, reject) => {
      getDatabase().transaction((tx) => {
        tx.executeSql(
          `UPDATE users SET ${fields} WHERE id = ?`,
          values,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  deactivate: (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      getDatabase().transaction((tx) => {
        tx.executeSql(
          'UPDATE users SET active = 0 WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  findById: (id: number): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      getDatabase().transaction((tx) => {
        tx.executeSql(
          `SELECT u.*, al.name as access_level_name 
           FROM users u 
           JOIN access_levels al ON u.access_level_id = al.id 
           WHERE u.id = ?`,
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}; 