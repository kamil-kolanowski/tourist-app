import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: "light" | "dark";
  themeMode: ThemeMode;
  isDarkTheme: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  // Określ aktualny motyw na podstawie trybu i ustawień systemu
  const calculateTheme = (mode: ThemeMode): "light" | "dark" => {
    if (mode === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return mode;
  };

  const [theme, setTheme] = useState<"light" | "dark">(
    calculateTheme(themeMode)
  );

  // Ładuj ustawienia motywu przy starcie
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem("themeMode");
        if (savedThemeMode) {
          setThemeMode(savedThemeMode as ThemeMode);
        }
      } catch (error) {
        console.error("Błąd podczas ładowania ustawień motywu:", error);
      }
    };

    loadThemePreference();
  }, []);

  // Aktualizuj motyw przy zmianie trybu lub ustawień systemowych
  useEffect(() => {
    setTheme(calculateTheme(themeMode));
  }, [themeMode, systemColorScheme]);

  // Zapisz preferencje motywu
  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode);
    } catch (error) {
      console.error("Błąd podczas zapisywania ustawień motywu:", error);
    }
  };

  // Zmień tryb motywu
  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  // Przełącz między trybami jasnym i ciemnym (z pominięciem systemowego)
  const toggleTheme = () => {
    const newMode = theme === "dark" ? "light" : "dark";
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDarkTheme: theme === "dark",
        setThemeMode: changeThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
