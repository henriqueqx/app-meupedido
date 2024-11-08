import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderRepository, Order } from '../../database/orderRepository';
import { useFocusEffect } from 'expo-router';
import { formatCurrency } from '../../utils/format';

const STATUS_COLORS = {
  pending: '#f1c40f',     // Amarelo
  preparing: '#3498db',   // Azul
  ready: '#2ecc71',       // Verde
  delivered: '#95a5a6',   // Cinza
  cancelled: '#e74c3c'    // Vermelho
};

const STATUS_LABELS = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const ordersList = await orderRepository.findAll();
      setOrders(ordersList);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      await orderRepository.updateStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
      delivered: null,
      cancelled: null
    };
    return statusFlow[currentStatus] as Order['status'] | null;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>Pedido #{item.id}</Text>
          {item.customer_name && (
            <Text style={styles.customerName}>Cliente: {item.customer_name}</Text>
          )}
          {item.table_number && (
            <Text style={styles.tableNumber}>Mesa: {item.table_number}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
            <Text style={styles.itemName}>{orderItem.product?.name}</Text>
            <Text style={styles.itemPrice}>
              {formatCurrency(orderItem.unit_price * orderItem.quantity)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>Total: {formatCurrency(item.total)}</Text>
        {item.status !== 'delivered' && item.status !== 'cancelled' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: STATUS_COLORS[item.status] }]}
              onPress={() => {
                const nextStatus = getNextStatus(item.status);
                if (nextStatus) {
                  handleUpdateStatus(item.id!, nextStatus);
                }
              }}
            >
              <Text style={styles.actionButtonText}>
                {item.status === 'pending' ? 'Preparar' :
                 item.status === 'preparing' ? 'Pronto' :
                 item.status === 'ready' ? 'Entregar' : ''}
              </Text>
            </TouchableOpacity>
            
            {item.status === 'pending' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: STATUS_COLORS.cancelled }]}
                onPress={() => handleUpdateStatus(item.id!, 'cancelled')}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id!.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tableNumber: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 40,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  orderFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 