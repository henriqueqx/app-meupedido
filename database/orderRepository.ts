import { getDatabase } from "./database";
import { Product } from "./productRepository";
import { cashRepository } from "./cashRepository";

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
  user_id: number;
  table_number?: string;
  status: string;
  total: number;
  created_at?: string;
  items: OrderItem[];
  _customer?: {
    name: string;
    phone?: string;
  };
}

export const orderRepository = {
  async create(order: Order): Promise<number> {
    const db = getDatabase();
    console.log("Iniciando criação do pedido");

    // Verificar se o caixa está aberto antes da transação
    const cashStatus = await cashRepository.getCurrentStatus();
    if (!cashStatus?.is_open) {
      throw new Error("O caixa precisa estar aberto para registrar vendas");
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          // Primeiro, inserir o pedido
          tx.executeSql(
            `INSERT INTO orders (customer_id, user_id, table_number, status, total) 
           VALUES (?, ?, ?, ?, ?)`,
            [
              order.customer_id || null,
              order.user_id,
              order.table_number || null,
              order.status,
              order.total,
            ],
            (_, result) => {
              const orderId = result.insertId!;
              console.log("Pedido inserido, ID:", orderId);

              // Depois, inserir os itens
              order.items.forEach((item) => {
                tx.executeSql(
                  `INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
                 VALUES (?, ?, ?, ?)`,
                  [orderId, item.product_id, item.quantity, item.unit_price],
                  () => {
                    console.log("Item inserido para o pedido:", orderId);
                  },
                  (_, error) => {
                    console.error("Erro ao inserir item:", error);
                    return false;
                  }
                );
              });

              // Por fim, registrar no caixa
              tx.executeSql(
                `INSERT INTO cash_movements (type, amount, description, order_id, user_id)
               VALUES (?, ?, ?, ?, ?)`,
                [
                  "sale",
                  order.total,
                  `Venda - Pedido #${orderId}${
                    order.table_number ? ` - Mesa ${order.table_number}` : ""
                  }`,
                  orderId,
                  order.user_id,
                ],
                () => {
                  console.log("Movimento de caixa registrado");
                  // Atualizar o saldo do caixa
                  tx.executeSql(
                    "UPDATE cash_status SET current_amount = current_amount + ? WHERE is_open = 1",
                    [order.total],
                    () => {
                      console.log("Saldo do caixa atualizado");
                      resolve(orderId);
                    },
                    (_, error) => {
                      console.error("Erro ao atualizar saldo:", error);
                      return false;
                    }
                  );
                },
                (_, error) => {
                  console.error("Erro ao registrar movimento:", error);
                  return false;
                }
              );
            },
            (_, error) => {
              console.error("Erro ao inserir pedido:", error);
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error("Erro na transação:", error);
          reject(error);
        },
        () => {
          console.log("Transação completada com sucesso");
        }
      );
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

            const orderData = rows.item(0);

            // Buscar os itens do pedido
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

                // Construir o objeto Order com a estrutura correta
                const order: Order = {
                  id: orderData.id,
                  customer_id: orderData.customer_id,
                  user_id: orderData.user_id,
                  table_number: orderData.table_number,
                  status: orderData.status,
                  total: orderData.total,
                  created_at: orderData.created_at,
                  items,
                  _customer: orderData.customer_name
                    ? {
                        name: orderData.customer_name,
                        phone: orderData.customer_phone,
                      }
                    : undefined,
                };

                resolve(order);
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
          `SELECT o.*, c.name as customer_name, c.phone as customer_phone
           FROM orders o
           LEFT JOIN customers c ON o.customer_id = c.id
           ORDER BY o.created_at DESC`,
          [],
          (_, { rows }) => {
            const orders = rows._array.map((row) => ({
              id: row.id,
              customer_id: row.customer_id,
              user_id: row.user_id,
              table_number: row.table_number,
              status: row.status,
              total: row.total,
              created_at: row.created_at,
              items: [], // Será preenchido depois se necessário
              _customer: row.customer_name
                ? {
                    name: row.customer_name,
                    phone: row.customer_phone,
                  }
                : undefined,
            }));

            resolve(orders);
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
