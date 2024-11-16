import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { orderRepository } from '../../database/orderRepository';
import { cashRepository } from '../../database/cashRepository';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface DashboardData {
  todaySales: number;
  pendingOrders: number;
  cashBalance: number | null;
  totalOrders: number;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

function MenuItem({ icon, label, onPress, color = '#0a7ea4' }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#FFF" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function DashboardCard({ title, value, icon, color }: DashboardCardProps) {
  return (
    <View style={[styles.dashboardCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todaySales: 0,
    pendingOrders: 0,
    cashBalance: null,
    totalOrders: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados do caixa
      const cashStatus = await cashRepository.getCurrentStatus();
      
      // Carregar dados dos pedidos
      const today = new Date().toISOString().split('T')[0];
      const orders = await orderRepository.findAll();
      
      const todayOrders = orders.filter(order => 
        order.created_at?.startsWith(today)
      );
      
      const pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'preparing'
      );

      setDashboardData({
        todaySales: todayOrders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: pendingOrders.length,
        cashBalance: cashStatus?.current_amount ?? null,
        totalOrders: orders.length
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lanchonete App</Text>
        <TouchableOpacity onPress={() => router.push('screens/profile' as any)}>
          <Ionicons name="person-circle-outline" size={32} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : (
          <>
            <View style={styles.dashboardGrid}>
              <DashboardCard
                title="Vendas Hoje"
                value={formatCurrency(dashboardData.todaySales)}
                icon="cash-outline"
                color="#27ae60"
              />
              <DashboardCard
                title="Pedidos Pendentes"
                value={dashboardData.pendingOrders.toString()}
                icon="time-outline"
                color="#e67e22"
              />
              {dashboardData.cashBalance !== null && (
                <DashboardCard
                  title="Saldo em Caixa"
                  value={formatCurrency(dashboardData.cashBalance)}
                  icon="wallet-outline"
                  color="#0a7ea4"
                />
              )}
              <DashboardCard
                title="Total de Pedidos"
                value={dashboardData.totalOrders.toString()}
                icon="receipt-outline"
                color="#8e44ad"
              />
            </View>

            <View style={styles.menuGrid}>
              <MenuItem
                icon="cart-outline"
                label="Nova Venda"
                onPress={() => router.push('screens/sales/new' as any)}
                color="#2ecc71"
              />
              <MenuItem
                icon="list-outline"
                label="Pedidos"
                onPress={() => router.push('screens/orders' as any)}
              />
              <MenuItem
                icon="cube-outline"
                label="Produtos"
                onPress={() => router.push('screens/products' as any)}
              />
              <MenuItem
                icon="people-outline"
                label="Clientes"
                onPress={() => router.push('screens/customers' as any)}
              />
              <MenuItem
                icon="bar-chart-outline"
                label="Relatórios"
                onPress={() => router.push('screens/reports' as any)}
              />
              <MenuItem
                icon="settings-outline"
                label="Configurações"
                onPress={() => router.push('screens/settings' as any)}
              />
              <MenuItem
                icon="people"
                label="Usuários"
                onPress={() => router.push('screens/users' as any)}
              />
              <MenuItem
                icon="calculator-outline"
                label="Caixa"
                onPress={() => router.push('screens/cashier' as any)}
                color="#e74c3c"
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dashboardCard: {
    backgroundColor: '#FFF',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    width: '45%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '45%',
    backgroundColor: '#FFF',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
}); 