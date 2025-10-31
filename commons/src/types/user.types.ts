import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  created_at?: Date;
  authenticate(password: string): Promise<boolean>;
  getToken(): string;
}
