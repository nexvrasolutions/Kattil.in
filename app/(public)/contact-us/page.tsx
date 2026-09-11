import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import CityModel from "@/lib/models/City";
import ContactContent from "./_content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Kattil. Find us in Chennai and Madurai. Call +91 74487 49779 or email us.",
  alternates: { canonical: `${SITE_URL}/contact-us` },
  openGraph: {
    title: "Contact Kattil — Hotel in Chennai & Madurai",
    description: "Reach our teams in Chennai and Madurai. Book, inquire, or connect with us directly.",
    url: `${SITE_URL}/contact-us`,
  },
};

export interface LocationItem {
  _id: string;
  id: string;
  label: string;
  address: string;
  phone: string;
  email: string;
  mapSrc: string;
}

async function getLocations(): Promise<LocationItem[]> {
  try {
    await connectDB();
    const cities = await CityModel.find({ active: true })
      .sort({ order: 1 })
      .select("name slug label address phone email mapSrc")
      .lean();

    return cities
      .map((c) => {
        const label = (c.label && c.label.trim()) || (c.name ? c.name.trim().toUpperCase() : "");
        return {
          _id: String(c._id),
          id: c.slug,
          label,
          address: c.address ?? "",
          phone: c.phone ?? "",
          email: c.email ?? "",
          mapSrc: c.mapSrc ?? "",
        };
      })
      .filter((loc) => Boolean(loc.label && (loc.address || loc.phone || loc.email || loc.mapSrc)));
  } catch {
    return [];
  }
}

export default async function ContactPage() {
  const locations = await getLocations();
  return <ContactContent locations={locations} />;
}
