import mongoose, { Schema, Document, Model } from "mongoose";
import { isValidEmail } from "@/lib/utils/email";
import { isValidHttpsUrl } from "@/lib/utils/url";

export interface IPropertyDirections {
  railway?: string;
  busStand?: string;
  landmark?: string;
  byCar?: string;
  important?: string;
  helpText?: string;
}

export interface IProperty extends Document {
  name: string;
  slug: string;
  city?: mongoose.Types.ObjectId;
  badge?: string; // e.g. "Private room", "Homestay", "Hotel", "Boutique Stay"
  category?: string; // "hotel", "homestay", "resort", "hostel"
  tagline?: string;
  description?: string;
  images: string[];
  address: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  mapSrc?: string;
  amenities: string[];
  directions?: IPropertyDirections;
  hotelCode?: string; // Booking API Hotel/PMS Code (e.g. "kattilchennai", "kattil")
  bookingEngineUrl?: string; // Custom Let's Book / Booking Engine URL
  featured: boolean;
  order: number;
  status: "active" | "inactive" | "maintenance";
  createdAt: Date;
  updatedAt: Date;
}

const directionsSubdoc = new Schema<IPropertyDirections>(
  {
    railway: { type: String },
    busStand: { type: String },
    landmark: { type: String },
    byCar: { type: String },
    important: { type: String },
    helpText: { type: String },
  },
  { _id: false }
);

const propertySchema = new Schema<IProperty>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    city: { type: Schema.Types.ObjectId, ref: "City", required: false },
    badge: { type: String, default: "Private room" },
    category: {
      type: String,
      enum: ["hotel", "homestay", "resort", "hostel", "deluxe", "suite", "standard"],
      default: "homestay",
    },
    tagline: { type: String },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    address: { type: String, default: "" },
    phone: { type: String },
    // Defense-in-depth: matches the API's Zod check so an invalid email can't
    // reach persistence via any path that bypasses the API layer.
    email: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidEmail(v),
        message: "Please enter a valid email address",
      },
    },
    whatsapp: { type: String },
    mapSrc: { type: String },
    amenities: { type: [String], default: [] },
    directions: { type: directionsSubdoc },
    hotelCode: { type: String, trim: true },
    // Defense-in-depth: matches the API's Zod check so a malformed booking URL
    // can't reach persistence via any path that bypasses the API layer.
    bookingEngineUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidHttpsUrl(v),
        message: "Please enter a valid HTTPS booking URL",
      },
    },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ slug: 1, city: 1 }, { unique: true });
propertySchema.index({ city: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ featured: 1 });

const Property: Model<IProperty> =
  (mongoose.models.Property as Model<IProperty>) ||
  mongoose.model<IProperty>("Property", propertySchema);

export default Property;
