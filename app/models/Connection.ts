import * as mongoose from 'mongoose';

interface IConnectionModel extends mongoose.Document {
  connectionId: string,
  instanceId: string,
  userId: number,
  roomId: number
}

const connectionSchema = new mongoose.Schema({
  connectionId: { type: String, required: true },
  instanceId: { type: String, required: true },
  userId: { type: Number, default: null },
  roomId: { type: Number, default: null }
});

export const ConnectionModel = mongoose.model<IConnectionModel>('Connection', connectionSchema);