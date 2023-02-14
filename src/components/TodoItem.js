import React from "react";
import { Button, Text, View, SelectField } from "@aws-amplify/ui-react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

function TodoItem({
  id,
  name,
  description,
  category,
  state,
  index,
  modifyTodo,
  version,
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [todoState, setTodoState] = useState("unfinished");
  const todoDetails = {
    id: id,
    state: todoState,
    version: version,
  };
  return (
    <>
      <View key={id ? id : index} style={styles.todo}>
        <Text style={styles.todoName}>Name: {name}</Text>
        <Text style={styles.todoDescription}>Description: {description}</Text>
        <Text style={styles.category}>Category: {category}</Text>
        <Text style={styles.state}>State: {state}</Text>
        <Button style={styles.todoCreateButton} onClick={handleOpen}>
          Modify the todo state
        </Button>
      </View>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styles.popupWindow}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update the todo item state
          </Typography>
          <SelectField
            label="Fruit"
            labelHidden
            value={todoState}
            onChange={(e) => setTodoState(e.target.value)}
          >
            <option key={1} value="finished">Finished</option>
            <option key={2} value="unfinished">Unfinished</option>
          </SelectField>
          <Box textAlign="center">
            <Button
              style={styles.updateStateButton}
              onClick={() => {
                modifyTodo(todoDetails);
                setOpen(false);
              }}
            >
              Update State
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

const styles = {
  todo: {
    border: "1px solid black",
    marginTop: "5px",
    textAlign: "center",
    backgroundColor: "#e4edeb",
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  category: { fontSize: 20, fontWeight: "bold" },
  state: { fontSize: 20, fontWeight: "bold" },
  todoCreateButton: {
    marginBottom: "5px",
    backgroundColor: "blue",
    color: "white",
  },
  updateStateButton: {
    marginTop: "15px",
    backgroundColor: "blue",
    color: "white",
  },
  popupWindow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  },
};
export default TodoItem;
