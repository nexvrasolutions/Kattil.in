import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import CityModel from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import { locations as staticLocations } from "@/lib/data";
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

    // Check which cities actually have active properties or rooms
    const activeProps = await Property.find({ status: { $ne: "inactive" } }).select("city").lean();
    const activeCityIds = new Set(activeProps.map((p) => String(p.city)));

    const activeRooms = await Room.find({ status: { $ne: "inactive" } }).select("city").lean();
    for (const r of activeRooms) {
      if (r.city) activeCityIds.add(String(r.city));
    }

    const cities = await CityModel.find({ active: { $ne: false } })
      .sort({ order: 1 })
      .select("name slug label address phone email mapSrc")
      .lean();

    const mapped = cities
      .filter((c) => {
        const idStr = String(c._id);
        return activeCityIds.has(idStr) || c.slug === "madurai" || c.slug === "chennai";
      })
      .map((c) => {
        const label = (c.label && c.label.trim()) || (c.name ? c.name.trim() : "");
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

    if (mapped.length > 0) return mapped;
  } catch {
    // fallback below
  }

  return staticLocations.map((l) => ({
    _id: l.id,
    id: l.id,
    label: l.label,
    address: l.address,
    phone: l.phone,
    email: l.email,
    mapSrc: l.mapSrc,
  }));
}

export default async function ContactPage() {
  const locations = await getLocations();
  return <ContactContent locations={locations} />;
}

