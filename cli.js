#!/usr/bin/env node

let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  chalk = {
    cyan: s => s,
    gray: s => s,
    green: s => s,
    yellow: s => s,
    red: s => s,
    white: s => s,
    bold: s => s
  };
}
const { addTask, listTasks, completeTask, deleteTask, getTask } = require('./index');

function showHelp() {
  console.log(chalk.cyan('Usage:'));
  console.log('  todo add <text>    - Add a new task');
  console.log('  todo list          - List all tasks');
  console.log('  todo complete <id> - Mark a task as complete');
  console.log('  todo delete <id>   - Delete a task');
  console.log('  todo --help        - Show this help message');
}

function formatTask(task) {
  const status = task.completed ? chalk.green('✓') : chalk.yellow('○');
  const text = task.completed ? chalk.green(task.text) : chalk.white(task.text);
  return `${chalk.gray(String(task.id).padStart(3, ' '))} ${status} ${text}`;
}

function cmdAdd(args) {
  if (args.length === 0) {
    console.error(chalk.red('Error: Task text is required'));
    console.error(chalk.gray('Usage: todo add <text>'));
    process.exit(1);
  }
  const text = args.join(' ');
  if (!text.trim()) {
    console.error(chalk.red('Error: Task text cannot be empty'));
    process.exit(1);
  }
  const task = addTask(text);
  console.log(chalk.green(`Task added successfully (ID: ${task.id})`));
}

function cmdList() {
  const tasks = listTasks();
  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks yet. Add one with: todo add <text>'));
    return;
  }

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  console.log(chalk.cyan('\nTasks:'));
  tasks.forEach(task => {
    console.log(formatTask(task));
  });

  console.log(chalk.gray(`\n${pending.length} pending / ${completed.length} completed`));
}

function cmdComplete(args) {
  if (args.length === 0) {
    console.error(chalk.red('Error: Task ID is required'));
    console.error(chalk.gray('Usage: todo complete <id>'));
    process.exit(1);
  }

  const id = parseInt(args[0], 10);
  if (isNaN(id)) {
    console.error(chalk.red('Error: Invalid task ID'));
    process.exit(1);
  }

  const task = getTask(id);
  if (!task) {
    console.error(chalk.red(`Error: Task not found (ID: ${id})`));
    process.exit(1);
  }

  if (task.completed) {
    console.log(chalk.yellow(`Task ${id} is already completed`));
    return;
  }

  completeTask(id);
  console.log(chalk.green(`Task ${id} marked as complete`));
}

function cmdDelete(args) {
  if (args.length === 0) {
    console.error(chalk.red('Error: Task ID is required'));
    console.error(chalk.gray('Usage: todo delete <id>'));
    process.exit(1);
  }

  const id = parseInt(args[0], 10);
  if (isNaN(id)) {
    console.error(chalk.red('Error: Invalid task ID'));
    process.exit(1);
  }

  const task = getTask(id);
  if (!task) {
    console.error(chalk.red(`Error: Task not found (ID: ${id})`));
    process.exit(1);
  }

  deleteTask(id);
  console.log(chalk.green(`Task ${id} deleted`));
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  const commandArgs = args.slice(1);

  switch (command) {
    case 'add':
      cmdAdd(commandArgs);
      break;
    case 'list':
      cmdList();
      break;
    case 'complete':
      cmdComplete(commandArgs);
      break;
    case 'delete':
    case 'del':
      cmdDelete(commandArgs);
      break;
    default:
      console.error(chalk.red(`Error: Unknown command '${command}'`));
      console.error(chalk.gray(`Run 'todo --help' for usage information`));
      process.exit(1);
  }
}

main();