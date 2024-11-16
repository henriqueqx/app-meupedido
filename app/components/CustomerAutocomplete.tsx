import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { customerRepository, Customer } from '../../database/customerRepository';

interface CustomerAutocompleteProps {
  onSelect: (customer: Customer) => void;
  value: string;
  onChangeText: (text: string) => void;
}

export function CustomerAutocomplete({ onSelect, value, onChangeText }: CustomerAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchCustomers = async (searchText: string) => {
    if (!searchText) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const customers = await customerRepository.findByName(searchText);
      setSuggestions(customers);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    onSelect(customer);
    onChangeText(customer.name);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchCustomers(value);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [value]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setShowSuggestions(true);
          }}
          placeholder="Nome do cliente"
          onFocus={() => value && searchCustomers(value)}
        />
        {isLoading && (
          <ActivityIndicator style={styles.loadingIndicator} size="small" color="#0a7ea4" />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id!.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectCustomer(item)}
              >
                <Text style={styles.suggestionName}>{item.name}</Text>
                {item.phone && (
                  <Text style={styles.suggestionDetail}>📱 {item.phone}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
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
    height: 45,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    maxHeight: 200,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  suggestionName: {
    fontSize: 16,
    color: '#333',
  },
  suggestionDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 