import { Text, View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { storage } from "@/utils/storage";

type Category = { id: string; name: string; deposit: number; balance: number };
type ExpenseType = {
  id: string;
  name: string;
  amount: number;
  categoryName: string;
  date: string;
};
type DepositType = {
  id: string;
  categoryName: string;
  amount: number;
  date: string;
};

export default function Home() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [deposit, setDeposit] = useState("");

  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [deposits, setDeposits] = useState<DepositType[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const [balance, setBalance] = useState(0);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editDeposit, setEditDeposit] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [categories, expenses, deposits]);

  const loadData = async () => {
    try {
      const savedCategories = await storage.getItem<Category[]>('categories');
      const savedExpenses = await storage.getItem<ExpenseType[]>('expenses');
      const savedDeposits = await storage.getItem<DepositType[]>('deposits');

      if (savedCategories) {
        setCategories(savedCategories);
        const total = savedCategories.reduce((sum, cat) => sum + cat.balance, 0);
        setBalance(total);
      }

      if (savedExpenses) {
        setExpenses(savedExpenses);
      }

      if (savedDeposits) {
        setDeposits(savedDeposits);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await storage.setItem('categories', categories);
      await storage.setItem('expenses', expenses);
      await storage.setItem('deposits', deposits);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };


  const addCategory = () => {
    if (categoryName.trim() === "" || deposit.trim() === "") {
      Alert.alert("Missing Input", "Please enter both name and deposit.");
      return;
    }

    const depositValue = parseFloat(deposit);

    const newCategory = {
      id: Date.now().toString(),
      name: categoryName,
      deposit: depositValue,
      balance: depositValue,
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);

    const newDeposit = {
      id: Date.now().toString(),
      categoryName: categoryName,
      amount: depositValue,
      date: new Date().toLocaleDateString(),
    };

    setDeposits([newDeposit, ...deposits]);

    const total = updatedCategories.reduce((sum, cat) => sum + cat.balance, 0);
    setBalance(total);

    setCategoryName("");
    setDeposit("");
    Alert.alert("Success", `Added category: ${newCategory.name}`);
  };

  const addExpense = () => {
    if (!selectedCategoryId || expenseName.trim() === "" || expenseAmount.trim() === "") {
      Alert.alert("Missing Input", "Please complete all expense fields.");
      return;
    }

    const expenseValue = parseFloat(expenseAmount);

    const category = categories.find((cat) => cat.id === selectedCategoryId);
    if (!category) return;

    if (category.balance < expenseValue) {
      Alert.alert("Insufficient Funds", `Not enough balance in ${category.name}.`);
      return;
    }

    const updatedCategories = categories.map((cat) =>
      cat.id === selectedCategoryId
        ? { ...cat, balance: cat.balance - expenseValue }
        : cat
    );

    setCategories(updatedCategories);

    const newExpense = {
      id: Date.now().toString(),
      name: expenseName,
      amount: expenseValue,
      categoryName: category.name,
      date: new Date().toLocaleDateString(),
    };

    setExpenses([newExpense, ...expenses]);

    const total = updatedCategories.reduce((sum, cat) => sum + cat.balance, 0);
    setBalance(total);

    setExpenseName("");
    setExpenseAmount("");

    Alert.alert(
      "Expense Added",
      `₱${expenseValue} for "${expenseName}" under "${category.name}".`
    );
  };

  const handleEditCategory = (id: string) => {
  const cat = categories.find((c) => c.id === id);
  if (cat) {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDeposit(cat.deposit.toString());
  }
};

  const handleSaveEdit = () => {
    if (!editingCategory) return;

    const depositValue = parseFloat(editDeposit);
    if (isNaN(depositValue) || depositValue < 0) {
      Alert.alert("Invalid Input", "Please enter a valid deposit amount.");
      return;
    }

    const updatedCategories = categories.map((cat) =>
      cat.id === editingCategory.id
        ? {
            ...cat,
            name: editName,
            deposit: cat.deposit + depositValue,
            balance: cat.balance + depositValue,
          }
        : cat
    );

    setCategories(updatedCategories);

    const newDeposit = {
      id: Date.now().toString(),
      categoryName: editName,
      amount: depositValue,
      date: new Date().toLocaleDateString(),
    };

    setDeposits([newDeposit, ...deposits]);

    const total = updatedCategories.reduce((sum, cat) => sum + cat.balance, 0);
    setBalance(total);

    setEditingCategory(null);
    setEditName("");
    setEditDeposit("");

    Alert.alert(
      "Success",
      `Added ₱${depositValue} to ${editingCategory.name}. Balance updated!`
    );
  };

  const handleDeleteCategory = (id: string) => {
    const categoryToDelete = categories.find((cat) => cat.id === id);
    if (!categoryToDelete) return;

    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${categoryToDelete.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedCategories = categories.filter((cat) => cat.id !== id);

            const total = updatedCategories.reduce((sum, cat) => sum + cat.balance, 0);
            setCategories(updatedCategories);
            setBalance(total);

            Alert.alert("Deleted", `"${categoryToDelete.name}" has been removed.`);
          },
        },
      ]
    );
  };

  const router = useRouter();
  const toTheHistory = () => {
    router.push({
      pathname: "/history",
      params: {
        expenses: JSON.stringify(expenses),
        deposits: JSON.stringify(deposits)
      },
    });
  };



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>₱ {balance}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Budget Category</Text>

        <TextInput style={styles.input}
                  placeholder="Category name (e.g. Food)"
                  value={categoryName}
                  onChangeText={setCategoryName} />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Deposit amount"
            keyboardType="numeric"
            value={deposit}
            onChangeText={setDeposit} />

          <TouchableOpacity style={styles.iconButton} onPress={addCategory}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧾 New Expense</Text>

        <View style={styles.row}>
          <Picker
            selectedValue={selectedCategoryId}
            onValueChange={(value) => {
              setSelectedCategoryId(value);
              const category = categories.find((cat) => cat.id === value);
              setSelectedCategoryName(category ? category.name : "");
            }}
            style={{ flex: 1 }}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Picker>
        </View>

        <TextInput
            style={styles.input}
            placeholder="Expense name (e.g. Dinner)"
            value={expenseName}
            onChangeText={setExpenseName} />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Amount"
            keyboardType="numeric"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
          />
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: "#c0392b" }]} onPress={addExpense}>
            <Ionicons name="remove" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>📦 Your Categories</Text>

        <View style={styles.gridContainer}>
          {categories.map((cat) => (
            <View key={cat.id} style={styles.categoryBox}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryBalance}>₱{cat.balance.toFixed(2)}</Text>

              <View style={styles.categoryActions}>
                <TouchableOpacity onPress={() => handleEditCategory(cat.id)}>
                  <Ionicons name="pencil" size={18} color="#2980b9" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)}>
                  <Ionicons name="trash" size={18} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#160cccff" }]}
          onPress={() => toTheHistory()}>
          <Text style={{ color: "white" }}>Expenses History</Text >
        </TouchableOpacity>
      </View>


      <Modal visible={!!editingCategory} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Edit and Deposit</Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Category Name"
              style={styles.input}
            />
            <TextInput
              value={editDeposit}
              onChangeText={setEditDeposit}
              placeholder="Deposit"
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#0e11ceff" }]}
                onPress={handleSaveEdit}
              >
                <Text style={{ color: "white" }}>Deposit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#c12412ff" }]}
                onPress={() => setEditingCategory(null)}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },

  balanceBox: {
    width: "100%",
    backgroundColor: "rgba(255,165,0,0.9)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 12,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  section: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },

  input: {
    height: 35,
    width: "100%",
    backgroundColor: "rgba(255,165,0,0.2)",
    borderRadius: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
    fontSize: 12,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdown: {
    height: 35,
    justifyContent: "center",
    backgroundColor: "#e9e9e9",
    borderRadius: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  dropdownText: {
    color: "#666",
    fontSize: 12,
  },
  iconButton: {
    backgroundColor: "#f39c12",
    borderRadius: 20,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  categoriesContainer: {
  width: "100%",
  marginTop: 10,
  marginBottom: 20,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  categoryBox: {
    width: "48%",
    backgroundColor: "#fff8e1",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#f39c12",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },

  categoryBalance: {
    fontSize: 13,
    color: "#27ae60",
    marginBottom: 8,
    textAlign: "center",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "rgba(41, 128, 185, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  editText: {
    color: "#2980b9",
    fontSize: 12,
    marginLeft: 4,
  },
  categoryActions: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  marginTop: 8,
},

});
