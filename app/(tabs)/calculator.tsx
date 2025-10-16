import { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

export default function Calculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handlePress = (value: string) => {
    if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "⌫") {
      setInput((prev) => prev.slice(0, -1)); // remove last character
    } else if (value === "=") {
      try {
        const evalResult = eval(input.replace("×", "*").replace("÷", "/"));
        setResult(evalResult.toString());
      } catch {
        Alert.alert("Error", "Invalid Expression");
      }
    } else {
      setInput(input + value);
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      await Clipboard.setStringAsync(result);
    } else {
      Alert.alert("No result to copy");
    }
  };

  const buttons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "⌫", "+"],
    ["C", "="],
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧮 Calculator</Text>

      <View style={styles.display}>
        <Text style={styles.input} numberOfLines={1} adjustsFontSizeToFit>
          {input || "0"}
        </Text>

        <View style={styles.resultContainer}>
          {result ? (
            <>
              <Text
                style={styles.result}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                = {result}
              </Text>
              <TouchableOpacity onPress={copyToClipboard} style={styles.clipboardIcon}>
                <Ionicons name="clipboard-outline" size={22} color="#cc6c0cff" />
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>

      {buttons.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((btn) => (
            <TouchableOpacity
              key={btn}
              style={[
                styles.button,
                btn === "=" && styles.equalButton,
                btn === "C" && styles.clearButton,
              ]}
              onPress={() => handlePress(btn)}
            >
              <Text
                style={[
                  styles.buttonText,
                  (btn === "=" || btn === "C") && styles.whiteText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {btn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef8f4",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#cc6c0cff",
    marginBottom: 10,
  },
  display: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "flex-end",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  input: {
    fontSize: 24,
    color: "#333",
    alignSelf: "flex-end",
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    alignSelf: "flex-end",
  },
  result: {
    fontSize: 18,
    color: "#cc6c0cff",
    fontWeight: "600",
  },
  clipboardIcon: {
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    marginVertical: 3,
  },
  button: {
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  equalButton: {
    backgroundColor: "#cc6c0cff",
  },
  clearButton: {
    backgroundColor: "#e67e22",
  },
  whiteText: {
    color: "white",
  },
  buttonText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "600",
  },
});
