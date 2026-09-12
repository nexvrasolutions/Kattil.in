export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Rooms", href: "/rooms" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
];

export const amenities = [
  {
    id: 1,
    icon: "infinity-pool",
    label: "Infinity Pool",
  },
  {
    id: 2,
    icon: "wellness-spa",
    label: "Wellness Spa",
  },
  {
    id: 3,
    icon: "fine-dining",
    label: "Fine Dining",
  },
  {
    id: 4,
    icon: "meeting-lounge",
    label: "Meeting Lounge",
  },
  {
    id: 5,
    icon: "wifi",
    label: "High-Speed Wi-Fi",
  },
  {
    id: 6,
    icon: "butler",
    label: "24/7 Butler",
  },
];

export const rooms = [
  {
    id: 1,
    name: "6 Bed Mixed Dormitory",
    slug: "6-bed-mixed-dormitory",
    size: "45",
    feature: "SHARED DORM",
    capacity: 6,
    price: 682.50 ,
    image: "/assets/six-bed-dormitory.webp",
    description:
      "A comfortable shared dormitory with 6 beds, individual pod cooling, secure lockers, and high-speed Wi-Fi.",
  },
  {
    id: 2,
    name: "AC Double Room",
    slug: "ac-double-room",
    size: "60",
    feature: "PRIVATE ROOM",
    capacity: 2,
    price: 2000,
    image: "/assets/ac-double-room.webp",
    description:
      "A private air-conditioned double room with premium amenities and a restful, quiet atmosphere.",
  },
  {
    id: 3,
    name: "Non-AC Double Room",
    slug: "non-ac-double-room",
    size: "38",
    feature: "PRIVATE ROOM",
    capacity: 2,
    price: 1260.00,
    image: "/assets/non-ac-double-room.webp",
    description:
      "A well-appointed private double room — comfortable, clean, and great value for your stay.",
  },
];

export const galleryCategories = [
  "All",
  "Rooms",
  "Dining",
  "Pool & Spa",
  "Gardens",
  "Events",
];

export const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    alt: "Luxury living room with floor to ceiling windows",
    category: "Rooms",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
    alt: "Infinity pool overlooking the ocean",
    category: "Pool & Spa",
    span: "",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1565098772267-60af42b81ef2?w=800&q=80",
    alt: "Tranquil spa room",
    category: "Pool & Spa",
    span: "",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&q=80",
    alt: "Elegant hotel bedroom",
    category: "Rooms",
    span: "",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    alt: "Fine dining table setting",
    category: "Dining",
    span: "",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80",
    alt: "Garden event setup at night",
    category: "Events",
    span: "col-span-2",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80",
    alt: "Minimalist hotel corridor",
    category: "Rooms",
    span: "",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80",
    alt: "Hotel garden walkway",
    category: "Gardens",
    span: "",
  },
];

