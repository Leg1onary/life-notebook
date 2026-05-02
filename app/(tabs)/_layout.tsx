import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#1d1c19",
                    borderTopColor: "#38342e",
                },
                tabBarActiveTintColor: "#57a9ad",
                tabBarInactiveTintColor: "#7d766d",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Сегодня",
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Tabs.Screen
                name="todo"
                options={{
                    title: "To-do",
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✅</Text>,
                }}
            />
            <Tabs.Screen
                name="psychology"
                options={{
                    title: "Психолог",
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🧠</Text>,
                }}
            />
            <Tabs.Screen
                name="sections"
                options={{
                    title: "Разделы",
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📂</Text>,
                }}
            />
        </Tabs>
    );
}