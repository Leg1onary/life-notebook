import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRICS_ENABLED_KEY = "biometrics_enabled";

export async function isBiometricsAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
}

export async function isBiometricsEnabled(): Promise<boolean> {
    const val = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
    return val === "true";
}

export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, enabled ? "true" : "false");
}

export async function authenticate(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Подтвердите личность",
        fallbackLabel: "Введите PIN",
        cancelLabel: "Отмена",
        disableDeviceFallback: false,
    });
    return result.success;
}
