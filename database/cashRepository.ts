import { getDatabase } from "./database";

export interface CashMovement {
  id?: number;
  type: "opening" | "closing" | "sale" | "expense" | "withdrawal" | "deposit";
  amount: number;
  description?: string;
  order_id?: number;
  created_at?: string;
  user_id: number;
  user_name?: string;
  table_number?: string;
}

export interface CashStatus {
  id?: number;
  is_open: boolean;
  opened_at?: string;
  opened_by?: number;
  initial_amount: number;
  current_amount: number;
}

export const cashRepository = {
  async openCashier(userId: number, initialAmount: number): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Verificar se o caixa já está aberto
        tx.executeSql(
          "SELECT * FROM cash_status WHERE is_open = 1",
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              reject(new Error("O caixa já está aberto"));
              return;
            }

            // Abrir o caixa
            tx.executeSql(
              `INSERT INTO cash_status (is_open, opened_at, opened_by, initial_amount, current_amount)
               VALUES (1, CURRENT_TIMESTAMP, ?, ?, ?)`,
              [userId, initialAmount, initialAmount],
              (_, result) => {
                // Registrar movimento de abertura
                tx.executeSql(
                  `INSERT INTO cash_movements (type, amount, description, user_id)
                   VALUES ('opening', ?, 'Abertura de caixa', ?)`,
                  [initialAmount, userId],
                  () => resolve(),
                  (_, error) => {
                    reject(error);
                    return false;
                  }
                );
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          }
        );
      });
    });
  },

  async closeCashier(userId: number): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Verificar se o caixa está aberto
        tx.executeSql(
          "SELECT * FROM cash_status WHERE is_open = 1",
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              reject(new Error("O caixa não está aberto"));
              return;
            }

            const currentStatus = rows.item(0);

            // Registrar movimento de fechamento
            tx.executeSql(
              `INSERT INTO cash_movements (type, amount, description, user_id)
               VALUES ('closing', ?, 'Fechamento de caixa', ?)`,
              [currentStatus.current_amount, userId],
              () => {
                // Fechar o caixa
                tx.executeSql(
                  "UPDATE cash_status SET is_open = 0 WHERE is_open = 1",
                  [],
                  () => resolve(),
                  (_, error) => {
                    reject(error);
                    return false;
                  }
                );
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          }
        );
      });
    });
  },

  async getCurrentStatus(): Promise<CashStatus | null> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT cs.*, u.name as opened_by_name 
           FROM cash_status cs
           LEFT JOIN users u ON cs.opened_by = u.id
           WHERE cs.is_open = 1`,
          [],
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

  async addMovement(movement: CashMovement): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO cash_movements (type, amount, description, order_id, user_id)
           VALUES (?, ?, ?, ?, ?)`,
          [
            movement.type,
            movement.amount,
            movement.description || null,
            movement.order_id || null,
            movement.user_id,
          ],
          () => {
            // Atualizar saldo atual
            const amountChange = ["withdrawal", "expense"].includes(
              movement.type
            )
              ? -movement.amount
              : movement.amount;

            tx.executeSql(
              "UPDATE cash_status SET current_amount = current_amount + ? WHERE is_open = 1",
              [amountChange],
              () => resolve(),
              (_, error) => {
                reject(error);
                return false;
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

  async getMovements(date?: string): Promise<CashMovement[]> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        const dateFilter = date ? "AND date(cm.created_at) = date(?)" : "";

        tx.executeSql(
          `SELECT cm.*, u.name as user_name, o.table_number
           FROM cash_movements cm
           LEFT JOIN users u ON cm.user_id = u.id
           LEFT JOIN orders o ON cm.order_id = o.id
           WHERE 1=1 ${dateFilter}
           ORDER BY cm.created_at DESC`,
          date ? [date] : [],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
};