export const blogPosts = [
  {
    id: 1,
    slug: "architecture-of-silence",
    category: "TRAVEL GUIDE",
    readTime: "12 Min Read",
    date: "April 2025",
    title: "The Architecture of Silence: Designing Lumière",
    excerpt:
      "How thoughtful spatial design can transform a room into a sanctuary — our design philosophy explored.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
    featured: true,
    content: `
      <p>True architecture is not merely the arrangement of walls and windows — it is the careful curation of silence, of the space between things, of what is left unsaid in stone and light.</p>
      <p>At Kattil, we believe that true luxury is not about opulent surroundings, but about creating meaningful experiences that resonate long after your stay.</p>
      <h2>Traditional construction doesn't just define the silhouette. It shapes the experience.</h2>
      <p>Our commitment to excellence is reflected in every detail — from the carefully curated rooms to the personalized service provided by our dedicated team. We source the finest materials, partner with world-renowned chefs, and invest in continuous training to ensure our staff delivers nothing short of perfection.</p>
      <h2>The Geometry of Light</h2>
      <p>Light, when handled with precision, becomes both architect and artist. In our suites, we've positioned windows not merely for view but for the way afternoon sun carves shadows across the hand-plastered walls, creating a living artwork that changes hour by hour.</p>
      <p>Each room orientation was studied across different seasons and times of day. The morning light that enters the Garden Suite at precisely 7:14am was not an accident — it was a six-month conversation between our designers and the landscape itself.</p>
      <h2>Creating Slow Transitions</h2>
      <p>From the moment you step through our entrance, we want time to decelerate. The lobby is deliberately unhurried — there is no check-in counter in the traditional sense, only a quiet conversation over local tea while your details are handled seamlessly in the background.</p>
    `,
  },
  {
    id: 2,
    slug: "rituals-of-the-self-morning-spa",
    category: "WELLNESS",
    readTime: "8 Min Read",
    date: "March 2025",
    title: "Rituals of the Self: Morning at the Spa",
    excerpt:
      "A guide to the ancient wellness traditions that inform our spa programme.",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    featured: false,
    content: "",
  },
  {
    id: 3,
    slug: "art-of-local-cuisine",
    category: "DINING",
    readTime: "6 Min Read",
    date: "March 2025",
    title: "The Art of Local Cuisine",
    excerpt:
      "How our culinary team transforms Tamil Nadu's seasonal harvest into an art form.",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
    featured: false,
    content: "",
  },
  {
    id: 4,
    slug: "the-slow-travel-manifesto",
    category: "TRAVEL",
    readTime: "10 Min Read",
    date: "February 2025",
    title: "The Slow Travel Manifesto",
    excerpt:
      "In defense of staying longer, exploring deeper, and resisting the itinerary.",
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
    featured: false,
    content: "",
  },
  {
    id: 5,
    slug: "gardens-at-dusk",
    category: "NATURE",
    readTime: "5 Min Read",
    date: "February 2025",
    title: "Gardens at Dusk",
    excerpt:
      "An evening walk through Kattil's gardens reveals a world lit by fireflies and scented blooms.",
    image:
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80",
    featured: false,
    content: "",
  },
  {
    id: 6,
    slug: "linen-and-light",
    category: "INTERIORS",
    readTime: "7 Min Read",
    date: "January 2025",
    title: "Linen and Light",
    excerpt:
      "The textile story behind Kattil's rooms — sourced from weavers in the Western Ghats.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    featured: false,
    content: "",
  },
];

