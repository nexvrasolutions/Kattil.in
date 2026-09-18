import { connectDB } from "@/lib/db/mongodb";
import Footer from "@/lib/models/Footer";
import type { IFooter } from "@/lib/models/Footer";

// Static fallback used while DB loads or if no footer document exists yet
const STATIC_FALLBACK = {
  logo: "/assets/logo.png",
  headline: "Experience luxury hospitality with premium comfort, elegant spaces, and world-class service designed for unforgettable stays.",
  description: "",
  tagline: "The Homely Reset",
  copyright: `© ${new Date().getFullYear()} Kattil. All Rights Reserved.`,
  footerLinks: [
    {
      section: "NAVIGATION",
      order: 0,
      links: [
        { label: "Home", href: "/", newTab: false, order: 0 },
        { label: "About Us", href: "/about-us", newTab: false, order: 1 },
        { label: "Rooms", href: "/rooms", newTab: false, order: 2 },
        { label: "Gallery", href: "/gallery", newTab: false, order: 3 },
        { label: "Blog", href: "/blog", newTab: false, order: 4 },
        { label: "Contact", href: "/contact-us", newTab: false, order: 5 },
      ],
    },
    {
      section: "LOCATIONS",
      order: 1,
      links: [
        { label: "Chennai", href: "/chennai", newTab: false, order: 0 },
        { label: "Kaniyakumari", href: "/kaniyakumari", newTab: false, order: 1 },
        { label: "Coimbatore", href: "/coimbatore", newTab: false, order: 2 },
        { label: "Madurai", href: "/madurai", newTab: false, order: 3 },
      ],
    },
    {
      section: "LEGAL",
      order: 2,
      links: [
        { label: "Privacy Policy", href: "/privacy-policy", newTab: false, order: 0 },
        { label: "Refund Policy", href: "/refund-policy", newTab: false, order: 1 },
        { label: "Terms & Conditions", href: "/terms-conditions", newTab: false, order: 2 },
        { label: "FAQs", href: "/faqs", newTab: false, order: 3 },
      ],
    },
  ],
  socialLinks: [
    {
      label: "Instagram", url: "https://www.instagram.com/kattilthehome",
      iconName: "instagram", iconImageUrl: "", bgColor: "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)", visible: true,
    },
  ],
  locations: [
    {
      city: "Madurai",
      address: "2nd St, Park Town, Bama Nagar, Madurai, Tamil Nadu 625017, India",
      phone: "+91 7358127921",
      email: "sadhu_burlington@live.com",
    },
  ],
  sidebarIcons: [
    {
      label: "WhatsApp", tooltip: "Chat on WhatsApp", iconName: "whatsapp", iconUrl: "",
      url: "", bgColor: "#25D366", iconColor: "#ffffff",
      type: "multi", pulse: true, order: 0, visible: true,
      locations: [
        { label: "Madurai", url: "https://wa.me/917358127921" },
        { label: "Chennai", url: "https://wa.me/916385197921" },
        { label: "Coimbatore", url: "https://wa.me/917448749779" },
      ],
    },
    {
      label: "Instagram", tooltip: "Follow on Instagram", iconName: "instagram", iconUrl: "",
      url: "https://www.instagram.com/kattilthehome",
      bgColor: "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)", iconColor: "#ffffff",
      type: "link", pulse: false, order: 1, visible: true, locations: [],
    },
    {
      label: "Google Maps", tooltip: "Find us on Maps", iconName: "googlemaps", iconUrl: "",
      url: "", bgColor: "#ffffff", iconColor: "#4285F4",
      type: "multi", pulse: false, order: 2, visible: true,
      locations: [
        { label: "Madurai", url: "https://maps.app.goo.gl/2wWHgndMue4Lnkzw8" },
        { label: "Chennai", url: "https://maps.app.goo.gl/qNiPXnskwA6fQv8a8" },
        { label: "Coimbatore", url: "https://maps.app.goo.gl/RaceCourseCoimbatore" },
      ],
    },
  ],
};

export async function GET() {
  try {
    await connectDB();
    const raw = await Footer.findOne().lean() as Partial<IFooter> | null;
    const data = raw ?? STATIC_FALLBACK;
    return Response.json({ success: true, data });
  } catch {
    // Never crash the public site due to a DB failure — return static fallback
    return Response.json({ success: true, data: STATIC_FALLBACK });
  }
}
