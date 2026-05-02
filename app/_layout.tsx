import "react-native-get-random-values";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { initDb } from "../lib/db/migrate";
import { useSectionStore } from "../lib/store/sectionStore";
import { isLoggedIn } from "../lib/auth";
import { sync } from "../lib/sync";

export default function RootLayout() {
    const seedDefaults = useSectionStore((s) => s.seedDefaults);
    const router = useRouter();
    const segments = useSegments();
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function init() {
            await initDb();
            await seedDefaults();

            const loggedIn = await isLoggedIn();
            const inAuth = segments[0] === "(auth)";

            if (!loggedIn && !inAuth) {
                router.replace("/(auth)/login");
            } else if (loggedIn) {
                // Синх при старте
                sync();
            }
            setReady(true);
        }
        init().catch(console.error);
    }, []);

    // Синх при возвращении из фона
    useEffect(() => {
        const sub = AppState.addEventListener("change", (next) => {
            if (appState.current.match(/inactive|background/) && next === "active") {
                sync();
            }
            appState.current = next;
        });
        return () => sub.remove();
    }, []);

    if (!ready) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
    );
}
