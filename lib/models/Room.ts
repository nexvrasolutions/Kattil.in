import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoom extends Document {
  name: string;
  slug: string;
  property?: mongoose.Types.ObjectId;
  city?: mongoose.Types.ObjectId;
  category: string;
  images: string[];
  link?: string; // Direct Let's Book / Booking Engine URL for this room
  roomCode?: string; // Room Type ID / Code (e.g. roomtypeunkid for eZee)
  description?: string;
  features: string[];
  amenities: string[];
  pricing?: { label: string; value: string }[];
  occupancy?: string;
  cta?: { text: string; url: string };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
  featured: boolean;
  status: "active" | "inactive" | "maintenance";
  badge?: string;
  additionalInfo?: string;
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

const ctaSubdoc = new Schema(
  {
    text: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const pricingSubdoc = new Schema(
  {
    label: { type: String },
    value: { type: String },
  },
  { _id: false }
);

const roomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    property: { type: Schema.Types.ObjectId, ref: "Property" },
    city: { type: Schema.Types.ObjectId, ref: "City" },
    category: {
      type: String,
      enum: ["deluxe", "suite", "standard", "premium", "dormitory"],
      default: "deluxe",
    },
    images: { type: [String], default: [] },
    link: { type: String },
    roomCode: { type: String, trim: true },
    description: { type: String, default: "" },
    features: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    pricing: { type: [pricingSubdoc] },
    occupancy: { type: String },
    cta: { type: ctaSubdoc },
    seo: { type: seoSubdoc },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    badge: { type: String },
    additionalInfo: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

roomSchema.index({ slug: 1, property: 1 });
roomSchema.index({ property: 1 });
roomSchema.index({ city: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ featured: 1 });

let Room: Model<IRoom>;

if (process.env.NODE_ENV !== "production") {
  if (mongoose.models["Room"]) {
    delete mongoose.models["Room"];
  }
  Room = mongoose.model<IRoom>("Room", roomSchema);
} else {
  Room = (mongoose.models.Room as Model<IRoom>) ?? mongoose.model<IRoom>("Room", roomSchema);
}

export default Room;
