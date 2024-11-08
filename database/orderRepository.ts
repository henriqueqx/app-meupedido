import { getDatabase } from './database';
import { Product } from './productRepository';

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface Order {
  id?: number;
  customer_name?: string;
  table_number?: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id: number;
  items: OrderItem[];
}

class OrderRepository {
  async create(order: Order): Promise<number> {
    // Validar dados obrigatórios
    if (!order.user_id) {
      throw new Error('ID do usuário é obrigatório');
    }
    if (!order.items || order.items.length === 0) {
      throw new Error('Pedido deve ter pelo menos um item');
    }

    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO orders (
            customer_name, table_number, status, total, 
            payment_method, notes, user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            order.customer_name || null,
            order.table_number || null,
            order.status,
            order.total,
            order.payment_method || null,
            order.notes || null,
            order.user_id
          ],
          (_, result) => {
            const orderId = result.insertId;
            if (!orderId) {
              reject(new Error('Erro ao criar pedido'));
              return;
            }

            // Inserir os itens do pedido
            order.items.forEach(item => {
              if (!item.product_id) {
                reject(new Error('ID do produto é obrigatório'));
                return;
              }

              tx.executeSql(
                `INSERT INTO order_items (
                  order_id, product_id, quantity, unit_price, notes
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                  orderId,
                  item.product_id,
                  item.quantity,
                  item.unit_price,
                  item.notes || null
                ],
                undefined,
                (_, error) => {
                  reject(error);
                  return true;
                }
              );
            });

            resolve(orderId);
          },
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  async findById(id: number): Promise<Order | null> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        // Buscar o pedido
        tx.executeSql(
          `SELECT * FROM orders WHERE id = ?`,
          [id],
          (_, { rows }) => {
            if (rows.length === 0) {
              resolve(null);
              return;
            }

            const order = rows.item(0) as Order;
            
            // Buscar os itens do pedido
            tx.executeSql(
              `SELECT oi.*, p.name as product_name, p.price as product_price 
               FROM order_items oi
               JOIN products p ON p.id = oi.product_id
               WHERE oi.order_id = ?`,
              [id],
              (_, { rows: itemRows }) => {
                order.items = itemRows._array;
                resolve(order);
              }
            );
          },
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  async findAll(): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          `SELECT o.*, 
                  oi.id as item_id, 
                  oi.quantity, 
                  oi.unit_price, 
                  oi.notes as item_notes,
                  p.name as product_name,
                  p.price as product_price,
                  p.category as product_category
           FROM orders o
           LEFT JOIN order_items oi ON o.id = oi.order_id
           LEFT JOIN products p ON oi.product_id = p.id
           ORDER BY o.created_at DESC`,
          [],
          (_, { rows }) => {
            const ordersMap = new Map<number, Order>();
            
            rows._array.forEach(row => {
              if (!ordersMap.has(row.id)) {
                // Criar novo pedido
                ordersMap.set(row.id, {
                  id: row.id,
                  customer_name: row.customer_name,
                  table_number: row.table_number,
                  status: row.status,
                  total: row.total,
                  payment_method: row.payment_method,
                  notes: row.notes,
                  created_at: row.created_at,
                  updated_at: row.updated_at,
                  user_id: row.user_id,
                  items: []
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
                    category: row.product_category
                  }
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
  }

  async updateStatus(id: number, status: Order['status']): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
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
  }
}

export const orderRepository = new OrderRepository(); 