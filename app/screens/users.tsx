import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userRepository, User } from '../../database/userRepository';
import { useRouter } from 'expo-router';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersList = await userRepository.findAll();
      setUsers(usersList);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      await userRepository.deactivate(userId);
      loadUsers(); // Recarrega a lista após desativar
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
        <Text style={styles.userAccess}>
          Nível: {item.access_level_id === 1 ? 'Administrador' : 
                 item.access_level_id === 2 ? 'Gerente' : 
                 item.access_level_id === 3 ? 'Caixa' : 'Atendente'}
        </Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity 
          onPress={() => router.push({
            pathname: 'screens/users/edit',
            params: { userId: item.id }
          } as any)}
          style={styles.actionButton}
        >
          <Ionicons name="create-outline" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDeactivateUser(item.id!)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('screens/users/new' as any)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Novo Usuário</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userAccess: {
    fontSize: 14,
    color: '#0a7ea4',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
}); 