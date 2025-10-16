import { HeaderTitle } from "@react-navigation/elements";
import { Stack, Router } from "expo-router";

import { LogBox } from "react-native";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{headerShown: false}} />
      <Stack.Screen name="history"/>
    </Stack>
  );  
};
