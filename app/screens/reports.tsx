import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDate } from '../../utils/format';
import { orderRepository } from '../../database/orderRepository';
import { cashRepository } from '../../database/cashRepository';

interface TopProduct {
  id: number;
  name: string;
  quantity: number;
  total: number;
}

interface ReportData {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  topProducts: TopProduct[];
  cashMovements: {
    inflow: number;
    outflow: number;
    balance: number;
  };
}

export default function Reports() {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState<ReportData>({
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
    topProducts: [],
    cashMovements: {
      inflow: 0,
      outflow: 0,
      balance: 0
    }
  });

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);

      // Buscar todos os pedidos do período
      const orders = await orderRepository.findAll();
      const startDateTime = startDate.setHours(0, 0, 0, 0);
      const endDateTime = endDate.setHours(23, 59, 59, 999);

      // Filtrar pedidos do período
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at!).getTime();
        return orderDate >= startDateTime && orderDate <= endDateTime;
      });

      // Calcular totais
      const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = filteredOrders.length;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Calcular produtos mais vendidos
      const productsMap = new Map<number, TopProduct>();
      
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          const existing = productsMap.get(item.product_id);
          if (existing) {
            existing.quantity += item.quantity;
            existing.total += item.quantity * item.unit_price;
          } else {
            productsMap.set(item.product_id, {
              id: item.product_id,
              name: item.product?.name || 'Produto não encontrado',
              quantity: item.quantity,
              total: item.quantity * item.unit_price
            });
          }
        });
      });

      const topProducts = Array.from(productsMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Buscar movimentações do caixa
      const movements = await cashRepository.getMovements(
        startDate.toISOString().split('T')[0]
      );

      const cashMovements = movements.reduce(
        (acc, movement) => {
          if (['sale', 'deposit'].includes(movement.type)) {
            acc.inflow += movement.amount;
          } else if (['withdrawal', 'expense'].includes(movement.type)) {
            acc.outflow += movement.amount;
          }
          return acc;
        },
        { inflow: 0, outflow: 0, balance: 0 }
      );

      cashMovements.balance = cashMovements.inflow - cashMovements.outflow;

      setReportData({
        totalSales,
        totalOrders,
        averageTicket,
        topProducts,
        cashMovements
      });

    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dateFilters}>
        <Text style={styles.dateLabel}>Período: {formatDate(startDate)} - {formatDate(endDate)}</Text>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.cardTitle}>Resumo de Vendas</Text>
        <Text style={styles.cardValue}>{formatCurrency(reportData.totalSales)}</Text>
        <Text style={styles.cardSubtitle}>{reportData.totalOrders} pedidos</Text>
        <Text style={styles.cardSubtitle}>
          Ticket Médio: {formatCurrency(reportData.averageTicket)}
        </Text>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.cardTitle}>Movimentação do Caixa</Text>
        <View style={styles.cashMovements}>
          <View style={styles.cashMovementItem}>
            <Ionicons name="arrow-up-circle" size={24} color="#27ae60" />
            <Text style={styles.movementLabel}>Entradas</Text>
            <Text style={[styles.movementValue, { color: '#27ae60' }]}>
              {formatCurrency(reportData.cashMovements.inflow)}
            </Text>
          </View>
          <View style={styles.cashMovementItem}>
            <Ionicons name="arrow-down-circle" size={24} color="#e74c3c" />
            <Text style={styles.movementLabel}>Saídas</Text>
            <Text style={[styles.movementValue, { color: '#e74c3c' }]}>
              {formatCurrency(reportData.cashMovements.outflow)}
            </Text>
          </View>
          <View style={styles.cashMovementItem}>
            <Ionicons name="wallet" size={24} color="#0a7ea4" />
            <Text style={styles.movementLabel}>Saldo</Text>
            <Text style={[styles.movementValue, { color: '#0a7ea4' }]}>
              {formatCurrency(reportData.cashMovements.balance)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.cardTitle}>Produtos Mais Vendidos</Text>
        {reportData.topProducts.map((product, index) => (
          <View key={product.id} style={styles.productItem}>
            <Text style={styles.productRank}>#{index + 1}</Text>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productQuantity}>{product.quantity} unidades</Text>
            </View>
            <Text style={styles.productTotal}>{formatCurrency(product.total)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
  dateFilters: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 16,
    color: '#666',
  },
  reportCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  cashMovements: {
    marginTop: 8,
  },
  cashMovementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  movementLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  movementValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: 40,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#333',
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
}); 