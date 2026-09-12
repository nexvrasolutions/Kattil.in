import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  content?: string;
  image?: string;
  additionalImages?: string[];   // extra supporting images
  readTime?: string;
  date?: string;
  publishedAt?: Date;
  featured?: boolean;
  status?: "draft" | "published";
  author?: string;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}


const seoSubdoc = new Schema(
  { title: { type: String }, description: { type: String }, keywords: { type: String }, ogImage: { type: String } },
  { _id: false }
);

const blogSchema = new Schema<IBlog>(
  {
    title:            { type: String, required: true, trim: true },
    slug:             { type: String, required: true, unique: true },
    category:         { type: String, required: true, trim: true },
    excerpt:          { type: String, default: "" },
    content:          { type: String, default: "" },
    image:            { type: String, default: "" },
    additionalImages: { type: [String], default: [] },
    readTime:         { type: String, default: "" },
    date:             { type: String, default: "" },
    publishedAt:      { type: Date },
    featured:         { type: Boolean, default: false },
    status:           { type: String, enum: ["draft", "published"], default: "draft" },
    author:           { type: String },
    tags:             { type: [String], default: [] },
    seo:              { type: seoSubdoc },
    order:            { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.index({ status: 1 });
blogSchema.index({ featured: 1 });
blogSchema.index({ category: 1 });

// Dev: always re-compile to pick up schema changes without restart
if (process.env.NODE_ENV !== "production" && mongoose.models["Blog"]) {
  delete mongoose.models["Blog"];
}
const Blog: Model<IBlog> =
  (mongoose.models.Blog as Model<IBlog>) ?? mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;
