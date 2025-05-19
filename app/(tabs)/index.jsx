import { Link } from "expo-router";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

const HomeScreen = () => {
  return (
    <View>
      <Text>Home screen</Text>
      <Button
        icon={"camera"}
        mode="contained"
        onPress={() => console.log("Pressed")}
      >
        Press me
      </Button>
    </View>
  );
};

export default HomeScreen;
