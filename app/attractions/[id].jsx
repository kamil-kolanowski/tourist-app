import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const AttractionDetails = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Movie det: {id}</Text>
    </View>
  );
};

export default AttractionDetails;
