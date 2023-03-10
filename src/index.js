const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ error: "User not found." });
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const checksIfAlreadyExistsUserAccount = users.find(user => user.username === username);

  if (checksIfAlreadyExistsUserAccount) {
    return response.status(400).json({ error: "User already exists." });
  }

  const user = {

    id: uuidv4(),
    name,
    username,
    todos: []

  };

  users.push(user);

  return response.status(201).send(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {

    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()

  };

  user.todos.push(todo);

  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({ error: "ToDo not found." })
  }

  const todoPosition = user.todos.indexOf(todo);
  
  const { title, deadline } = request.body;

  user.todos[todoPosition].title = title;
  user.todos[todoPosition].deadline = new Date(deadline);

  return response.status(201).send(user.todos[todoPosition]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({ error: "ToDo not found." })
  }

  const todoPosition = user.todos.indexOf(todo);

  user.todos[todoPosition].done = true;

  return response.status(201).send(user.todos[todoPosition]);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({ error: "ToDo not found." })
  }

  const todoPosition = user.todos.indexOf(todo);

  user.todos.splice(todoPosition, 1);

  return response.status(204).json({ message: "ToDo deleted." });

});

module.exports = app;