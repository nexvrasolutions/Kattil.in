import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaq extends Document {
  question: string;
  answer: string;
  category: "Reservations" | "Amenities" | "Dining" | "Policies";
  status: "active" | "inactive";
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Reservations", "Amenities", "Dining", "Policies"],
      required: true,
    },
    // Defaults to inactive (draft) so a new FAQ is never publicly visible
    // until an admin explicitly publishes it.
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqSchema.index({ category: 1 });
faqSchema.index({ status: 1 });
faqSchema.index({ displayOrder: 1 });

const Faq: Model<IFaq> =
  mongoose.models.Faq ?? mongoose.model<IFaq>("Faq", faqSchema);

export default Faq;
