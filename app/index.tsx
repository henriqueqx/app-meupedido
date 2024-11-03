import { useState } from "react";
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Implementar lógica de login aqui
    console.log("Login:", username, password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Ionicons name="restaurant" size={100} color="#0a7ea4" />
        <Text style={styles.logoText}>Lanchonete App</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Usuário"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0a7ea4",
    marginTop: 10
  },
  formContainer: {
    flex: 2,
    paddingHorizontal: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    height: 50,
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotPasswordText: {
    color: "#0a7ea4",
    fontSize: 14,
  },
});
