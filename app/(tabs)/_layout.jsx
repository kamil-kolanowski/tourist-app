import React, { useEffect } from "react";
import { Image, View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { icons } from "@/assets/constants/icons";
import { useAuth } from "../../contexts/AuthContext";

const TabIcon = ({ focused, icon }) => {
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
        tintColor={focused ? "#111" : "#AAA"}
      />
    </View>
  );
};

const TabsLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
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
          backgroundColor: "#FFF",
          position: "absolute",
          border: "none",
          borderRadius: 20,
          height: 90,
          overflow: "hidden",
        },
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
            <TabIcon focused={focused} icon={icons.saved} />
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
    </Tabs>
  );
};

export default TabsLayout;
