import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TemporaryScreenProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export function TemporaryScreen({ title, icon, color = "#0a7ea4" }: TemporaryScreenProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={color} />
      <Text style={[styles.title, { color }]}>{title}</Text>
      <Text style={styles.subtitle}>Em desenvolvimento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
}); 