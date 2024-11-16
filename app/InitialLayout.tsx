import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from './contexts/AuthContext';
import { ActivityIndicator, View } from "react-native";

export function InitialLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/screens/home');
      } else {
        router.replace('/');
      }
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="screens/home" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen 
        name="screens/profile" 
        options={{ 
          title: 'Meu Perfil' 
        }} 
      />
      <Stack.Screen 
        name="screens/products" 
        options={{ 
          title: 'Produtos' 
        }} 
      />
      <Stack.Screen 
        name="screens/products/new" 
        options={{ 
          title: 'Novo Produto',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="screens/products/edit" 
        options={{ 
          title: 'Editar Produto'
        }} 
      />
      <Stack.Screen 
        name="screens/customers" 
        options={{ 
          title: 'Clientes' 
        }} 
      />
      <Stack.Screen 
        name="screens/orders" 
        options={{ 
          title: 'Pedidos' 
        }} 
      />
      <Stack.Screen 
        name="screens/reports" 
        options={{ 
          title: 'Relatórios' 
        }} 
      />
      <Stack.Screen 
        name="screens/settings" 
        options={{ 
          title: 'Configurações' 
        }} 
      />
      <Stack.Screen 
        name="screens/users" 
        options={{ 
          title: 'Usuários' 
        }} 
      />
      <Stack.Screen 
        name="screens/cashier" 
        options={{ 
          title: 'Caixa' 
        }} 
      />
      <Stack.Screen 
        name="screens/sales/new" 
        options={{ 
          title: 'Nova Venda' 
        }} 
      />
      <Stack.Screen 
        name="screens/users/new" 
        options={{ 
          title: 'Novo Usuário',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="screens/users/edit" 
        options={{ 
          title: 'Editar Usuário'
        }} 
      />
      <Stack.Screen 
        name="screens/customers/new" 
        options={{ 
          title: 'Novo Cliente',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="screens/customers/edit" 
        options={{ 
          title: 'Editar Cliente'
        }} 
      />
    </Stack>
  );
} 