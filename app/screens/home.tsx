import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

const MenuItem = ({ icon, label, onPress, color = "#0a7ea4" }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={32} color="#FFF" />
    </View>
    <Text style={styles.menuItemText}>{label}</Text>
  </TouchableOpacity>
);

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lanchonete App </Text>
        <TouchableOpacity onPress={() => router.push('screens/profile' as any)}>
          <Ionicons name="person-circle-outline" size={32} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
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
    color: '#0a7ea4',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  menuItem: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
}); 