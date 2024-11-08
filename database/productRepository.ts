import { getDatabase } from './database';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  active?: number;
  created_at?: string;
  updated_at?: string;
}

class ProductRepository {
  async create(product: Product): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO products (name, description, price, category, image) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            product.name,
            product.description || null,
            product.price,
            product.category,
            product.image || null
          ],
          (_, result) => resolve(),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  async update(id: number, product: Partial<Product>): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(product).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      values.push(id);

      db.transaction(tx => {
        tx.executeSql(
          `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          values,
          (_, result) => resolve(),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  async findAll(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM products WHERE active = 1 ORDER BY name',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  async findById(id: number): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM products WHERE id = ? AND active = 1',
          [id],
          (_, { rows: { _array } }) => resolve(_array[0] || null),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  async deactivate(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE products SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [id],
          (_, result) => resolve(),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }
}

export const productRepository = new ProductRepository(); 