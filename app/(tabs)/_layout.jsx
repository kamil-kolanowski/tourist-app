import { Tabs } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import { icons } from "@/assets/constants/icons";

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
