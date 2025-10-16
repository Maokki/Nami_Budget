import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  //Saves a single value into storage.
  async setItem(key: string, value: any): Promise<void> { //the key is the category u are saving, value is the array of categories
    try {
      const jsonValue = JSON.stringify(value); //then converts the array(value) into json string 
      await AsyncStorage.setItem(key, jsonValue); //then save it for ur small database in the phone, entitled as a key(categories)
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  },

  //Retrieves a single stored value.
  async getItem<T>(key: string): Promise<T | null> { //the label key under which your data was saved (categories and expenses)
    try {
      const jsonValue = await AsyncStorage.getItem(key); //looks in the phone’s local storage for an entry with that key(categories and expenses).
      return jsonValue != null ? JSON.parse(jsonValue) : null; //If jsonValue is not null → parse it from JSON string back to a normal object/array
    } catch (error) {
      console.error('Error reading data:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting keys:', error);
      throw error;
    }
  },

  async multiGet(keys: string[]): Promise<Array<[string, any]>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs.map(([key, value]) => [
        key,
        value != null ? JSON.parse(value) : null
      ]);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      throw error;
    }
  },

  async multiSet(keyValuePairs: Array<[string, any]>): Promise<void> {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]) as readonly [string, string][];
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw error;
    }
  }
};
