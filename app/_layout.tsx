import { Stack } from "expo-router";
import { useEffect } from "react";
import { initDatabase } from "../database/database";
import { AuthProvider } from "./contexts/AuthContext";
import { InitialLayout } from "./InitialLayout";

export default function RootLayout() {
  useEffect(() => {
    initDatabase()
      .then(() => console.log('Banco de dados inicializado'))
      .catch(error => console.error('Erro ao inicializar banco:', error));
  }, []);

  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
