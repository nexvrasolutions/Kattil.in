import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import AllDestinationsView, {
  DestinationItemData,
} from "@/components/section/destination/AllDestinationsView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Destinations to Discover | Kattil — Handpicked Stays & Properties",
  description:
    "Explore handpicked destinations and comfortable hotel stays across Tamil Nadu with Kattil. Find your perfect stay in Chennai, Coimbatore, Madurai, Colachel, Kanniyakumari and more.",
  keywords: [
    "Kattil destinations",
    "hotels in Tamil Nadu",
    "stays in Chennai",
    "hotels in Coimbatore",
    "hotels in Madurai",
    "hotels in Colachel",
    "hotels in Kanyakumari",
  ],
  alternates: {
    canonical: `${SITE_URL}/destinations`,
  },
  openGraph: {
    title: "Destinations to Discover | Kattil — Handpicked Stays",
    description:
      "Explore handpicked destinations and comfortable hotel stays across Tamil Nadu with Kattil.",
    url: `${SITE_URL}/destinations`,
  },
};

export default async function DestinationsPage() {
  let destinations: DestinationItemData[] = [];

  try {
    await connectDB();

    const cityFilter = {
      active: { $ne: false },
    };

    const cities = await City.find(cityFilter).sort({ order: 1, name: 1 }).lean();

    if (cities && cities.length > 0) {
      destinations = cities.map((c) => {
        let destinationLink = c.link?.trim();
        if (!destinationLink) {
          if (c.slug === "chennai") destinationLink = "/chennai";
          else if (c.slug === "coimbatore") destinationLink = "/coimbatore";
          else if (c.slug === "madurai") destinationLink = "/madurai";
          else if (c.slug === "colachel") destinationLink = "/colachel";
          else destinationLink = `/destinations/${c.slug}`;
        }

        let destinationImage = c.image?.trim() || c.banner?.trim();
        if (!destinationImage) {
          if (c.slug === "coimbatore")
            destinationImage = "/images/destinations/coimbatore.png";
          else if (c.slug === "madurai")
            destinationImage = "/images/destinations/madurai.png";
          else if (c.slug === "colachel")
            destinationImage = "/images/destinations/kanyakumari.png";
          else destinationImage = "/images/destinations/kanyakumari.png";
        }

        return {
          _id: String(c._id),
          name: c.name,
          slug: c.slug,
          image: destinationImage,
          hotelCount: c.hotelCount?.trim() || "1 hotels",
          link: destinationLink,
          order: c.order ?? 0,
        };
      });
    }
  } catch (err) {
    console.error("Error fetching destinations for page:", err);
  }

  return <AllDestinationsView destinations={destinations} />;
}
