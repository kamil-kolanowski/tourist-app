import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Surface,
  Switch,
  List,
  Divider,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const paperTheme = usePaperTheme();
  const { isDarkTheme, setThemeMode } = useTheme();

  const toggleThemeSwitch = () => {
    setThemeMode(isDarkTheme ? "light" : "dark");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: paperTheme.colors.background }}
      edges={["top"]}
    >
      <Surface style={styles.container}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: paperTheme.colors.onSurface }]}
        >
          Ustawienia
        </Text>

        <List.Section>
          <List.Subheader>Wygląd</List.Subheader>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text
                variant="bodyLarge"
                style={{ color: paperTheme.colors.onSurface }}
              >
                Tryb ciemny
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: paperTheme.colors.onSurfaceVariant,
                }}
              >
                Włącz lub wyłącz tryb ciemny
              </Text>
            </View>
            <Switch
              value={isDarkTheme}
              onValueChange={toggleThemeSwitch}
              color={paperTheme.colors.primary}
            />
          </View>

          <Divider />

          <List.Item
            title="O aplikacji"
            description="Tourist App v1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
        </List.Section>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
});

export default Settings;
