import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { productRepository, Product } from '../../../database/productRepository';
import { orderRepository, Order } from '../../../database/orderRepository';
import { formatCurrency } from '../../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerAutocomplete } from '../../components/CustomerAutocomplete';
import { Customer } from '../../../database/customerRepository';
import { cashRepository } from '../../../database/cashRepository';

interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

export default function NewSale() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const productsList = await productRepository.findAll();
      setProducts(productsList);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (cartItems.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item ao pedido');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não identificado');
      return;
    }

    try {
      setIsSubmitting(true);

      const cashStatus = await cashRepository.getCurrentStatus();
      if (!cashStatus?.is_open) {
        Alert.alert('Erro', 'O caixa precisa estar aberto para registrar vendas');
        return;
      }
      
      const total = getTotal();
      
      const newOrder = {
        customer_id: selectedCustomer?.id || null,
        user_id: user.id,
        table_number: tableNumber,
        status: 'pending',
        total,
        items: cartItems.map(item => ({
          product_id: item.id!,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      console.log('Criando pedido:', newOrder);
      const orderId = await orderRepository.create(newOrder);
      console.log('Pedido criado com ID:', orderId);

      Alert.alert('Sucesso', 'Pedido criado com sucesso', [
        { 
          text: 'OK', 
          onPress: () => router.back() 
        }
      ]);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      if (error instanceof Error) {
        Alert.alert('Erro', error.message);
      } else {
        Alert.alert('Erro', 'Não foi possível criar o pedido');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => addToCart(item)}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productCategory}>{item.category}</Text>
      <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
      </View>
      
      <View style={styles.cartItemActions}>
        <TouchableOpacity onPress={() => updateQuantity(item.id!, item.quantity - 1)}>
          <Ionicons name="remove-circle-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
        
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        
        <TouchableOpacity onPress={() => updateQuantity(item.id!, item.quantity + 1)}>
          <Ionicons name="add-circle-outline" size={24} color="#2ecc71" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => removeFromCart(item.id!)}>
          <Ionicons name="trash-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
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
      <View style={styles.customerInfo}>
        <CustomerAutocomplete
          value={customerName}
          onChangeText={setCustomerName}
          onSelect={handleCustomerSelect}
        />
        <TextInput
          style={[styles.input, styles.tableInput]}
          placeholder="Mesa"
          value={tableNumber}
          onChangeText={setTableNumber}
          keyboardType="numeric"
        />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar produtos..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.content}>
        <View style={styles.productsContainer}>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id!.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
          />
        </View>

        <View style={styles.cartContainer}>
          <Text style={styles.cartTitle}>Pedido</Text>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id!.toString()}
            style={styles.cartList}
          />
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(getTotal())}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                  Finalizando...
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Finalizar Pedido</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  customerInfo: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  tableInput: {
    width: 80,
    marginLeft: 8,
    height: 45,
  },
  searchInput: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  productsContainer: {
    flex: 3,
    padding: 8,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCard: {
    width: '48%',
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
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginTop: 8,
  },
  cartContainer: {
    flex: 2,
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderLeftColor: '#DDD',
    padding: 16,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 12,
  },
  cartItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemName: {
    fontSize: 16,
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 