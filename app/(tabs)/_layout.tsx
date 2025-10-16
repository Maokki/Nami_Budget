import { HeaderTitle } from "@react-navigation/elements";
import { Tabs } from "expo-router";
import { Ionicons} from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
        screenOptions={{ tabBarActiveTintColor: '#a45b0dff' }}>
      <Tabs.Screen name="index" 
        options={{headerTitle: "Dashboard",
        tabBarLabel: 'Dashboard', 
        tabBarIcon: ({focused}) => 
                <Ionicons name={focused? "bar-chart" : "bar-chart-outline"} 
                    size={24} color="#a45b0dff"></Ionicons>
        }} />

      <Tabs.Screen name="budget" 
        options={{headerTitle: " Budget ",
        tabBarLabel: 'Budget', 
        tabBarIcon: ({focused}) => 
                <Ionicons name={focused? "wallet" : "wallet-outline"} 
                    size={24} color="#a45b0dff"></Ionicons>
        }} />

      <Tabs.Screen name="calculator" 
        options={{headerTitle: "Calculator",
            tabBarIcon: ({focused}) => 
                <Ionicons name={focused? "calculator" : "calculator-outline"} 
                    size={24} color="#a45b0dff"></Ionicons>
         }} />
    </Tabs>
  );  
};
