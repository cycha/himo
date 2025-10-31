import mongoose, { Schema } from 'mongoose';
import { IAd } from '../types';

const adSchema = new Schema<IAd>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    thumb_urls: {
      type: [String],
      default: [],
    },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    real_estate_type: {
      type: String,
      enum: ['appartement', 'maison', 'terrain', 'parking', 'local-commercial'],
      lowercase: true,
    },
    rooms: {
      type: Number,
      min: 0,
      max: 50,
    },
    surface: {
      type: Number,
      min: 0,
      max: 10000,
    },
    immo_sell_type: {
      type: String,
      enum: ['neuf', 'ancien'],
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    provider: {
      type: String,
      required: true,
      enum: ['leboncoin', 'seloger', 'pap', 'bienici'],
      lowercase: true,
    },
    location: {
      region_name: String,
      department_id: String,
      department_name: String,
      city: String,
      zipcode: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
    },
    release_date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  }
);

// Indexes
adSchema.index({ title: 'text', description: 'text' });
adSchema.index({ 'location.coordinates': '2dsphere' });
adSchema.index({ provider: 1, release_date: -1 });
adSchema.index({ price: 1 });
adSchema.index({ surface: 1 });
adSchema.index({ real_estate_type: 1 });

export const Ad = mongoose.model<IAd>('Ad', adSchema);
