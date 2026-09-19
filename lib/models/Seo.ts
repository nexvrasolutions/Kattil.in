import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISeo extends Document {
  page: string;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  jsonLd?: string;
  robots?: string;
  canonical?: string;
  updatedAt: Date;
}

const seoSchema = new Schema<ISeo>(
  {
    page: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String },
    description: { type: String },
    keywords: { type: String },
    ogImage: { type: String },
    jsonLd: { type: String },
    robots: { type: String, default: "index, follow" },
    canonical: { type: String },
  },
  { timestamps: true }
);

const Seo: Model<ISeo> =
  mongoose.models.Seo ?? mongoose.model<ISeo>("Seo", seoSchema);

export default Seo;
