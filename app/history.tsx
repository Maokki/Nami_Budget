import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

type Expense = {
  id: string | number;
  name: string;
  categoryName: string;
  amount: number;
  date: string;
};

type Deposit = {
  id: string | number;
  categoryName: string;
  amount: number;
  date: string;
};

type TabType = 'expenses' | 'deposits';

export default function History() {
  const { expenses, deposits } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  const expenseList: Expense[] =
    typeof expenses === "string" && expenses
      ? JSON.parse(expenses)
      : [];

  const depositList: Deposit[] =
    typeof deposits === "string" && deposits
      ? JSON.parse(deposits)
      : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && styles.activeTab]}
          onPress={() => setActiveTab('expenses')}
        >
          <Ionicons
            name="cash-outline"
            size={18}
            color={activeTab === 'expenses' ? "#fff" : "#cc6c0cff"}
          />
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>
            Expenses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'deposits' && styles.activeTab]}
          onPress={() => setActiveTab('deposits')}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color={activeTab === 'deposits' ? "#fff" : "#cc6c0cff"}
          />
          <Text style={[styles.tabText, activeTab === 'deposits' && styles.activeTabText]}>
            Deposits
          </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          
        </TouchableOpacity>
      </View>

      <ScrollView>
        {activeTab === 'expenses' ? (
          expenseList.length === 0 ? (
            <Text style={styles.empty}>No expenses recorded yet.</Text>
          ) : (
            <View style={styles.table}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Category</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Expense</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Amount</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.7 }]}>Date</Text>
              </View>

              {expenseList.map((exp: Expense) => (
                <View key={exp.id} style={styles.row}>
                  <Text
                    style={[styles.cell, { flex: 1.5 }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.8}
                  >
                    {exp.categoryName}
                  </Text>
                  <Text
                    style={[styles.cell, { flex: 1.5 }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.8}
                  >
                    {exp.name}
                  </Text>
                  <Text
                    style={[styles.cell, { flex: 1 }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.8}
                  >
                    ₱{exp.amount.toFixed(2)}
                  </Text>
                  <Text
                    style={[styles.cell, { flex: 1.7 }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.8}
                  >
                    {exp.date}
                  </Text>
                </View>
              ))}
            </View>
          )
        ) : (
          depositList.length === 0 ? (
            <Text style={styles.empty}>No deposits recorded yet.</Text>
          ) : (
            <View style={styles.table}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Category</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Amount</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.7 }]}>Date</Text>
              </View>

              {depositList.map((dep: Deposit) => (
                <View key={dep.id} style={styles.row}>
                  <Text
                    style={[styles.cell, { flex: 2 }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.8}
                  >
                    {dep.categoryName}
                  </Text>
                  <Text
                    style={[styles.cell, { flex: 1.5, color: '#27ae60' }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.8}
                  >
                    ₱{dep.amount.toFixed(2)}
                  </Text>
                  <Text
                    style={[styles.cell, { flex: 1.7 }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.8}
                  >
                    {dep.date}
                  </Text>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fef8f4",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#cc6c0cff",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#cc6c0cff",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#cc6c0cff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cc6c0cff",
  },
  activeTabText: {
    color: "#fff",
  },
  empty: {
    textAlign: "center",
    color: "gray",
    fontSize: 14,
    marginTop: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerRow: {
    backgroundColor: "#cc6c0cff",
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    textAlign: "center",
    fontSize: 13,
  },
  headerCell: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});
