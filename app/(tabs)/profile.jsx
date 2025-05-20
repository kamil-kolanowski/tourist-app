import React, { useState, useEffect } from "react";
import { View } from "react-native";
import {
  Text,
  Avatar,
  List,
  Button,
  Surface,
  Provider as PaperProvider,
  TextInput,
  Card,
  IconButton,
  MD3Colors,
} from "react-native-paper";
import { db, auth } from "../../FirebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";

function Profile() {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const todosCollection = collection(db, "todos");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchTodos(user.uid);
      } else {
        setUser(null);
        setTodos([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTodos = async (userId) => {
    const q = query(todosCollection, where("userId", "==", userId));
    const data = await getDocs(q);
    setTodos(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const addTodo = async () => {
    if (user) {
      await addDoc(todosCollection, {
        task,
        completed: false,
        userId: user.uid,
      });
      setTask("");
      fetchTodos(user.uid);
    } else {
      console.log("No user logged in");
    }
  };

  const updateTodo = async (id, completed) => {
    const todoDoc = doc(db, "todos", id);
    await updateDoc(todoDoc, { completed: !completed });
    fetchTodos(user.uid);
  };

  const deleteTodo = async (id) => {
    const todoDoc = doc(db, "todos", id);
    await deleteDoc(todoDoc);
    fetchTodos(user.uid);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace("/"); // Zmiana z "/auth/login" na "/"
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <PaperProvider>
      <Surface style={{ flex: 1 }}>
        <Card style={{ margin: 16 }}>
          <Card.Title
            title={user?.displayName || "Użytkownik"}
            subtitle={user?.email}
            left={(props) => (
              <Avatar.Image
                {...props}
                size={48}
                source={{
                  uri: user?.photoURL || "https://via.placeholder.com/150",
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
          <Card.Title title="Lista zadań" />
          <Card.Content>
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <TextInput
                mode="outlined"
                label="Nowe zadanie"
                value={task}
                onChangeText={setTask}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button mode="contained" onPress={addTodo}>
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
    </PaperProvider>
  );
}

export default Profile;
