import React, { useState } from "react";
import { Surface, List, Switch, Divider } from "react-native-paper";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Surface style={{ flex: 1 }}>
      <List.Section>
        <List.Subheader>Ustawienia aplikacji</List.Subheader>

        <List.Item
          title="Powiadomienia"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#5C6BC0" }}
            />
          )}
        />

        <Divider />

        <List.Item
          title="Tryb ciemny"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: "#5C6BC0" }}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Informacje</List.Subheader>

        <List.Item
          title="O aplikacji"
          left={(props) => <List.Icon {...props} icon="information" />}
          onPress={() => {}}
        />

        <List.Item
          title="Polityka prywatności"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
          onPress={() => {}}
        />

        <List.Item
          title="Warunki użytkowania"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          onPress={() => {}}
        />
      </List.Section>
    </Surface>
  );
}
