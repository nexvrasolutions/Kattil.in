import { Suspense } from "react";
import Footer, { type FooterProps } from "@/components/layout/Footer";
import SocialSidebar, { type SidebarIconData } from "@/components/ui/SocialSidebar";
import PageTransition from "@/components/PageTransition";
import { connectDB } from "@/lib/db/mongodb";
import FooterModel from "@/lib/models/Footer";
import { locations as staticLocations } from "@/lib/data";

// Map lib/data locations to FooterLocation shape — used as fallback when DB has none
const LOCATIONS_FALLBACK: FooterProps["locations"] = staticLocations.map((l) => ({
  city: l.label,
  address: l.address,
  phone: l.phone,
  email: l.email,
}));

// Static fallback data — matches the seeded defaults
const FOOTER_FALLBACK: FooterProps = {
  logo: "/assets/logo.png",
  headline: "Experience luxury hospitality with premium comfort, elegant spaces, and world-class service designed for unforgettable stays.",
  description: "",
  copyright: `© ${new Date().getFullYear()} Kattil. All Rights Reserved.`,
  footerLinks: [
    {
      section: "NAVIGATION", order: 0,
      links: [
        { label: "Home", href: "/", newTab: false, order: 0 },
        { label: "About Us", href: "/about-us", newTab: false, order: 1 },
        { label: "Destinations", href: "/destinations", newTab: false, order: 2 },
        { label: "Gallery", href: "/gallery", newTab: false, order: 3 },
        { label: "Blog", href: "/blog", newTab: false, order: 4 },
        { label: "Contact", href: "/contact-us", newTab: false, order: 5 },
      ],
    },
    {
      section: "LOCATIONS", order: 1,
      links: [
        { label: "Chennai", href: "/chennai", newTab: false, order: 0 },
        { label: "Kaniyakumari", href: "/kaniyakumari", newTab: false, order: 1 },
        { label: "Coimbatore", href: "/coimbatore", newTab: false, order: 2 },
        { label: "Madurai", href: "/madurai", newTab: false, order: 3 },
      ],
    },
    {
      section: "LEGAL", order: 2,
      links: [
        { label: "Privacy Policy", href: "/privacy-policy", newTab: false, order: 0 },
        { label: "Refund Policy", href: "/refund-policy", newTab: false, order: 1 },
        { label: "Terms & Conditions", href: "/terms-conditions", newTab: false, order: 2 },
        { label: "FAQs", href: "/faqs", newTab: false, order: 3 },
      ],
    },
  ],
  socialLinks: [
    { label: "Instagram", url: "https://www.instagram.com/kattilthehome", iconName: "instagram", iconImageUrl: "", bgColor: "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)", visible: true },
  ],
  locations: [
    {
      city: "Madurai",
      address: "2nd St, Park Town, Bama Nagar, Madurai, Tamil Nadu 625017, India",
      phone: "+91 7358127921",
      email: "sadhu_burlington@live.com",
    },
  ],
};

const SIDEBAR_FALLBACK: SidebarIconData[] = [
  { label: "WhatsApp", tooltip: "Chat on WhatsApp", iconName: "whatsapp", iconUrl: "", url: "https://wa.me/917358127921", bgColor: "#25D366", iconColor: "#ffffff", type: "link", pulse: true, order: 0, visible: true, locations: [] },
  { label: "Instagram", tooltip: "Follow on Instagram", iconName: "instagram", iconUrl: "", url: "https://www.instagram.com/kattilthehome", bgColor: "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)", iconColor: "#ffffff", type: "link", pulse: false, order: 1, visible: true, locations: [] },
  { label: "Google Maps", tooltip: "Find us on Maps", iconName: "googlemaps", iconUrl: "", url: "", bgColor: "#ffffff", iconColor: "#4285F4", type: "multi", pulse: false, order: 2, visible: true, locations: [{ label: "Chennai", url: "https://maps.app.goo.gl/qNiPXnskwA6fQv8a8" }, { label: "Kaniyakumari", url: "https://maps.google.com/maps?q=Kaniyakumari%2C+Tamil+Nadu+629702" }, { label: "Coimbatore", url: "https://maps.app.goo.gl/RaceCourseCoimbatore" }, { label: "Madurai", url: "https://maps.app.goo.gl/2wWHgndMue4Lnkzw8" }] },
];

