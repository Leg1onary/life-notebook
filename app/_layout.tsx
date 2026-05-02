import "react-native-get-random-values";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, View, Text, TouchableOpacity } from "react-native";
import { initDb } from "../lib/db/migrate";
import { useSectionStore } from "../lib/store/sectionStore";
import { isLoggedIn } from "../lib/auth";
import { sync } from "../lib/sync";
import { authenticate, isBiometricsAvailable, isBiometricsEnabled } from "../lib/biometrics";

export default function RootLayout() {
    const seedDefaults = useSectionStore((s) => s.seedDefaults);
    const router = useRouter();
    const segments = useSegments();
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const [ready, setReady] = useState(false);
    const [locked, setLocked] = useState(false);
    const justLaunched = useRef(true);

    const unlock = async () => {
        const success = await authenticate();
        if (success) setLocked(false);
    };

    useEffect(() => {
        async function init() {
            await initDb();
            await seedDefaults();

            const loggedIn = await isLoggedIn();
            const inAuth = segments[0] === "(auth)";

            if (!loggedIn && !inAuth) {
                router.replace("/(auth)/login");
                setReady(true);
                return;
            }

            if (loggedIn) {
                const available = await isBiometricsAvailable();
                const enabled = await isBiometricsEnabled();
                if (available && enabled) {
                    setLocked(true);
                    const success = await authenticate();
                    if (success) setLocked(false);
                }
                sync();
            }
            setReady(true);
        }
        init().catch(console.error);
    }, []);

    useEffect(() => {
        const sub = AppState.addEventListener("change", async (next) => {
            const comingToForeground =
                appState.current.match(/inactive|background/) && next === "active";

            appState.current = next;

            if (!comingToForeground) return;

            // Пропускаем первый раз — уже обработан в init()
            if (justLaunched.current) {
                justLaunched.current = false;
                sync();
                return;
            }

            const available = await isBiometricsAvailable();
            const enabled = await isBiometricsEnabled();
            if (available && enabled) {
                setLocked(true);
                const success = await authenticate();
                if (success) setLocked(false);
            }
            sync();
        });
        return () => sub.remove();
    }, []);

    if (!ready) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
            {locked && (
                <View style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "#171614",
                    alignItems: "center", justifyContent: "center", gap: 24,
                }}>
                    <Text style={{ fontSize: 56 }}>🔒</Text>
                    <Text style={{ color: "#ece6dc", fontSize: 20, fontWeight: "700" }}>
                        Life Notebook заблокирован
                    </Text>
                    <TouchableOpacity
                        onPress={unlock}
                        style={{
                            backgroundColor: "#57a9ad", borderRadius: 14,
                            paddingVertical: 14, paddingHorizontal: 40,
                        }}
                    >
                        <Text style={{ color: "#171614", fontWeight: "700", fontSize: 16 }}>
                            👁‍🗨️ Разблокировать
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </GestureHandlerRootView>
    );
}
