import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { formatCurrency } from '../../../utils/format';
import { Customer } from '../../../database/customerRepository';
import { Order } from '../../../database/orderRepository';

export default function CustomerDetails() {
  const { customerId } = useLocalSearchParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    // Implementar carregamento dos dados do cliente e seus pedidos
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.customerInfo}>
        {customer && (
          <>
            <Text style={styles.customerName}>{customer.name}</Text>
            {customer.phone && (
              <Text style={styles.customerDetail}>📱 {customer.phone}</Text>
            )}
            {customer.email && (
              <Text style={styles.customerDetail}>📧 {customer.email}</Text>
            )}
          </>
        )}
      </View>

      <View style={styles.ordersList}>
        <Text style={styles.sectionTitle}>Histórico de Pedidos</Text>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.orderCard}>
              <Text style={styles.orderDate}>
                {new Date(item.created_at!).toLocaleDateString()}
              </Text>
              <Text style={styles.orderTotal}>
                {formatCurrency(item.total)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          }
        />
      </View>
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
  customerInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 16,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
}); 