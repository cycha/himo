import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to verify password
userSchema.methods.authenticate = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Method to generate JWT token
userSchema.methods.getToken = function (): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const payload = {
    id: this._id,
    email: this.email,
  };
  
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
};

export const User = mongoose.model<IUser>('User', userSchema);
