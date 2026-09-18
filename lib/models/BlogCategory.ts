import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogCategory extends Document {
  name: string;
  slug: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogCategorySchema = new Schema<IBlogCategory>(
  {
    name:   { type: String, required: true, trim: true },
    slug:   { type: String, required: true, unique: true, lowercase: true },
    active: { type: Boolean, default: true },
    order:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogCategorySchema.index({ slug: 1 }, { unique: true });
blogCategorySchema.index({ active: 1, order: 1 });

const BlogCategory: Model<IBlogCategory> =
  (mongoose.models.BlogCategory as Model<IBlogCategory>) ||
  mongoose.model<IBlogCategory>("BlogCategory", blogCategorySchema);

export default BlogCategory;
