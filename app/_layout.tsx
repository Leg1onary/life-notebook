import "react-native-get-random-values";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initDb } from "../lib/db/migrate";
import { useSectionStore } from "../lib/store/sectionStore";

export default function RootLayout() {
    const seedDefaults = useSectionStore((s) => s.seedDefaults);

    useEffect(() => {
        initDb()
            .then(() => seedDefaults())
            .catch(console.error);
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
    );
}