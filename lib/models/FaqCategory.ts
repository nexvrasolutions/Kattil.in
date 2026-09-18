import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaqCategory extends Document {
  name: string;
  slug: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const faqCategorySchema = new Schema<IFaqCategory>(
  {
    name:   { type: String, required: true, trim: true },
    slug:   { type: String, required: true, unique: true, lowercase: true },
    active: { type: Boolean, default: true },
    order:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqCategorySchema.index({ slug: 1 }, { unique: true });
faqCategorySchema.index({ active: 1, order: 1 });

const FaqCategory: Model<IFaqCategory> =
  (mongoose.models.FaqCategory as Model<IFaqCategory>) ||
  mongoose.model<IFaqCategory>("FaqCategory", faqCategorySchema);

export default FaqCategory;
