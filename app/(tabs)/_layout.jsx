import React, { useEffect } from "react";
import { Image, View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { icons } from "@/assets/constants/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

const TabIcon = ({ focused, icon, materialIconName }) => {
  const { isDarkTheme } = useTheme();

  // Jeśli podano nazwę ikony Material, użyj jej
  if (materialIconName) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <MaterialIcons
          name={materialIconName}
          size={30}
          color={
            focused
              ? isDarkTheme
                ? "#FFFFFF"
                : "#111111"
              : isDarkTheme
                ? "#888888"
                : "#AAAAAA"
          }
        />
      </View>
    );
  }

  // W przeciwnym razie użyj obrazka ikony
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Image
        source={icon}
        style={{
          width: 30,
          height: 30,
        }}
        tintColor={
          focused
            ? isDarkTheme
              ? "#FFFFFF"
              : "#111111"
            : isDarkTheme
              ? "#888888"
              : "#AAAAAA"
        }
      />
    </View>
  );
};

const TabsLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { isDarkTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Sprawdź po załadowaniu czy użytkownik jest zalogowany
    if (!loading && !isAuthenticated) {
      console.log("TabsLayout: użytkownik nie zalogowany, przekierowanie");
      router.replace("/auth/login");
    }
  }, [loading, isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: 90,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
        },
        tabBarStyle: {
          backgroundColor: isDarkTheme ? "#1E1E1E" : "#FFFFFF",
          position: "absolute",
          border: "none",
          borderRadius: 20,
          height: 90,
          overflow: "hidden",
        },
        tabBarActiveTintColor: isDarkTheme ? "#FFFFFF" : "#111111",
        tabBarInactiveTintColor: isDarkTheme ? "#888888" : "#AAAAAA",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-place"
        options={{
          headerShown: false,
          title: "Add Place",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} materialIconName="add-circle" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.profile} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <MaterialIcons
                name="settings"
                size={30}
                color={
                  focused
                    ? isDarkTheme
                      ? "#FFFFFF"
                      : "#111111"
                    : isDarkTheme
                      ? "#888888"
                      : "#AAAAAA"
                }
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
