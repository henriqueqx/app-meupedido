import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { initDatabase } from "../database/database";
import { AuthProvider } from "./contexts/AuthContext";
import { InitialLayout } from "./InitialLayout";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        console.log('Banco de dados inicializado');
        setIsDbReady(true);
      } catch (error) {
        console.error('Erro ao inicializar banco:', error);
      }
    };

    init();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
