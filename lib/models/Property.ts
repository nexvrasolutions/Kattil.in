import mongoose, { Schema, Document, Model } from "mongoose";

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
  city: mongoose.Types.ObjectId;
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
  status: "active" | "inactive" | "maintenance";
  order: number;
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
    city: { type: Schema.Types.ObjectId, ref: "City", required: true },
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
    email: { type: String },
    whatsapp: { type: String },
    mapSrc: { type: String },
    amenities: { type: [String], default: [] },
    directions: { type: directionsSubdoc },
    hotelCode: { type: String, trim: true },
    bookingEngineUrl: { type: String, trim: true },
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

let Property: Model<IProperty>;

if (process.env.NODE_ENV !== "production") {
  if (mongoose.models["Property"]) {
    delete mongoose.models["Property"];
  }
  Property = mongoose.model<IProperty>("Property", propertySchema);
} else {
  Property = (mongoose.models.Property as Model<IProperty>) ?? mongoose.model<IProperty>("Property", propertySchema);
}

export default Property;
