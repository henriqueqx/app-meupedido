import { getDatabase } from "./database";

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export const customerRepository = {
  async create(customer: Customer): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO customers (name, phone, email, address, notes) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            customer.name,
            customer.phone || null,
            customer.email || null,
            customer.address || null,
            customer.notes || null,
          ],
          (_, result) => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  async findAll(): Promise<Customer[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM customers ORDER BY name",
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

  async findById(id: number): Promise<Customer | null> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM customers WHERE id = ?",
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
  },

  async update(id: number, customer: Partial<Customer>): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE customers 
           SET name = ?, phone = ?, email = ?, address = ?, notes = ?
           WHERE id = ?`,
          [
            customer.name ?? "",
            customer.phone ?? null,
            customer.email ?? null,
            customer.address ?? null,
            customer.notes ?? null,
            id,
          ],
          (_, result) => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  async delete(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM customers WHERE id = ?",
          [id],
          (_, result) => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  async findByName(search: string): Promise<Customer[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM customers 
           WHERE name LIKE ? 
           ORDER BY name 
           LIMIT 5`,
          [`%${search}%`],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
};
