import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { customerRepository } from '../../../database/customerRepository';
import { useRouter } from 'expo-router';

export default function NewCustomer() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!name) {
      Alert.alert('Erro', 'Por favor, preencha o nome do cliente');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await customerRepository.create({
        name,
        phone,
        email,
        address,
        notes
      });

      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso', [
        { 
          text: 'OK', 
          onPress: () => router.back() 
        }
      ]);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o cliente');
    } finally {
      setIsSubmitting(false);
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
          placeholder="Nome do cliente"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Endereço completo"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Observações sobre o cliente"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFF" />
              <Text style={styles.loadingText}>Salvando...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Cadastrar Cliente</Text>
          )}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: "#0a7ea4",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    height: 50,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
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
  loadingText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 