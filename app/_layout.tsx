import { Stack } from "expo-router";
import { useEffect } from "react";
import { initDatabase } from "../database/database";

export default function RootLayout() {
  useEffect(() => {
    initDatabase()
      .then(() => console.log('Banco de dados inicializado'))
      .catch(error => console.error('Erro ao inicializar banco:', error));
  }, []);

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
          title: 'Editar Usuário',
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
}
