const fs = require('fs');
const path = require('path');
const os = require('os');

const STORAGE_DIR = path.join(os.homedir(), '.todo-cli');
const STORAGE_FILE = path.join(STORAGE_DIR, 'tasks.json');

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function readTasks() {
  ensureStorageDir();
  if (!fs.existsSync(STORAGE_FILE)) {
    return { tasks: [], nextId: 1 };
  }
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading tasks file:', err.message);
    return { tasks: [], nextId: 1 };
  }
}

function writeTasks(data) {
  ensureStorageDir();
  const tempFile = STORAGE_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, STORAGE_FILE);
}

function getTasks() {
  return readTasks();
}

function addTask(text) {
  const data = readTasks();
  const task = {
    id: data.nextId,
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  data.tasks.push(task);
  data.nextId++;
  writeTasks(data);
  return task;
}

function listTasks() {
  const data = readTasks();
  return data.tasks;
}

function completeTask(id) {
  const data = readTasks();
  const task = data.tasks.find(t => t.id === id);
  if (!task) {
    return null;
  }
  task.completed = true;
  writeTasks(data);
  return task;
}

function deleteTask(id) {
  const data = readTasks();
  const index = data.tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return null;
  }
  const deleted = data.tasks.splice(index, 1)[0];
  writeTasks(data);
  return deleted;
}

function getTask(id) {
  const data = readTasks();
  return data.tasks.find(t => t.id === id) || null;
}

module.exports = {
  getTasks,
  addTask,
  listTasks,
  completeTask,
  deleteTask,
  getTask,
  STORAGE_FILE
};