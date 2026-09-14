import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import City from "@/lib/models/City";
import Property from "@/lib/models/Property";
import Gallery from "@/lib/models/Gallery";
import Amenity from "@/lib/models/Amenity";
import KanbanTask from "@/lib/models/Kanban";
import Media from "@/lib/models/Media";
import Blog from "@/lib/models/Blog";
import Faq from "@/lib/models/Faq";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const [
      totalProperties,
      activeProperties,
      totalCities,
      amenitiesCount,
      galleryCount,
      mediaCount,
      blogsCount,
      publishedBlogsCount,
      faqsCount,
      kanbanTodo,
      kanbanInProgress,
      kanbanReview,
      kanbanCompleted,
      recentProperties,
      recentGallery,
      propertyCategories,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      City.countDocuments({ active: true }),
      Amenity.countDocuments({ visible: true }),
      Gallery.countDocuments(),
      Media.countDocuments(),
      Blog.countDocuments(),
      Blog.countDocuments({ status: "published" }),
      Faq.countDocuments({ status: "active" }),
      KanbanTask.countDocuments({ column: "todo" }),
      KanbanTask.countDocuments({ column: "in-progress" }),
      KanbanTask.countDocuments({ column: "review" }),
      KanbanTask.countDocuments({ column: "completed" }),
      Property.find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("city", "name")
        .select("name status city slug category badge"),
      Gallery.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("src alt category"),
      Property.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return apiSuccess({
      totalProperties,
      activeProperties,
      totalCities,
      amenitiesCount,
      galleryCount,
      mediaCount,
      blogsCount,
      publishedBlogsCount,
      faqsCount,
      kanbanStats: {
        todo: kanbanTodo,
        inProgress: kanbanInProgress,
        review: kanbanReview,
        completed: kanbanCompleted,
      },
      propertyCategories: propertyCategories.map((r: { _id: string; count: number }) => ({
        name: r._id ? r._id.charAt(0).toUpperCase() + r._id.slice(1) : "General",
        value: r.count,
      })),
      cmsModules: [
        { module: "Properties", count: activeProperties },
        { module: "Blogs", count: blogsCount },
        { module: "Gallery", count: galleryCount },
        { module: "FAQs", count: faqsCount },
        { module: "Amenities", count: amenitiesCount },
        { module: "Media", count: mediaCount },
      ],
      recentProperties,
      recentGallery,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[GET /api/admin/dashboard]", error);
    return apiError("Internal server error", 500);
  }
}
