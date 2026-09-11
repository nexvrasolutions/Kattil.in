import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

const seoSubSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  ogImage: z.string().optional(),
});

const ctaSubSchema = z.object({
  text: z.string(),
  url: z.string(),
});

// ---------------------------------------------------------------------------
// City
// ---------------------------------------------------------------------------

export const citySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  banner: z.string().optional(),
  image: z.string().optional(),
  hotelCount: z.string().optional(),
  link: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  mapSrc: z.string().optional(),
  seo: seoSubSchema.optional(),
  active: z.boolean().default(true),
  order: z.number().default(0),
});

export const updateCitySchema = citySchema.partial();

// ---------------------------------------------------------------------------
// Property
// ---------------------------------------------------------------------------

const directionsSubSchema = z.object({
  railway: z.string().optional(),
  busStand: z.string().optional(),
  landmark: z.string().optional(),
  byCar: z.string().optional(),
  important: z.string().optional(),
  helpText: z.string().optional(),
});

export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  slug: z.string().optional(),
  cityId: z.string().min(1, "Destination city is required"),
  badge: z.string().optional(),
  category: z
    .enum(["hotel", "homestay", "resort", "hostel", "deluxe", "suite", "standard"])
    .default("homestay"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).default([]),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  whatsapp: z.string().optional(),
  mapSrc: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  directions: directionsSubSchema.optional(),
  hotelCode: z.string().optional(),
  bookingEngineUrl: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
  order: z.number().default(0),
});

export const updatePropertySchema = propertySchema.partial();

// ---------------------------------------------------------------------------
// Room
// ---------------------------------------------------------------------------

export const roomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  propertyId: z.string().optional(),
  cityId: z.string().optional(),
  category: z
    .enum(["deluxe", "suite", "standard", "premium", "dormitory"])
    .default("deluxe"),
  images: z.array(z.string()).default([]),
  link: z.string().optional(),
  roomCode: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  pricing: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  price: z.union([z.string(), z.number()]).optional(),
  occupancy: z.string().optional(),
  cta: ctaSubSchema.optional(),
  seo: seoSubSchema.optional(),
  featured: z.boolean().default(false),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
  badge: z.string().optional(),
  additionalInfo: z.string().optional(),
  order: z.number().default(0),
});

export const updateRoomSchema = roomSchema.partial();

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export const gallerySchema = z.object({
  src: z.string().min(1, "Image source is required"),
  alt: z.string().min(1, "Alt text is required"),
  caption: z.string().optional(),
  category: z.string().default("general"),
  tags: z.array(z.string()).default([]),
  city: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const updateGallerySchema = gallerySchema.partial();

// ---------------------------------------------------------------------------
// Amenity
// ---------------------------------------------------------------------------

export const amenitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  description: z.string().optional(),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});

export const updateAmenitySchema = amenitySchema.partial();

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

const sectionSubSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  content: z.string().min(1, "Section content is required"),
  image: z.string().optional(),
  order: z.number().default(0),
});

export const aboutSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subheading: z.string().optional(),
  title: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  sections: z.array(sectionSubSchema).default([]),
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  banner: z.string().optional(),
  cta: ctaSubSchema.optional(),
  seo: seoSubSchema.optional(),
});

export const updateAboutSchema = aboutSchema.partial();

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const socialLinkSubSchema = z.object({
  label: z.string(),
  url: z.string(),
  iconName: z.string().default(""),
  bgColor: z.string().default("#333333"),
  iconImageUrl: z.string().optional(),
  visible: z.boolean().default(true),
});

const locationSubSchema = z.object({
  city: z.string(),
  address: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const footerSchema = z.object({
  tagline: z.string().optional(),
  socialLinks: z.array(socialLinkSubSchema).default([]),
  copyright: z.string().optional(),
  locations: z.array(locationSubSchema).default([]),
});

export const updateFooterSchema = footerSchema.partial();

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

const formSettingsSubSchema = z.object({
  enabled: z.boolean().default(true),
  recipientEmail: z.string().optional(),
  successMessage: z.string().optional(),
});

export const contactSchema = z.object({
  heading: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  supportTiming: z.string().optional(),
  enquiryInfo: z.string().optional(),
  mapEmbed: z.string().optional(),
  whatsapp: z.string().optional(),
  cta: ctaSubSchema.optional(),
  formSettings: formSettingsSubSchema.optional(),
});

export const updateContactSchema = contactSchema.partial();

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export const seoSchema = z.object({
  page: z.string().min(1, "Page key is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  ogImage: z.string().optional(),
  jsonLd: z.string().optional(),
  robots: z.string().optional(),
  canonical: z.string().optional(),
});

export const updateSeoSchema = seoSchema.partial();

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.enum(["Reservations", "Amenities", "Dining", "Policies"]),
  status: z.enum(["active", "inactive"]).default("active"),
  displayOrder: z.number().default(0),
});

export const updateFaqSchema = faqSchema.partial();

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export const blogSchema = z.object({
  title:            z.string().min(1, "Title is required"),
  slug:             z.string().optional(),
  category:         z.string().min(1, "Category is required"),
  excerpt:          z.string().optional().default(""),
  content:          z.string().optional().default(""),
  image:            z.string().optional().default(""),
  additionalImages: z.array(z.string()).default([]),
  readTime:         z.string().optional().default(""),
  date:             z.string().optional().default(""),
  publishedAt:      z.coerce.date().optional(),
  featured:         z.boolean().default(false),
  status:           z.enum(["draft", "published"]).default("draft"),
  author:           z.string().optional(),
  tags:             z.array(z.string()).default([]),
  seo:              seoSubSchema.optional(),
  order:            z.number().default(0),
});

export const updateBlogSchema = blogSchema.partial();

// ---------------------------------------------------------------------------
// Kanban
// ---------------------------------------------------------------------------

export const kanbanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  column: z
    .enum(["todo", "in-progress", "review", "completed"])
    .default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  tags: z.array(z.string()).default([]),
  assignee: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  order: z.number().default(0),
});

export const updateKanbanSchema = kanbanSchema.partial();
