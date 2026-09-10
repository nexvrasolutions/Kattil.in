import Footer from "../lib/models/Footer";

export async function seedFooter() {
  const existing = await Footer.findOne();
  if (existing) {
    // Only patch missing fields, don't overwrite admin customisations
    const updates: Record<string, unknown> = {};
    if (!existing.logo)     updates.logo     = "/assets/logo.png";
    if (!existing.headline) updates.headline = "Experience luxury hospitality with premium comfort, elegant spaces, and world-class service designed for unforgettable stays.";
    if (!existing.copyright) updates.copyright = "© 2026 Kattil. All Rights Reserved.";
    if (!existing.footerLinks?.length) {
      updates.footerLinks = [
        {
          section: "Navigation", order: 0,
          links: [
            { label: "Home",         href: "/",           newTab: false, order: 0 },
            { label: "About Us",     href: "/about-us",   newTab: false, order: 1 },
            { label: "Destinations", href: "/destinations", newTab: false, order: 2 },
            { label: "Gallery",      href: "/gallery",    newTab: false, order: 3 },
            { label: "Blog",         href: "/blog",       newTab: false, order: 4 },
            { label: "Contact",      href: "/contact-us", newTab: false, order: 5 },
          ],
        },
        {
          section: "Navigation", order: 1,
          links: [
            { label: "Home",         href: "/",           newTab: false, order: 0 },
            { label: "About Us",     href: "/about-us",   newTab: false, order: 1 },
            { label: "Destinations", href: "/destinations", newTab: false, order: 2 },
            { label: "Gallery",      href: "/gallery",    newTab: false, order: 3 },
            { label: "Blog",         href: "/blog",       newTab: false, order: 4 },
            { label: "Contact",      href: "/contact-us", newTab: false, order: 5 },
          ],
        },
        {
          section: "Legal", order: 2,
          links: [
            { label: "Privacy Policy",     href: "/privacy-policy",   newTab: false, order: 0 },
            { label: "Refund Policy",      href: "/refund-policy",    newTab: false, order: 1 },
            { label: "Terms & Conditions", href: "/terms-conditions", newTab: false, order: 2 },
            { label: "FAQs",               href: "/faqs",             newTab: false, order: 3 },
          ],
        },
      ];
    }
    if (!existing.sidebarIcons?.length) {
      updates.sidebarIcons = [
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
      ];
    }
    if (!existing.socialLinks?.length) {
      updates.socialLinks = [{
        label: "Instagram", url: "https://www.instagram.com/kattilthehome",
        iconName: "instagram", iconImageUrl: "",
        bgColor: "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)", visible: true,
      }];
    }
    if (Object.keys(updates).length) {
      await Footer.findByIdAndUpdate(existing._id, updates);
      console.log("  ↺ Footer updated with missing fields");
    } else {
      console.log("  ↺ Footer already up to date");
    }
  } else {
    await Footer.create({
      logo: "/assets/logo.png",
      headline: "Experience luxury hospitality with premium comfort, elegant spaces, and world-class service designed for unforgettable stays.",
      description: "",
      tagline: "The Homely Reset",
      copyright: "© 2026 Kattil. All Rights Reserved.",
      footerLinks: [
        {
          section: "Navigation", order: 0,
          links: [
            { label: "Home",         href: "/",           newTab: false, order: 0 },
            { label: "About Us",     href: "/about-us",   newTab: false, order: 1 },
            { label: "Destinations", href: "/destinations", newTab: false, order: 2 },
            { label: "Gallery",      href: "/gallery",    newTab: false, order: 3 },
            { label: "Blog",         href: "/blog",       newTab: false, order: 4 },
            { label: "Contact",      href: "/contact-us", newTab: false, order: 5 },
          ],
        },
        {
          section: "Navigation", order: 1,
          links: [
            { label: "Home",         href: "/",           newTab: false, order: 0 },
            { label: "About Us",     href: "/about-us",   newTab: false, order: 1 },
            { label: "Destinations", href: "/destinations", newTab: false, order: 2 },
            { label: "Gallery",      href: "/gallery",    newTab: false, order: 3 },
            { label: "Blog",         href: "/blog",       newTab: false, order: 4 },
            { label: "Contact",      href: "/contact-us", newTab: false, order: 5 },
          ],
        },
        {
          section: "Legal", order: 2,
          links: [
            { label: "Privacy Policy",     href: "/privacy-policy",   newTab: false, order: 0 },
            { label: "Refund Policy",      href: "/refund-policy",    newTab: false, order: 1 },
            { label: "Terms & Conditions", href: "/terms-conditions", newTab: false, order: 2 },
            { label: "FAQs",               href: "/faqs",             newTab: false, order: 3 },
          ],
        },
      ],
      socialLinks: [{
        label: "Instagram", url: "https://www.instagram.com/kattilthehome",
        iconName: "instagram", iconImageUrl: "",
        bgColor: "linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)", visible: true,
      }],
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
      locations: [],
    });
    console.log("  ✓ Footer created with defaults");
  }
}
