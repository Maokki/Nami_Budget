import { Text, View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { storage } from "@/utils/storage";

// --- Data Types ---
type Category = { id: string; name: string; deposit: number; balance: number };
type ExpenseType = { id: string; name: string; amount: number; categoryName: string; date: string };
type DepositType = { id: string; categoryName: string; amount: number; date: string };

// Nami's color palette - Orange hair, Blue eyes, Tangerine theme
const COLORS = ['#FF8C42', '#4A90E2', '#FF6B35', '#FFA94D', '#5BA3E8', '#FFB366'];
const NAMI_PRIMARY = '#FF8C42'; // Tangerine orange
const NAMI_SECONDARY = '#4A90E2'; // Ocean blue
const NAMI_ACCENT = '#FF6B35'; // Deep orange
const NAMI_LIGHT = '#FFF4E6'; // Soft cream
const NAMI_DARK = '#2C3E50'; // Deep navy

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

  // --- Reset All Data ---
  const handleResetData = () => {
    Alert.alert(
      "🚨 Reset All Data",
      "Are you sure you want to delete ALL your treasure data? This will clear all categories, expenses, and deposits across the entire app. This action cannot be undone!",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, Delete Everything",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all data from storage
              await storage.multiRemove(['categories', 'expenses', 'deposits']);
              
              // Reset all local state
              setCategories([]);
              setExpenses([]);
              setDeposits([]);
              setTotalBalance(0);
              setTotalDeposits(0);
              setTotalExpenses(0);
              
              Alert.alert(
                "✅ Success", 
                "All data has been cleared! The changes will reflect across all screens.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert("❌ Error", "Failed to reset data. Please try again.");
            }
          }
        }
      ]
    );
  };

  // --- Prepare Pie Chart Data ---
  const getPieData = () => {
    if (categories.length === 0) return [];
    
    return categories.map((cat, index) => ({
      value: cat.balance,
      color: COLORS[index % COLORS.length],
      text: cat.name,
    }));
  };

  // --- Prepare Bar Chart Data ---
  const getBarData = () => {
    const timeline: { [key: string]: number } = {};
    expenses.forEach(exp => {
      const date = exp.date;
      timeline[date] = (timeline[date] || 0) + exp.amount;
    });

    // Get the number of days in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const sorted = Object.entries(timeline)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-daysInMonth); // Show days based on current month

    if (sorted.length === 0) return [];

    return sorted.map(([date, amount]) => ({
      value: amount,
      label: date.split("/").slice(0, 2).join("/"),
      frontColor: NAMI_PRIMARY,
    }));
  };

  const pieData = getPieData();
  const barData = getBarData();

  const biggestCategory = categories.reduce(
    (max, cat) =>
      cat.deposit - cat.balance >
      ((max?.deposit || 0) - (max?.balance || 0))
        ? cat
        : max,
    categories[0] || null
  );

  // --- Render Pie Chart ---
  const renderPieChart = () => {
    if (pieData.length === 0) {
      return <Text style={styles.noData}>No treasures yet! Start tracking your berries! 🍊</Text>;
    }

    return (
      <View style={styles.pieContainer}>
        <PieChart
          data={pieData}
          radius={100}
          innerRadius={50}
          donut
          showText
          textColor="#fff"
          textSize={11}
          focusOnPress
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerLabelEmoji}>🍊</Text>
              <Text style={styles.centerLabelText}>Total</Text>
              <Text style={styles.centerLabelValue}>₱{totalBalance.toFixed(0)}</Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          {pieData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.text} (₱{item.value.toFixed(0)})
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // --- Render Bar Chart ---
  const renderBarChart = () => {
    if (barData.length === 0) {
      return <Text style={styles.noData}>No adventure logs yet. Start your treasure hunt! ⚓</Text>;
    }

    const maxValue = Math.max(...barData.map(d => d.value));
    const chartWidth = Math.max(280, barData.length * 40);

    return (
      <View style={styles.barChartContainer}>
        <View style={styles.scrollableChartWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            persistentScrollbar={true}
            contentContainerStyle={styles.barChartScroll}
          >
            <BarChart
              data={barData}
              width={chartWidth}
              height={200}
              barWidth={24}
              spacing={barData.length > 15 ? 8 : 12}
              roundedTop
              barBorderRadius={4}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor="#FFD4A3"
              hideRules
              frontColor={NAMI_PRIMARY}
              yAxisTextStyle={{ color: '#FF8C42', fontSize: 10, fontWeight: '600' }}
              xAxisLabelTextStyle={{ color: '#95a5a6', fontSize: 8 }}
              noOfSections={4}
              maxValue={maxValue * 1.1}
              showValuesAsTopLabel
              topLabelTextStyle={{ fontSize: 9, color: '#FF6B35', fontWeight: '700' }}
              scrollToEnd={true}
              scrollAnimation={true}
            />
          </ScrollView>
        </View>
        <Text style={styles.chartSubtext}>
          ⚡ Average daily spending: ₱{(totalExpenses / (barData.length || 1)).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={NAMI_PRIMARY}
          colors={[NAMI_PRIMARY]}
        />
      }
    >
      {/* Header - Nami themed */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🍊 Nami's Treasure Log</Text>
          <Text style={styles.headerSubtitle}>Navigator's Budget Dashboard</Text>
          <Text style={styles.headerSubtitle2}>- navigate your finance unlike my idiot captain!!!</Text>
        </View>
        <View style={styles.headerButtons}>
          <Link href="/budget" style={styles.link}>
            <View style={styles.linkButton}>
              <Text style={styles.linkText}>Full Budget</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </Link>
          <TouchableOpacity onPress={handleResetData} style={styles.resetButton}>
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.resetText}>Reset Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardContainer}>
        <View style={[styles.card, styles.balanceCard]}>
          <View style={styles.cardIconCircle}>
            <Ionicons name="wallet" size={24} color="#FF8C42" />
          </View>
          <Text style={styles.cardLabel}>Total Berries (Balance)</Text>
          <Text style={styles.cardValue}>₱{totalBalance.toFixed(2)}</Text>
          <View style={styles.cardWave} />
        </View>

        <View style={[styles.card, styles.depositCard]}>
          <View style={styles.cardIconCircle}>
            <Ionicons name="trending-up" size={24} color="#4A90E2" />
          </View>
          <Text style={styles.cardLabel}>Treasure Gained (Deposits)</Text>
          <Text style={styles.cardValue}>₱{totalDeposits.toFixed(2)}</Text>
          <View style={styles.cardWave} />
        </View>

        <View style={[styles.card, styles.expenseCard]}>
          <View style={styles.cardIconCircle}>
            <Ionicons name="cart" size={24} color="#FF6B35" />
          </View>
          <Text style={styles.cardLabel}>Shopping Spent (Expenses)</Text>
          <Text style={styles.cardValue}>₱{totalExpenses.toFixed(2)}</Text>
          <View style={styles.cardWave} />
        </View>

        <View style={[styles.card, styles.categoryCard]}>
          <View style={styles.cardIconCircle}>
            <Ionicons name="trophy" size={24} color="#FFA94D" />
          </View>
          <Text style={styles.cardLabel}>Biggest Splurge (Most spent)</Text>
          <Text style={styles.cardValue}>{biggestCategory?.name || "None"}</Text>
          <Text style={styles.cardSubtext}>
            ₱{((biggestCategory?.deposit || 0) - (biggestCategory?.balance || 0)).toFixed(2)}
          </Text>
          <View style={styles.cardWave} />
        </View>
      </View>

      {/* Pie Chart */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>🍊 Treasure Map Distribution</Text>
          <Text style={styles.chartSubheading}>Where your total balance distributed by budgets </Text>
        </View>
        {renderPieChart()}
      </View>

      {/* Bar Chart */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>⚓ Adventure Log (This Month)</Text>
          <Text style={styles.chartSubheading}>Your spending voyage timeline for the current month</Text>
        </View>
        {renderBarChart()}
      </View>

      {/* Progress Bars */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>⚡ Power Level by Category</Text>
          <Text style={styles.chartSubheading}>How much money you've spent in each budget</Text>
        </View>
        {categories.length > 0 ? (
          <View style={styles.progressContainer}>
            {categories.map(cat => {
              const used = cat.deposit - cat.balance;
              const percentage = (used / cat.deposit) * 100;
              const color =
                percentage > 80 ? "#FF6B35" : percentage > 50 ? "#FFA94D" : "#4A90E2";
              return (
                <View key={cat.id} style={styles.progressItem}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>🌊 {cat.name}</Text>
                    <Text style={styles.progressValue}>
                      ₱{used.toFixed(0)} / ₱{cat.deposit.toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressPercent, { color }]}>
                    {percentage.toFixed(1)}% of treasure used
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noData}>No categories yet. Chart your course! 🗺️</Text>
        )}
      </View>

      {/* Fun Nami Quote */}
      <View style={styles.quoteSection}>
        <Text style={styles.quoteText}>"Look at you guys go! Meanwhile, I'll be collecting some treasure."</Text>
        <Text style={styles.quoteAuthor}>— Nami, Navigator 🍊</Text>
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF8F0',
  },
  header: {
    backgroundColor: NAMI_PRIMARY,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#FF8C42",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    marginBottom: 15,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF4E6',
    marginTop: 4,
    opacity: 0.95,
    fontStyle: 'italic',
  },  
  headerSubtitle2: {
    fontSize: 11,
    color: '#FFF4E6',
    marginTop: 4,
    opacity: 0.95,
    fontStyle: 'italic',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  link: { flex: 1 },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    gap: 6,
  },
  resetText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  linkText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "700",
    marginRight: 6,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    justifyContent: "space-between",
    marginTop: -15,
  },
  card: {
    width: "48%",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceCard: { backgroundColor: "#FFF4E6" },
  depositCard: { backgroundColor: "#E8F4FF" },
  expenseCard: { backgroundColor: "#FFE8E0" },
  categoryCard: { backgroundColor: "#FFF0E0" },
  cardLabel: { 
    color: NAMI_DARK, 
    fontSize: 11, 
    marginTop: 4,
    fontWeight: '600',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: { 
    color: NAMI_DARK, 
    fontSize: 22, 
    fontWeight: "900", 
    marginTop: 6,
  },
  cardSubtext: { 
    color: NAMI_DARK, 
    fontSize: 11, 
    marginTop: 4, 
    opacity: 0.7,
    fontWeight: '600',
  },
  cardWave: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 140, 66, 0.1)',
    transform: [{ translateX: 40 }, { translateY: 40 }],
  },
  chartSection: {
    backgroundColor: "#fff",
    margin: 15,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#FF8C42",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF4E6',
  },
  chartHeader: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FFE8D6',
  },
  chartTitle: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: NAMI_PRIMARY,
    letterSpacing: 0.3,
  },
  chartSubheading: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  barChartScroll: { 
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  scrollableChartWrapper: {
    width: '100%',
    height: 230,
  },
  noData: {
    textAlign: "center",
    color: "#95a5a6",
    fontSize: 14,
    paddingVertical: 30,
    fontStyle: "italic",
  },
  pieContainer: { alignItems: "center", paddingVertical: 10 },
  centerLabel: { alignItems: "center", justifyContent: "center" },
  centerLabelEmoji: { fontSize: 24, marginBottom: 4 },
  centerLabelText: { fontSize: 11, color: "#95a5a6", fontWeight: '600' },
  centerLabelValue: { fontSize: 18, fontWeight: "900", color: NAMI_PRIMARY, marginTop: 2 },
  legend: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "center", 
    marginTop: 20,
    paddingHorizontal: 10,
  },
  legendItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginRight: 12, 
    marginBottom: 10,
    minWidth: "45%",
  },
  legendDot: { 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: { fontSize: 11, color: NAMI_DARK, flexShrink: 1, fontWeight: '600' },
  barChartContainer: { alignItems: "center", paddingVertical: 10 },
  chartSubtext: { 
    fontSize: 13, 
    color: NAMI_ACCENT, 
    marginTop: 15, 
    textAlign: "center",
    fontWeight: '700',
  },
  progressContainer: { marginTop: 5 },
  progressItem: { marginBottom: 24 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: "700", color: NAMI_DARK },
  progressValue: { fontSize: 12, color: NAMI_ACCENT, fontWeight: '700' },
  progressBarBg: { 
    height: 12, 
    backgroundColor: "#FFF4E6", 
    borderRadius: 6, 
    overflow: "hidden",
    borderWidth: 1,
    borderColor: '#FFE8D6',
  },
  progressBarFill: { 
    height: "100%", 
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  progressPercent: { 
    fontSize: 11, 
    marginTop: 6,
    fontWeight: '700',
  },
  quoteSection: {
    backgroundColor: '#FFE8D6',
    margin: 15,
    marginTop: 5,
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: NAMI_PRIMARY,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    color: NAMI_DARK,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 12,
    color: NAMI_ACCENT,
    fontWeight: '700',
  },
});