import { Text, View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { storage } from "@/utils/storage"; // ✅ Ensure this path points to your local storage util

// --- Data Types ---
type Category = { id: string; name: string; deposit: number; balance: number };
type ExpenseType = { id: string; name: string; amount: number; categoryName: string; date: string };
type DepositType = { id: string; categoryName: string; amount: number; date: string };

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [deposits, setDeposits] = useState<DepositType[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // --- Load from Local Storage ---
  const loadData = async () => {
    try {
      const savedCategories = await storage.getItem<Category[]>("categories");
      const savedExpenses = await storage.getItem<ExpenseType[]>("expenses");
      const savedDeposits = await storage.getItem<DepositType[]>("deposits");

      if (savedCategories) {
        setCategories(savedCategories);
        const balance = savedCategories.reduce((sum, cat) => sum + cat.balance, 0);
        setTotalBalance(balance);
      }

      if (savedExpenses) {
        setExpenses(savedExpenses);
        const expenseSum = savedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        setTotalExpenses(expenseSum);
      }

      if (savedDeposits) {
        setDeposits(savedDeposits);
        const depositSum = savedDeposits.reduce((sum, dep) => sum + dep.amount, 0);
        setTotalDeposits(depositSum);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // --- Spending Timeline (Bar Chart) ---
  const getSpendingTimeline = () => {
    const timeline: { [key: string]: number } = {};
    expenses.forEach(exp => {
      const date = exp.date;
      timeline[date] = (timeline[date] || 0) + exp.amount;
    });

    return Object.entries(timeline)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7)
      .map(([date, amount]) => ({
        date: date.split("/").slice(0, 2).join("/"),
        amount,
      }));
  };

  const timelineData = getSpendingTimeline();

  const biggestCategory = categories.reduce(
    (max, cat) =>
      cat.deposit - cat.balance >
      ((max?.deposit || 0) - (max?.balance || 0))
        ? cat
        : max,
    categories[0] || null
  );

  // --- Pie Chart Section (Legend Style) ---
  const renderPieChart = () => {
    if (categories.length === 0) {
      return <Text style={styles.noData}>No categories yet. Add some to see distribution!</Text>;
    }

    const total = categories.reduce((sum, cat) => sum + cat.balance, 0);

    return (
      <View style={styles.pieContainer}>
        <View style={styles.svgContainer}>
          {categories.map((cat, index) => {
            const percentage = (cat.balance / total) * 100;
            const color = COLORS[index % COLORS.length];
            return (
              <View key={cat.id} style={styles.pieSliceInfo}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={styles.pieSliceText}>
                  {cat.name}: {percentage.toFixed(1)}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // --- Line Chart Section (Simple Bar Version) ---
  const renderLineChart = () => {
    if (timelineData.length === 0) {
      return <Text style={styles.noData}>No expense data yet. Start tracking your spending!</Text>;
    }

    const maxAmount = Math.max(...timelineData.map(d => d.amount), 1);

    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.chartArea}>
          {timelineData.map((point, index) => {
            const height = (point.amount / maxAmount) * 120;
            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValue}>₱{point.amount.toFixed(0)}</Text>
                <View style={[styles.bar, { height }]} />
                <Text style={styles.barLabel}>{point.date}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.chartSubtext}>
          Average daily spending: ₱{(totalExpenses / (timelineData.length || 1)).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Budget Dashboard</Text>
        <Link href="/budget" style={styles.link}>
          <Text style={styles.linkText}>Go to Budget →</Text>
        </Link>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardContainer}>
        <View style={[styles.card, styles.balanceCard]}>
          <Ionicons name="wallet" size={24} color="#fff" />
          <Text style={styles.cardLabel}>Total Balance</Text>
          <Text style={styles.cardValue}>₱{totalBalance.toFixed(2)}</Text>
        </View>

        <View style={[styles.card, styles.depositCard]}>
          <Ionicons name="arrow-down-circle" size={24} color="#fff" />
          <Text style={styles.cardLabel}>Total Deposits</Text>
          <Text style={styles.cardValue}>₱{totalDeposits.toFixed(2)}</Text>
        </View>

        <View style={[styles.card, styles.expenseCard]}>
          <Ionicons name="arrow-up-circle" size={24} color="#fff" />
          <Text style={styles.cardLabel}>Total Expenses</Text>
          <Text style={styles.cardValue}>₱{totalExpenses.toFixed(2)}</Text>
        </View>

        <View style={[styles.card, styles.categoryCard]}>
          <Ionicons name="trending-up" size={24} color="#fff" />
          <Text style={styles.cardLabel}>Top Spending</Text>
          <Text style={styles.cardValue}>{biggestCategory?.name || "N/A"}</Text>
          <Text style={styles.cardSubtext}>
            ₱{((biggestCategory?.deposit || 0) - (biggestCategory?.balance || 0)).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Pie Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>💰 Budget Distribution by Category</Text>
        {renderPieChart()}
      </View>

      {/* Line Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>📈 Spending Timeline (Recent Days)</Text>
        {renderLineChart()}
      </View>

      {/* Progress Bars */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>🎯 Category Budget Usage</Text>
        {categories.length > 0 ? (
          <View style={styles.progressContainer}>
            {categories.map(cat => {
              const used = cat.deposit - cat.balance;
              const percentage = (used / cat.deposit) * 100;
              const color =
                percentage > 80 ? "#e74c3c" : percentage > 50 ? "#f39c12" : "#27ae60";
              return (
                <View key={cat.id} style={styles.progressItem}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{cat.name}</Text>
                    <Text style={styles.progressValue}>
                      ₱{used.toFixed(0)} / ₱{cat.deposit.toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${percentage}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercent}>{percentage.toFixed(1)}% used</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noData}>No categories to track yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#2c3e50", marginBottom: 10 },
  link: { alignSelf: "flex-start" },
  linkText: { color: "#3498db", fontSize: 14, fontWeight: "600" },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceCard: { backgroundColor: "#3498db" },
  depositCard: { backgroundColor: "#27ae60" },
  expenseCard: { backgroundColor: "#e74c3c" },
  categoryCard: { backgroundColor: "#9b59b6" },
  cardLabel: { color: "#fff", fontSize: 12, marginTop: 8, opacity: 0.9 },
  cardValue: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 4 },
  cardSubtext: { color: "#fff", fontSize: 11, marginTop: 2, opacity: 0.8 },
  chartSection: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  chartTitle: { fontSize: 16, fontWeight: "bold", color: "#2c3e50", marginBottom: 15 },
  noData: {
    textAlign: "center",
    color: "#95a5a6",
    fontSize: 14,
    paddingVertical: 30,
    fontStyle: "italic",
  },
  pieContainer: { alignItems: "center", paddingVertical: 10 },
  svgContainer: { width: "100%", marginBottom: 15 },
  pieSliceInfo: { flexDirection: "row", alignItems: "center", marginBottom: 10, paddingHorizontal: 10 },
  colorDot: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  pieSliceText: { fontSize: 14, color: "#34495e", fontWeight: "500" },
  lineChartContainer: { alignItems: "center", paddingVertical: 10 },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    width: "100%",
    height: 180,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  barColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end", marginHorizontal: 2 },
  barValue: { fontSize: 10, color: "#7f8c8d", fontWeight: "600" },
  bar: { width: "100%", backgroundColor: "#FF6B6B", borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 5 },
  barLabel: { fontSize: 10, color: "#95a5a6", marginTop: 5, textAlign: "center" },
  chartSubtext: { fontSize: 12, color: "#7f8c8d", marginTop: 10, textAlign: "center" },
  progressContainer: { marginTop: 5 },
  progressItem: { marginBottom: 20 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 14, fontWeight: "600", color: "#2c3e50" },
  progressValue: { fontSize: 12, color: "#7f8c8d" },
  progressBarBg: { height: 10, backgroundColor: "#ecf0f1", borderRadius: 5, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 5 },
  progressPercent: { fontSize: 11, color: "#95a5a6", marginTop: 4 },
});
