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

  const calculateTheme = (mode: ThemeMode): "light" | "dark" => {
    if (mode === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return mode;
  };

  const [theme, setTheme] = useState<"light" | "dark">(
    calculateTheme(themeMode)
  );

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem("themeMode");
        if (savedThemeMode) {
          setThemeMode(savedThemeMode as ThemeMode);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    setTheme(calculateTheme(themeMode));
  }, [themeMode, systemColorScheme]);

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode);
    } catch (error) {
      console.error(error);
    }
  };

  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

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
