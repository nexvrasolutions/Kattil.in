import mongoose, { Schema, Document, Model } from "mongoose";

// ── Link within a section (Navigation, Legal, etc.) ──────────────────────────
export interface IFooterLink {
  label:  string;
  href:   string;
  newTab: boolean;
  order:  number;
}

// ── A named group of links ───────────────────────────────────────────────────
export interface IFooterLinkSection {
  section: string;         // "Navigation", "Legal", etc.
  order:   number;
  links:   IFooterLink[];
}

// ── A single sub-location for multi-type sidebar icons (e.g. WhatsApp → Madurai / Chennai) ─
export interface ISidebarLocation {
  label: string;
  url:   string;
}

// ── A floating sidebar icon ───────────────────────────────────────────────────
export interface ISidebarIcon {
  label:     string;
  tooltip:   string;
  iconName:  string;       // built-in: "whatsapp" | "instagram" | "googlemaps" | "facebook" | "phone" | "mail" | ""
  iconUrl:   string;       // uploaded custom icon path (overrides iconName if set)
  url:       string;       // used when type = "link"
  bgColor:   string;       // CSS color or gradient string
  iconColor: string;       // icon/image tint
  type:      "link" | "multi";
  pulse:     boolean;
  order:     number;
  visible:   boolean;
  locations: ISidebarLocation[];   // used when type = "multi"
}

// ── Social link ───────────────────────────────────────────────────────────────
export interface IFooterSocialLink {
  label:        string;
  url:          string;
  iconName:     string;    // built-in name or ""
  iconImageUrl: string;    // uploaded image path
  bgColor:      string;
  visible:      boolean;
}

export interface IFooter extends Document {
  // Branding
  logo:        string;
  headline:    string;
  description: string;
  tagline:     string;
  copyright:   string;

  // Links
  footerLinks: IFooterLinkSection[];

  // Social
  socialLinks: IFooterSocialLink[];

  // Floating sidebar
  sidebarIcons: ISidebarIcon[];

  // Legacy location blocks (managed from Contact admin)
  locations: Array<{ city: string; address: string; phone?: string; email?: string }>;

  updatedAt: Date;
}

// ── Sub-schemas ────────────────────────────────────────────────────────────────
const footerLinkSubdoc = new Schema<IFooterLink>(
  { label: String, href: String, newTab: { type: Boolean, default: false }, order: { type: Number, default: 0 } },
  { _id: false }
);

const footerLinkSectionSubdoc = new Schema<IFooterLinkSection>(
  { section: String, order: { type: Number, default: 0 }, links: { type: [footerLinkSubdoc], default: [] } },
  { _id: false }
);

const sidebarLocationSubdoc = new Schema<ISidebarLocation>(
  { label: String, url: String },
  { _id: false }
);

const sidebarIconSubdoc = new Schema<ISidebarIcon>(
  {
    label:     { type: String, default: "" },
    tooltip:   { type: String, default: "" },
    iconName:  { type: String, default: "" },
    iconUrl:   { type: String, default: "" },
    url:       { type: String, default: "" },
    bgColor:   { type: String, default: "#333333" },
    iconColor: { type: String, default: "#ffffff" },
    type:      { type: String, enum: ["link", "multi"], default: "link" },
    pulse:     { type: Boolean, default: false },
    order:     { type: Number, default: 0 },
    visible:   { type: Boolean, default: true },
    locations: { type: [sidebarLocationSubdoc], default: [] },
  },
  { _id: false }
);

const socialLinkSubdoc = new Schema<IFooterSocialLink>(
  {
    label:        { type: String, default: "" },
    url:          { type: String, default: "" },
    iconName:     { type: String, default: "" },
    iconImageUrl: { type: String, default: "" },
    bgColor:      { type: String, default: "#333333" },
    visible:      { type: Boolean, default: true },
  },
  { _id: false }
);

const locationSubdoc = new Schema(
  { city: String, address: String, phone: String, email: String },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const footerSchema = new Schema<IFooter>(
  {
    logo:         { type: String, default: "/assets/logo.png" },
    headline:     { type: String, default: "" },
    description:  { type: String, default: "" },
    tagline:      { type: String, default: "" },
    copyright:    { type: String, default: "" },
    footerLinks:  { type: [footerLinkSectionSubdoc], default: [] },
    socialLinks:  { type: [socialLinkSubdoc], default: [] },
    sidebarIcons: { type: [sidebarIconSubdoc], default: [] },
    locations:    { type: [locationSubdoc], default: [] },
  },
  { timestamps: true }
);

const Footer: Model<IFooter> =
  (mongoose.models.Footer as Model<IFooter>) ||
  mongoose.model<IFooter>("Footer", footerSchema);

export default Footer;
