import { getDatabase } from "./database";
import { Product } from "./productRepository";

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
  product?: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
}

export interface Order {
  id?: number;
  customer_id?: number | null;
  customer_name?: string;
  customer_phone?: string;
  table_number?: string;
  status: string;
  total: number;
  created_at?: string;
  items: OrderItem[];
}

export const orderRepository = {
  async create(order: Order): Promise<number> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO orders (customer_id, table_number, status, total) 
             VALUES (?, ?, ?, ?)`,
          [
            order.customer_id || null,
            order.table_number || null,
            order.status,
            order.total,
          ],
          (_, result) => {
            const orderId = result.insertId!;

            order.items.forEach((item) => {
              tx.executeSql(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
                   VALUES (?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.unit_price],
                undefined,
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            });

            resolve(orderId);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  async findById(id: number): Promise<Order | null> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT o.*, c.name as customer_name, c.phone as customer_phone
           FROM orders o
           LEFT JOIN customers c ON o.customer_id = c.id
           WHERE o.id = ?`,
          [id],
          async (_, { rows }) => {
            if (rows.length === 0) {
              resolve(null);
              return;
            }

            const order = rows.item(0);

            // Buscar os itens do pedido (mantém o código existente)
            tx.executeSql(
              `SELECT oi.*, p.name as product_name 
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = ?`,
              [id],
              (_, { rows: itemRows }) => {
                const items = [];
                for (let i = 0; i < itemRows.length; i++) {
                  items.push(itemRows.item(i));
                }
                resolve({
                  ...order,
                  items,
                });
              }
            );
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },

  async findAll(): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction((tx) => {
        tx.executeSql(
          `SELECT o.*, 
                  oi.id as item_id, 
                  oi.quantity, 
                  oi.unit_price, 
                  oi.notes as item_notes,
                  p.name as product_name,
                  p.price as product_price,
                  p.category as product_category,
                  c.name as customer_name,
                  c.phone as customer_phone
           FROM orders o
           LEFT JOIN order_items oi ON o.id = oi.order_id
           LEFT JOIN products p ON oi.product_id = p.id
           LEFT JOIN customers c ON o.customer_id = c.id
           ORDER BY o.created_at DESC`,
          [],
          (_, { rows }) => {
            const ordersMap = new Map<number, Order>();

            rows._array.forEach((row) => {
              if (!ordersMap.has(row.id)) {
                // Criar novo pedido
                ordersMap.set(row.id, {
                  id: row.id,
                  customer_id: row.customer_id,
                  customer_name: row.customer_name,
                  customer_phone: row.customer_phone,
                  table_number: row.table_number,
                  status: row.status,
                  total: row.total,
                  created_at: row.created_at,
                  items: [],
                });
              }

              // Adicionar item ao pedido se existir
              if (row.item_id) {
                const order = ordersMap.get(row.id)!;
                order.items.push({
                  id: row.item_id,
                  order_id: row.id,
                  product_id: row.product_id,
                  quantity: row.quantity,
                  unit_price: row.unit_price,
                  notes: row.item_notes,
                  product: {
                    id: row.product_id,
                    name: row.product_name,
                    price: row.product_price,
                    category: row.product_category,
                  },
                });
              }
            });

            resolve(Array.from(ordersMap.values()));
          },
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  },

  async updateStatus(id: number, status: Order["status"]): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();

      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [status, id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  },
};
