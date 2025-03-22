import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.js';
import { ITask } from './Task.js';

export interface IComment extends Document {
  task: mongoose.Types.ObjectId | ITask;
  commentedBy: mongoose.Types.ObjectId | IUser;
  comment: string;
}

const CommentSchema: Schema = new Schema({
  task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  commentedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
}, {
  timestamps: true,
});

const Comment = mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;
