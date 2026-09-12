import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICity extends Document {
  name: string;
  slug: string;
  label?: string;
  description?: string;
  banner?: string;
  image?: string;
  hotelCount?: string;
  link?: string;
  address?: string;
  phone?: string;
  email?: string;
  mapSrc?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const seoSubdoc = new Schema(
  {
    title: { type: String },
    description: { type: String },
    keywords: { type: String },
    ogImage: { type: String },
  },
  { _id: false }
);

const citySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    label: { type: String },
    description: { type: String },
    banner: { type: String },
    image: { type: String },
    hotelCount: { type: String },
    link: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    mapSrc: { type: String },
    seo: { type: seoSubdoc },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

citySchema.index({ active: 1 });

let City: Model<ICity>;

if (process.env.NODE_ENV !== "production") {
  if (mongoose.models["City"]) {
    delete mongoose.models["City"];
  }
  City = mongoose.model<ICity>("City", citySchema);
} else {
  City = (mongoose.models.City as Model<ICity>) ?? mongoose.model<ICity>("City", citySchema);
}

export default City;
