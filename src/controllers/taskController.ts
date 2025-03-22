import { Request, Response } from 'express';
import Task from '../models/Task.js';

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  const { title, description, priority, dueDate, assignedTo } = req.body;
  const createdBy = req.body.userId;
  try {
    const newTask = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy,
    });
    await newTask.save();
    res.json({ success: true, task: newTask });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tasks for logged in user (or all tasks if admin)
export const getTasks = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const userRole = req.body.role; // set in auth middleware
  try {
    let tasks;
    if (userRole === 'Admin') {
      tasks = await Task.find();
    } else {
      tasks = await Task.find({ createdBy: userId });
    }
    res.json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get task details
export const getTaskById = async (req: Request, res: Response) => {
  const taskId = req.params.id;
  try {
    const task = await Task.findById(taskId);
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task
export const updateTask = async (req: Request, res: Response) => {
  const taskId = req.params.id;
  const updateData = req.body;
  try {
    const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response) => {
  const taskId = req.params.id;
  try {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
