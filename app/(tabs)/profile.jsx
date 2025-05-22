import React, { useState, useEffect } from "react";
import { View } from "react-native";
import {
  Text,
  Avatar,
  List,
  Button,
  Surface,
  TextInput,
  Card,
  IconButton,
  MD3Colors,
} from "react-native-paper";
import { router } from "expo-router";
import { db } from "../../SimpleSupabaseClient";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, session, signOut, isAuthenticated } = useAuth();

  console.log("Profile - stan auth:", {
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    sessionExists: !!session,
  });

  useEffect(() => {
    if (user?.id) {
      console.log("Pobieranie todos dla użytkownika:", user.id);
      fetchTodos();
    } else {
      console.log("Brak użytkownika do pobrania todos");
      setLoading(false);
    }
  }, [user?.id]); // Zmień zależność na user?.id

  const fetchTodos = async () => {
    try {
      console.log("Pobieranie zadań dla użytkownika", user.id);
      const { data, error } = await db
        .from("todos")
        .eq("user_id", user.id)
        .select("*");

      if (error) {
        console.error("Błąd pobierania todos:", error);
        throw error;
      }

      console.log("Pobrano zadania:", data?.length || 0);
      setTodos(data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dodaj implementację funkcji addTodo
  const addTodo = async () => {
    if (!task.trim() || !user) return;

    try {
      setLoading(true);
      console.log("Dodawanie nowego zadania:", task);

      const { data, error } = await db.from("todos").insert([
        {
          task,
          completed: false,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error("Błąd dodawania zadania:", error);
        throw error;
      }

      setTask("");
      await fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dodaj implementację funkcji updateTodo
  const updateTodo = async (id, completed) => {
    try {
      console.log("Aktualizacja zadania:", id, "completed:", !completed);

      const { error } = await db
        .from("todos")
        .eq("id", id)
        .update({ completed: !completed });

      if (error) {
        console.error("Błąd aktualizacji zadania:", error);
        throw error;
      }

      await fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Dodaj implementację funkcji deleteTodo
  const deleteTodo = async (id) => {
    try {
      console.log("Usuwanie zadania:", id);

      const { error } = await db.from("todos").eq("id", id).delete();

      if (error) {
        console.error("Błąd usuwania zadania:", error);
        throw error;
      }

      await fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Dodaj implementację funkcji handleRefresh
  const handleRefresh = async () => {
    console.log("Odświeżanie listy zadań");
    await fetchTodos();
  };

  // Dodaj implementację funkcji handleSignOut
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Dodaj nowy warunek dla niezalogowanego użytkownika
  if (!isAuthenticated || !user) {
    console.log("Przekierowanie do logowania z profilu");
    // Zaczekaj chwilę, aby mieć pewność że to nie jest tymczasowy stan ładowania
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 300);

    return (
      <Surface
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Nie jesteś zalogowany</Text>
        <Button
          mode="contained"
          onPress={() => router.replace("/auth/login")}
          style={{ marginTop: 20 }}
        >
          Zaloguj się
        </Button>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1 }}>
      <Card style={{ margin: 16 }}>
        <Card.Title
          title={user?.user_metadata?.username || "Użytkownik"}
          subtitle={user.email}
          left={(props) => (
            <Avatar.Image
              {...props}
              size={48}
              source={{
                uri:
                  user?.user_metadata?.avatar_url ||
                  "https://via.placeholder.com/150",
              }}
            />
          )}
        />
      </Card>

      <List.Section>
        <List.Item
          title="Ulubione miejsca"
          left={(props) => <List.Icon {...props} icon="heart" />}
          onPress={() => {}}
        />
        <List.Item
          title="Historia"
          left={(props) => <List.Icon {...props} icon="history" />}
          onPress={() => {}}
        />
        <List.Item
          title="Edytuj profil"
          left={(props) => <List.Icon {...props} icon="account-edit" />}
          onPress={() => {}}
        />
      </List.Section>

      <Card style={{ margin: 16 }}>
        <Card.Title
          title="Lista zadań"
          right={(props) => (
            <IconButton {...props} icon="refresh" onPress={handleRefresh} />
          )}
        />
        <Card.Content>
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <TextInput
              mode="outlined"
              label="Nowe zadanie"
              value={task}
              onChangeText={setTask}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              mode="contained"
              onPress={addTodo}
              loading={loading}
              disabled={loading}
            >
              Dodaj
            </Button>
          </View>

          {todos.map((item) => (
            <List.Item
              key={item.id}
              title={item.task}
              titleStyle={{
                textDecorationLine: item.completed ? "line-through" : "none",
              }}
              right={() => (
                <View style={{ flexDirection: "row" }}>
                  <IconButton
                    icon={item.completed ? "undo" : "check"}
                    onPress={() => updateTodo(item.id, item.completed)}
                  />
                  <IconButton
                    icon="delete"
                    iconColor={MD3Colors.error50}
                    onPress={() => deleteTodo(item.id)}
                  />
                </View>
              )}
            />
          ))}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSignOut}
        style={{ margin: 16 }}
        buttonColor={MD3Colors.error50}
      >
        Wyloguj się
      </Button>
    </Surface>
  );
};

export default Profile;
