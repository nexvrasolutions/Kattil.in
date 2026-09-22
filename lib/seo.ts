export const SITE_URL = "https://kattil.in";
export const SITE_NAME = "Kattil — The Homely Hotel";

export const DEFAULT_DESCRIPTION =
  "Experience warm hospitality at KATTIL hotels in Chennai and Madurai, Tamil Nadu. Enjoy comfortable rooms, co-working spaces, and curated stays.";

export const DEFAULT_KEYWORDS = [
  "hotel in Chennai",
  "hotel in Madurai",
  "homely hotel Tamil Nadu",
  "luxury stay Chennai",
  "boutique hotel Madurai",
  "Kattil hotel",
  "hostel Chennai",
  "hostel Madurai",
  "premium stay Tamil Nadu",
];

export const hotelJsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo.png`,
  image: `${SITE_URL}/assets/gallery.png`,
  telephone: "+917448749779",
  email: "hostelsparrow@gmail.com",
  description: DEFAULT_DESCRIPTION,
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, Credit Card, UPI",
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "J17 Poondi, No.6/29, Anna Nagar",
      addressLocality: "Madurai",
      addressRegion: "Tamil Nadu",
      postalCode: "625701",
      addressCountry: "IN",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Plot 12, Cenotaph Road, Teynampet",
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      postalCode: "600018",
      addressCountry: "IN",
    },
  ],
  hasMap: "https://maps.google.com/maps?q=Kattil+Hotel+Madurai",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Air Conditioning", value: true },
    { "@type": "LocationFeatureSpecification", name: "24-hour Front Desk", value: true },
    { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
  ],
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+917448749779",
    contactType: "reservations",
    areaServed: "IN",
    availableLanguage: ["English", "Tamil"],
  },
};
