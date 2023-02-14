/* src/App.js */
import React, { useEffect, useState } from "react";
import { Amplify, API, graphqlOperation } from "aws-amplify";
// import { createTodo, updateTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";

// for real time update using subscription
// import {
//   onCreateTodo,
//   onUpdateTodo,
//   onDeleteTodo,
// } from "./graphql/subscriptions";

import { DataStore } from "aws-amplify";
import { Todo } from "./models";
import TodoItem from "./components/TodoItem";

import {
  withAuthenticator,
  Button,
  Heading,
  TextField,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import awsExports from "./aws-exports";

import { Flex, Tabs, TabItem } from "@aws-amplify/ui-react";
import { Radio, RadioGroupField } from "@aws-amplify/ui-react";
import { SelectField } from "@aws-amplify/ui-react";

Amplify.configure(awsExports);

const initialState = {
  name: "",
  description: "",
  state: "unfinished",
  category: "house",
};

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [toDoStateIndex, setToDoStateIndex] = useState(0);
  const [filter, setFilter] = useState("state");

  useEffect(() => {
    fetchTodos();

    // real-time update using subscribe
    const subscription = DataStore.observe(Todo).subscribe((value) => {
      console.log(value.model, value.opType, value.element);
      setTodos((todos) => {
        const toUpdateIndex = todos.findIndex(
          (item) => item.id === value.element.id
        );
        if (toUpdateIndex === -1) {
          // If the todo doesn't exist, treat it like an "add"
          return [...todos, value.element];
        }
        return [
          ...todos.slice(0, toUpdateIndex),
          value.element,
          ...todos.slice(toUpdateIndex + 1),
        ];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setFormState(initialState);
      DataStore.save(new Todo(todo));
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  async function modifyTodo(todoItem) {
    const original = await DataStore.query(Todo, todoItem.id);
    await DataStore.save(
      Todo.copyOf(original, (updated) => {
        updated.state = todoItem.state;
        updated._version = todoItem.version;
      })
    );
  }

  return (
    <View style={styles.container}>
      <Heading level={2}>Hello {user.username}</Heading>
      <Button style={styles.button} onClick={signOut}>
        Sign out
      </Button>
      <View style={styles.createTodo}>
        <Heading level={4}>Create Todo</Heading>
        <TextField
          placeholder="Name"
          onChange={(event) => setInput("name", event.target.value)}
          style={styles.input}
          defaultValue={formState.name}
        />
        <TextField
          placeholder="Description"
          onChange={(event) => setInput("description", event.target.value)}
          style={styles.input}
          defaultValue={formState.description}
        />
        <SelectField
          onChange={(event) => setInput("category", event.target.value)}
        >
          <option value="house">House work</option>
          <option value="work">Work</option>
          <option value="others">Others</option>
        </SelectField>
        <Button style={styles.button} onClick={addTodo}>
          Create Todo
        </Button>
      </View>
      <RadioGroupField
        id="filter"
        style={styles.radioGroup}
        label="Filter: "
        name="animal"
        direction="row"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <Radio value="state">By State</Radio>
        <Radio value="category">By Category</Radio>
      </RadioGroupField>
      {filter === "state" && (
        <Flex direction="column" gap="2rem" style={{ marginTop: "5px" }}>
          <Tabs
            defaultIndex={0}
            currentIndex={toDoStateIndex}
            onChange={(i) => setToDoStateIndex(i)}
            justifyContent="center"
          >
            <TabItem title="All">
              <div>
                {todos.map((todo, index) => (
                  <TodoItem
                    id={todo.id}
                    name={todo.name}
                    description={todo.description}
                    category={todo.category}
                    state={todo.state}
                    index={index}
                    modifyTodo={modifyTodo}
                    version={todo._version}
                    key={index}
                  />
                ))}
              </div>
            </TabItem>
            <TabItem title="Finished">
              {todos
                .filter((item) => item.state === "finished")
                .map((todo, index) => {
                  return (
                    <TodoItem
                      id={todo.id}
                      name={todo.name}
                      description={todo.description}
                      category={todo.category}
                      state={todo.state}
                      index={index}
                      modifyTodo={modifyTodo}
                      version={todo._version}
                      key={index}
                    />
                  );
                })}
            </TabItem>
            <TabItem title="Unfinished">
              {todos
                .filter((item) => item.state === "unfinished")
                .map((todo, index) => {
                  return (
                    <TodoItem
                      id={todo.id}
                      name={todo.name}
                      description={todo.description}
                      category={todo.category}
                      state={todo.state}
                      index={index}
                      modifyTodo={modifyTodo}
                      version={todo._version}
                      key={index}
                    />
                  );
                })}
            </TabItem>
          </Tabs>
        </Flex>
      )}
      {filter === "category" && (
        <Flex direction="column" gap="2rem">
          <Tabs
            defaultIndex={0}
            currentIndex={toDoStateIndex}
            onChange={(i) => setToDoStateIndex(i)}
            justifyContent="center"
          >
            <TabItem title="All">
              <div>
                {todos.map((todo, index) => (
                  <TodoItem
                    id={todo.id}
                    name={todo.name}
                    description={todo.description}
                    category={todo.category}
                    state={todo.state}
                    index={index}
                    modifyTodo={modifyTodo}
                    version={todo._version}
                    key={index}
                  />
                ))}
              </div>
            </TabItem>
            <TabItem title="House Work">
              {todos
                .filter((item) => item.category === "house")
                .map((todo, index) => {
                  return (
                    <TodoItem
                      id={todo.id}
                      name={todo.name}
                      description={todo.description}
                      category={todo.category}
                      state={todo.state}
                      index={index}
                      modifyTodo={modifyTodo}
                      version={todo._version}
                      key={index}
                    />
                  );
                })}
            </TabItem>
            <TabItem title="Work">
              {todos
                .filter((item) => item.category === "work")
                .map((todo, index) => {
                  return (
                    <TodoItem
                      id={todo.id}
                      name={todo.name}
                      description={todo.description}
                      category={todo.category}
                      state={todo.state}
                      index={index}
                      modifyTodo={modifyTodo}
                      version={todo._version}
                      key={index}
                    />
                  );
                })}
            </TabItem>
            <TabItem title="Others">
              {todos
                .filter((item) => item.category === "others")
                .map((todo, index) => {
                  return (
                    <TodoItem
                      id={todo.id}
                      name={todo.name}
                      description={todo.description}
                      category={todo.category}
                      state={todo.state}
                      index={index}
                      modifyTodo={modifyTodo}
                      version={todo._version}
                      key={index}
                    />
                  );
                })}
            </TabItem>
          </Tabs>
        </Flex>
      )}
    </View>
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  button: {
    backgroundColor: "blue",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 12px",
    marginTop: "12px",
  },
  createTodo: {
    marginTop: 6,
    border: "2px solid black",
    textAlign: "center",
    padding: 5,
  },
  radioGroup: {
    marginTop: "20px",
    border: "2px solid black",
    borderRadius: "5px",
    textAlign: "center",
    padding: "10px"
  },
};

export default withAuthenticator(App);
