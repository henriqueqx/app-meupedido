import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { userRepository } from '../../../database/userRepository';
import { useRouter } from 'expo-router';

type AccessLevel = 1 | 2 | 3 | 4;

const accessLevelOptions = [
  { label: 'Administrador', value: 1 },
  { label: 'Gerente', value: 2 },
  { label: 'Caixa', value: 3 },
  { label: 'Atendente', value: 4 },
];

export default function NewUser() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(4); // 4 = atendente (padrão)

  const handleSubmit = async () => {
    if (!name || !username || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    try {
      await userRepository.create({
        name,
        username,
        password,
        email,
        phone,
        access_level_id: accessLevel,
        active: 1
      });

      Alert.alert('Sucesso', 'Usuário criado com sucesso', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      Alert.alert('Erro', 'Não foi possível criar o usuário');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nome*</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nome completo"
        />

        <Text style={styles.label}>Usuário*</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Nome de usuário"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha*</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Senha"
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar Senha*</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirme a senha"
          secureTextEntry
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Telefone"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Nível de Acesso*</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            value={accessLevel}
            onValueChange={(value: AccessLevel) => setAccessLevel(value)}
            items={accessLevelOptions}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            placeholder={{}}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Criar Usuário</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#333',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#333',
  },
}); 