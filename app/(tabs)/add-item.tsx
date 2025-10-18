import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// This screen is never shown as the tab button opens a bottom sheet instead
export default function AddItemScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Add Item</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
