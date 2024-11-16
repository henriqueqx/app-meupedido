import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cashRepository, CashStatus, CashMovement } from '../../database/cashRepository';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';

export default function Cashier() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cashStatus, setCashStatus] = useState<CashStatus | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [showOpenCashModal, setShowOpenCashModal] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const status = await cashRepository.getCurrentStatus();
      setCashStatus(status);
      
      if (status?.is_open) {
        const todayMovements = await cashRepository.getMovements(
          new Date().toISOString().split('T')[0]
        );
        setMovements(todayMovements);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do caixa:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do caixa');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCashier = async () => {
    if (!initialAmount) {
      Alert.alert('Erro', 'Digite o valor inicial do caixa');
      return;
    }

    const amount = parseFloat(initialAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    try {
      await cashRepository.openCashier(user!.id!, amount);
      setShowOpenCashModal(false);
      setInitialAmount('');
      loadData();
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      Alert.alert('Erro', 'Não foi possível abrir o caixa');
    }
  };

  const handleCloseCashier = async () => {
    Alert.alert(
      'Fechar Caixa',
      'Deseja realmente fechar o caixa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Fechar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cashRepository.closeCashier(user!.id!);
              loadData();
            } catch (error) {
              console.error('Erro ao fechar caixa:', error);
              Alert.alert('Erro', 'Não foi possível fechar o caixa');
            }
          }
        }
      ]
    );
  };

  const handleAddMovement = async (type: CashMovement['type']) => {
    try {
      const amount = await new Promise<number>((resolve) => {
        Alert.prompt(
          type === 'deposit' ? 'Adicionar Entrada' : 'Adicionar Saída',
          'Digite o valor:',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Confirmar',
              onPress: (value) => {
                const amount = parseFloat(value?.replace(',', '.') || '0');
                resolve(amount);
              }
            }
          ],
          'plain-text',
          '',
          'decimal-pad'
        );
      });

      if (amount > 0) {
        const description = await new Promise<string>((resolve) => {
          Alert.prompt(
            'Descrição',
            'Digite uma descrição para o movimento:',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Confirmar',
                onPress: (value) => resolve(value || '')
              }
            ]
          );
        });

        await cashRepository.addMovement({
          type,
          amount,
          description,
          user_id: user!.id!
        });

        loadData();
      }
    } catch (error) {
      console.error('Erro ao adicionar movimento:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o movimento');
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={showOpenCashModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOpenCashModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Abrir Caixa</Text>
            
            <Text style={styles.modalLabel}>Valor inicial:</Text>
            <TextInput
              style={styles.modalInput}
              value={initialAmount}
              onChangeText={setInitialAmount}
              keyboardType="decimal-pad"
              placeholder="0,00"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowOpenCashModal(false);
                  setInitialAmount('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleOpenCashier}
              >
                <Text style={styles.modalButtonText}>Abrir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.statusValue,
            { color: cashStatus?.is_open ? '#27ae60' : '#e74c3c' }
          ]}>
            {cashStatus?.is_open ? 'Aberto' : 'Fechado'}
          </Text>
        </View>

        {cashStatus?.is_open ? (
          <>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Saldo Atual:</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(cashStatus.current_amount)}
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
                onPress={() => handleAddMovement('deposit')}
              >
                <Ionicons name="add-circle-outline" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Entrada</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
                onPress={() => handleAddMovement('withdrawal')}
              >
                <Ionicons name="remove-circle-outline" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Saída</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#f39c12' }]}
                onPress={handleCloseCashier}
              >
                <Ionicons name="lock-closed-outline" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
            onPress={() => setShowOpenCashModal(true)}
          >
            <Ionicons name="lock-open-outline" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Abrir Caixa</Text>
          </TouchableOpacity>
        )}
      </View>

      {cashStatus?.is_open && (
        <ScrollView
          style={styles.movementsList}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.movementsTitle}>Movimentações do Dia</Text>
          {movements.map((movement) => (
            <View key={movement.id} style={styles.movementItem}>
              <View style={styles.movementInfo}>
                <Text style={styles.movementType}>
                  {movement.type === 'sale' ? '🛍️ Venda' :
                   movement.type === 'deposit' ? '⬆️ Entrada' :
                   movement.type === 'withdrawal' ? '⬇️ Saída' :
                   movement.type === 'opening' ? '🔓 Abertura' :
                   movement.type === 'closing' ? '🔒 Fechamento' : '💰 Movimento'}
                </Text>
                <Text style={styles.movementDescription}>
                  {movement.description || 
                   (movement.order_id ? `Pedido - Mesa ${movement.table_number}` : '')}
                </Text>
              </View>
              <Text style={[
                styles.movementAmount,
                { 
                  color: ['withdrawal', 'expense'].includes(movement.type) 
                    ? '#e74c3c' 
                    : '#27ae60' 
                }
              ]}>
                {formatCurrency(movement.amount)}
              </Text>
            </View>
          ))}
        </ScrollView>
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
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  movementsList: {
    flex: 1,
    padding: 16,
  },
  movementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  movementInfo: {
    flex: 1,
  },
  movementType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  movementDescription: {
    fontSize: 14,
    color: '#666',
  },
  movementAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#95a5a6',
  },
  modalButtonConfirm: {
    backgroundColor: '#27ae60',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 