import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.js';

export interface ITask extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId | IUser;
  assignedTo?: mongoose.Types.ObjectId | IUser;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To-Do' | 'In Progress' | 'Completed';
  dueDate?: Date;
  comments: Array<mongoose.Types.ObjectId>;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['To-Do', 'In Progress', 'Completed'], default: 'To-Do' },
  dueDate: { type: Date },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
}, {
  timestamps: true,
});

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