export const footerNav = {
  navigation: [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about" },
    { label: "Room", href: "/rooms" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact-us" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
    { label: "FAQs", href: "/faqs" },
  ],
};

export const locations = [
  {
    id: "madurai",
    label: "MADURAI",
    address: "2nd St, Park Town, Bama Nagar, Madurai, Tamil Nadu 625017, India",
    phone: "+91 7358127921",
    email: "sadhu_burlington@live.com",
    mapSrc:
      "https://maps.google.com/maps?q=2nd+St%2C+Park+Town%2C+Bama+Nagar%2C+Madurai%2C+Tamil+Nadu+625017%2C+India&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  {
    id: "chennai",
    label: "CHENNAI",
    address: "274, 1st Main Road, Secretariat Colony, Chennai, Thoraipakkam, Tamil Nadu 600097",
    phone: "+91 6385197921",
    email: "sadhu_burlington@live.com",
    mapSrc:
      "https://maps.google.com/maps?q=274%2C+1st+Main+Road%2C+Secretariat+Colony%2C+Thoraipakkam%2C+Chennai%2C+Tamil+Nadu+600097&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
  {
    id: "coimbatore",
    label: "COIMBATORE",
    address: "124, Race Course Road, Gopalapuram, Coimbatore, Tamil Nadu 641018",
    phone: "+91 74487 49779",
    email: "hostelsparrow@gmail.com",
    mapSrc:
      "https://maps.google.com/maps?q=Race+Course+Road%2C+Coimbatore%2C+Tamil+Nadu+641018&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  },
];

export const locationRooms = {
  chennai: [
    {
      id: "ch1",
      name: "Marina Horizon Suite",
      slug: "marina-horizon-suite",
      size: "52",
      feature: "SEA VIEW",
      capacity: 2,
      price: 15000,
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      description:
        "Floor-to-ceiling windows frame the Bay of Bengal in this contemporary suite, where the horizon becomes your living wall.",
    },
    {
      id: "ch2",
      name: "Urban Sanctuary Room",
      slug: "urban-sanctuary-room",
      size: "38",
      feature: "CITY PANORAMA",
      capacity: 2,
      price: 9500,
      image:
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      description:
        "A calm retreat above the city, designed for the modern traveller who seeks stillness in the heart of Chennai.",
    },
    {
      id: "ch3",
      name: "Coastal Heritage Suite",
      slug: "coastal-heritage-suite",
      size: "65",
      feature: "PRIVATE PLUNGE POOL",
      capacity: 3,
      price: 24000,
      image:
        "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&q=80",
      description:
        "Colonial architecture meets coastal luxury in this expansive suite with its own private plunge pool.",
    },
    {
      id: "ch4",
      name: "Executive Garden Villa",
      slug: "executive-garden-villa",
      size: "48",
      feature: "GARDEN TERRACE",
      capacity: 2,
      price: 13500,
      image:
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
      description:
        "Step onto your private garden terrace and hear the city's rhythm slow to a whisper.",
    },
  ],
  madurai: [
    {
      id: "md1",
      name: "6 bed mixed dormitory",
      slug: "6-bed-mixed-dormitory",
      size: "45",
      feature: "PRIVATE TERRACE",
      capacity: 2,
      price:  682.50,
      external_url : 'https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000001',
      image:
        "/assets/six-bed-dormitory.webp",
      description:
        "A masterclass in quiet luxury, featuring curated amenities, linen textiles, and panoramic views of our private grounds.",
    },
    {
      id: "md2",
      name: "Ac double room",
      slug: "ac-double-room",
      size: "60",
      feature: "HERITAGE BATHROOM",
      capacity: 2,
      price: 18000,
      external_url: 'https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000002',
      image:
      "/assets/ac-double-room.webp",
      description:
      "Steeped in old-world grandeur, this suite pairs antique furnishings with modern comforts for a truly regal experience.",
    },
    {
      id: "md3",
      name: "Non-Ac double room",
      slug: "non-ac-double-room",
      size: "38",
      external_url: 'https://live.ipms247.com/booking/roomwisedata.php?hid=kattil&roomtypeunkid=6154300000000000004',
      feature: "GARDEN VIEW",
      capacity: 2,
      price: 1260.00,
      image:
        "/assets/non-ac-double-room.webp",
      description:
        "Timeless design meets thoughtful utility. Perfect for the discerning traveler seeking elegance without excess.",
    },
  ],
  coimbatore: [
    {
      id: "cb1",
      name: "Deluxe AC Room",
      slug: "deluxe-ac-room",
      size: "42",
      feature: "CITY VIEW",
      capacity: 2,
      price: 1800.00,
      external_url: "https://live.ipms247.com/booking/roomwisedata.php?hid=kattilcoimbatore&roomtypeunkid=6154300000000000001",
      image: "/assets/ac-double-room.webp",
      description:
        "A serene and modern air-conditioned private room in the heart of Coimbatore, offering plush bedding and fast Wi-Fi.",
    },
    {
      id: "cb2",
      name: "6 Bed Mixed Dormitory",
      slug: "6-bed-mixed-dormitory-coimbatore",
      size: "45",
      feature: "SHARED DORM",
      capacity: 6,
      price: 699.00,
      external_url: "https://live.ipms247.com/booking/roomwisedata.php?hid=kattilcoimbatore&roomtypeunkid=6154300000000000002",
      image: "/assets/six-bed-dormitory.webp",
      description:
        "Comfortable bunk beds with individual locker, reading light, charging ports, and pod cooling in Coimbatore.",
    },
  ],
  colachel: [
    {
      id: "cl1",
      name: "Deluxe AC Beachside Room",
      slug: "deluxe-ac-beachside-room",
      size: "42",
      feature: "BEACH VIEW",
      capacity: 2,
      price: 1800.00,
      external_url: "https://live.ipms247.com/booking/book-rooms-kattilcolachel",
      image: "/assets/ac-double-room.webp",
      description:
        "A serene and comfortable air-conditioned room located along the Colachel coastline, equipped with plush bedding and modern amenities.",
    },
    {
      id: "cl2",
      name: "6 Bed Mixed Dormitory",
      slug: "6-bed-mixed-dormitory-colachel",
      size: "45",
      feature: "SHARED DORM",
      capacity: 6,
      price: 699.00,
      external_url: "https://live.ipms247.com/booking/book-rooms-kattilcolachel",
      image: "/assets/six-bed-dormitory.webp",
      description:
        "Comfortable bunk beds with individual locker, reading light, and charging ports near the Colachel coast.",
    },
  ],
};
