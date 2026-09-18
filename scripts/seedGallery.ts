import Gallery from "../lib/models/Gallery";
import City from "../lib/models/City";

export async function seedGallery() {
  await Gallery.deleteMany({});

  const madurai = await City.findOne({ slug: "madurai" });
  const chennai = await City.findOne({ slug: "chennai" });
  const kaniyakumari = await City.findOne({ slug: { $in: ["kaniyakumari", "kanyakumari"] } });

  const images = [
    // ── Madurai ───────────────────────────────────────────────
    {
      src: "/assets/madurai-gallery/image-1.jpeg",
      alt: "Private room with carved wooden bed",
      category: "Rooms", city: madurai?._id, featured: true,  order: 0,
    },
    {
      src: "/assets/madurai-gallery/image-2.jpeg",
      alt: "In-room AC unit",
      category: "Rooms", city: madurai?._id, featured: false, order: 1,
    },
    {
      src: "/assets/madurai-gallery/image-3.jpeg",
      alt: "Private room with wooden bed and curtains",
      category: "Rooms", city: madurai?._id, featured: false, order: 2,
    },
    {
      src: "/assets/madurai-gallery/image-4.jpeg",
      alt: "Bathroom with white marble tiles",
      category: "Rooms", city: madurai?._id, featured: false, order: 3,
    },
    {
      src: "/assets/madurai-gallery/image-5.jpeg",
      alt: "Lit building entrance at evening",
      category: "Exterior", city: madurai?._id, featured: true, order: 4,
    },
    {
      src: "/assets/madurai-gallery/image-6.jpeg",
      alt: "Guests arriving at the property",
      category: "Outdoor", city: madurai?._id, featured: false, order: 5,
    },
    {
      src: "/assets/madurai-gallery/image-7.jpeg",
      alt: "Building exterior at dusk",
      category: "Exterior", city: madurai?._id, featured: false, order: 6,
    },
    {
      src: "/assets/madurai-gallery/image-8.jpeg",
      alt: "Dormitory room with bunk beds",
      category: "Rooms", city: madurai?._id, featured: false, order: 7,
    },
    {
      src: "/assets/madurai-gallery/image-9.jpeg",
      alt: "Private room with wooden furniture",
      category: "Rooms", city: madurai?._id, featured: false, order: 8,
    },
    // ── Chennai ───────────────────────────────────────────────
    {
      src: "/assets/chennai-gallery/image-1.jpeg",
      alt: "Dormitory room with bunk beds",
      category: "Rooms", city: chennai?._id, featured: true,  order: 9,
    },
    {
      src: "/assets/chennai-gallery/image-2.jpeg",
      alt: "Bathroom with marble tiles",
      category: "Rooms", city: chennai?._id, featured: false, order: 10,
    },
    {
      src: "/assets/chennai-gallery/image-3.jpeg",
      alt: "Building exterior at night",
      category: "Exterior", city: chennai?._id, featured: true, order: 11,
    },
    {
      src: "/assets/chennai-gallery/image-4.jpeg",
      alt: "Dormitory room overview",
      category: "Rooms", city: chennai?._id, featured: false, order: 12,
    },
    // ── Kaniyakumari ──────────────────────────────────────────
    {
      src: "/assets/ac-double-room.webp",
      alt: "Deluxe AC Double Room — Tranquil Coastal Stay",
      caption: "Deluxe AC Double Room",
      category: "Rooms", city: kaniyakumari?._id, featured: true, order: 13,
    },
    {
      src: "/assets/six-bed-dormitory.webp",
      alt: "Six-Bed Community Dormitory — The Sparrow",
      caption: "Spacious Six-Bed Dormitory",
      category: "Rooms", city: kaniyakumari?._id, featured: false, order: 15,
    },
    {
      src: "/assets/non-ac-double-room.webp",
      alt: "Cozy Standard Room — The Sparrow Kaniyakumari",
      caption: "Cozy Standard Double Room",
      category: "Rooms", city: kaniyakumari?._id, featured: false, order: 16,
    },
    {
      src: "/assets/deluxe-garden-suite.webp",
      alt: "Deluxe Ocean & Garden Suite",
      caption: "Deluxe Suite with Private Balcony",
      category: "Rooms", city: kaniyakumari?._id, featured: false, order: 17,
    },
    {
      src: "/images/gallery/sunny-balcony-guest.jpg",
      alt: "Sunlit Resort Balcony with Coastal Views",
      caption: "Sunlit Coastal Balcony",
      category: "Resort", city: kaniyakumari?._id, featured: false, order: 18,
    },
    {
      src: "/images/home/ocean-sunset.png",
      alt: "Iconic Sunset Point — Kaniyakumari",
      caption: "Sunset Point Ocean Horizons",
      category: "Experience", city: kaniyakumari?._id, featured: true, order: 19,
    },
    {
      src: "/images/home/dining-community.png",
      alt: "Authentic Coastal Dining & Cuisine",
      caption: "Artisan Coastal Flavors & Dining",
      category: "Dining", city: kaniyakumari?._id, featured: false, order: 20,
    },
    {
      src: "/images/gallery/bikers-adventure.jpg",
      alt: "Coastal Explorers & Southernmost Tip Tours",
      caption: "Coastal Expeditions & Exploration",
      category: "Experience", city: kaniyakumari?._id, featured: false, order: 21,
    },
    {
      src: "/images/gallery/community-group.jpg",
      alt: "Lively Lounge Gatherings & Community",
      caption: "Common Lounge Gatherings",
      category: "Experience", city: kaniyakumari?._id, featured: false, order: 22,
    },
    {
      src: "/assets/about-us-1.webp",
      alt: "Tranquil Courtyard & Coastal Breeze",
      caption: "Tranquil Courtyard & Grounds",
      category: "Outdoor", city: kaniyakumari?._id, featured: false, order: 23,
    },
    {
      src: "/assets/kattil-room-hero.webp",
      alt: "Master Bedroom Suite — The Sparrow",
      caption: "Handcrafted Luxury Bedroom",
      category: "Rooms", city: kaniyakumari?._id, featured: false, order: 24,
    },
  ];

  await Gallery.insertMany(images);
  console.log(`Gallery: ${images.length} images created (9 Madurai, 4 Chennai, 12 Kaniyakumari)`);
}