async function getFooterData(): Promise<{ footer: FooterProps; sidebar: SidebarIconData[] }> {
  try {
    await connectDB();
    const raw = await FooterModel.findOne()
      .select("logo headline description copyright footerLinks socialLinks sidebarIcons locations")
      .lean() as Record<string, unknown> | null;

    if (!raw) return { footer: FOOTER_FALLBACK, sidebar: SIDEBAR_FALLBACK };

    const parsed = JSON.parse(JSON.stringify(raw));

    let footerLinks: FooterProps["footerLinks"] =
      (parsed.footerLinks as FooterProps["footerLinks"]) ?? FOOTER_FALLBACK.footerLinks;

    // Ensure LOCATIONS section has all active locations if empty or missing, and links point to destination pages
    if (Array.isArray(footerLinks) && footerLinks.length >= 2) {
      const locIdx = footerLinks.findIndex(
        (f) => f.section?.toUpperCase() === "LOCATIONS" || f.section?.toUpperCase() === "DESTINATIONS"
      );

      if (locIdx >= 0) {
        if (!footerLinks[locIdx]?.links?.length || footerLinks[locIdx]?.links?.length < 3) {
          footerLinks[locIdx] = {
            section: "LOCATIONS",
            order: 1,
            links: [
              { label: "Chennai", href: "/chennai", newTab: false, order: 0 },
              { label: "Kaniyakumari", href: "/kaniyakumari", newTab: false, order: 1 },
              { label: "Coimbatore", href: "/coimbatore", newTab: false, order: 2 },
              { label: "Madurai", href: "/madurai", newTab: false, order: 3 },
            ],
          };
        } else {
          // Normalize any legacy "/properties/the-sparrow" link to "/kaniyakumari"
          for (const link of footerLinks[locIdx].links) {
            if (
              link.label.toLowerCase().includes("kanya") ||
              link.label.toLowerCase().includes("kaniya") ||
              link.href === "/properties/the-sparrow"
            ) {
              link.href = "/kaniyakumari";
            }
          }
        }

        // Persist update in DB
        FooterModel.updateOne(
          { _id: parsed._id },
          { $set: { footerLinks } }
        ).catch(() => {});
      }
    }

    const footer: FooterProps = {
      logo: (parsed.logo as string) || FOOTER_FALLBACK.logo,
      headline: (parsed.headline as string) || FOOTER_FALLBACK.headline,
      description: (parsed.description as string) || "",
      copyright: (parsed.copyright as string) || FOOTER_FALLBACK.copyright,
      footerLinks,
      socialLinks: (parsed.socialLinks as FooterProps["socialLinks"]) ?? FOOTER_FALLBACK.socialLinks,
      locations: (parsed.locations as FooterProps["locations"])?.length
        ? (parsed.locations as FooterProps["locations"])
        : LOCATIONS_FALLBACK,
    };

    let sidebar: SidebarIconData[] =
      (parsed.sidebarIcons as SidebarIconData[] | undefined) ?? SIDEBAR_FALLBACK;

    // Normalize WhatsApp icon to single link
    let sidebarUpdated = false;
    sidebar = sidebar.map((ic) => {
      if (ic.iconName?.toLowerCase() === "whatsapp" || ic.label?.toLowerCase() === "whatsapp") {
        if (ic.type !== "link" || ic.url !== "https://wa.me/917358127921" || (ic.locations && ic.locations.length > 0)) {
          sidebarUpdated = true;
          return {
            ...ic,
            type: "link" as const,
            url: "https://wa.me/917358127921",
            locations: [],
          };
        }
      }
      return ic;
    });

    if (sidebarUpdated && parsed._id) {
      FooterModel.updateOne(
        { _id: parsed._id },
        { $set: { sidebarIcons: sidebar } }
      ).catch(() => {});
    }

    return { footer, sidebar };
  } catch {
    return { footer: FOOTER_FALLBACK, sidebar: SIDEBAR_FALLBACK };
  }
}

// Fixed-position sidebar + footer both come from the same footer document, and
// neither blocks the page's own content: they're rendered behind their own
// Suspense boundary so `<main>{children}</main>` can stream immediately instead
// of waiting on this fetch on every navigation.
async function SiteChrome() {
  const { footer, sidebar } = await getFooterData();

  return (
    <>
      <SocialSidebar icons={sidebar} />
      <Footer {...footer} />
    </>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 flex flex-col">{children}</main>
      <Suspense fallback={null}>
        <SiteChrome />
      </Suspense>
    </>
  );
}
