import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import CityModel from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import { locations as staticLocations } from "@/lib/data";
import ContactContent from "./_content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export interface HotelContactItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  mapSrc: string;
}

export interface LocationItem {
  _id: string;
  id: string;
  label: string;
  hotels: HotelContactItem[];
  address: string;
  phone: string;
  email: string;
  mapSrc: string;
}

async function getLocations(): Promise<LocationItem[]> {
  try {
    await connectDB();

    // Fetch active properties ordered by createdAt so existing hotels appear first
    const activeProps = await Property.find({ status: { $ne: "inactive" } })
      .sort({ order: 1, createdAt: 1 })
      .select("name slug city address phone email mapSrc order createdAt")
      .lean();

    const activeCityIds = new Set(activeProps.map((p) => String(p.city)));

    const activeRooms = await Room.find({ status: { $ne: "inactive" } }).select("city").lean();
    for (const r of activeRooms) {
      if (r.city) activeCityIds.add(String(r.city));
    }

    const cities = await CityModel.find({ active: { $ne: false } })
      .sort({ order: 1, createdAt: 1 })
      .select("name slug label address phone email mapSrc order")
      .lean();

    const mapped: LocationItem[] = cities
      .filter((c) => {
        const idStr = String(c._id);
        return activeCityIds.has(idStr) || c.slug === "madurai" || c.slug === "chennai";
      })
      .map((c) => {
        const label = (c.label && c.label.trim()) || (c.name ? c.name.trim() : "");
        const idStr = String(c._id);

        const cityProps = activeProps.filter((p) => p.city && String(p.city) === idStr);

        let hotels: HotelContactItem[] = cityProps
          .filter((p) => Boolean(p.address || p.phone || p.email || p.mapSrc))
          .map((p) => {
            let email = (p.email ?? "").trim();
            if (!email || email.includes("sadhu_burlington") || email.includes("hostelsparrow")) {
              email = (c.email ?? "").trim() || "kattiladmin@gmail.com";
            }

            return {
              id: String(p._id),
              name: p.name || label,
              address: (p.address ?? "").trim() || (c.address ?? "").trim(),
              phone: (p.phone ?? "").trim() || (c.phone ?? "").trim(),
              email,
              mapSrc: (p.mapSrc ?? "").trim() || (c.mapSrc ?? "").trim(),
            };
          });

        // Fallback to city document contact info if no properties have contact details
        if (hotels.length === 0 && (c.address || c.phone || c.email || c.mapSrc)) {
          hotels = [
            {
              id: idStr,
              name: label,
              address: (c.address ?? "").trim(),
              phone: (c.phone ?? "").trim(),
              email: (c.email ?? "").trim() || "kattiladmin@gmail.com",
              mapSrc: (c.mapSrc ?? "").trim(),
            },
          ];
        }

        const primary = hotels[0];

        return {
          _id: idStr,
          id: c.slug,
          label,
          hotels,
          address: primary?.address ?? c.address ?? "",
          phone: primary?.phone ?? c.phone ?? "",
          email: primary?.email ?? c.email ?? "",
          mapSrc: primary?.mapSrc ?? c.mapSrc ?? "",
        };
      })
      .filter((loc) => Boolean(loc.label && loc.hotels.length > 0));

    if (mapped.length > 0) return mapped;
  } catch (error) {
    console.error("[getLocations] Error fetching contact locations:", error);
  }

  return staticLocations.map((l) => ({
    _id: l.id,
    id: l.id,
    label: l.label,
    hotels: [
      {
        id: l.id,
        name: l.label,
        address: l.address,
        phone: l.phone,
        email: l.email,
        mapSrc: l.mapSrc,
      },
    ],
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
