import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Faq from "@/lib/models/Faq";
import { apiSuccess, apiError, handleApiError, getPaginationParams } from "@/lib/utils/api";
import { faqSchema, isPlaceholderFaqText } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = getPaginationParams(searchParams);

    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const status = searchParams.get("status") ?? "";

    const filter: Record<string, unknown> = {};
    if (search) filter.question = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const [faqs, total] = await Promise.all([
      Faq.find(filter).sort({ displayOrder: 1, createdAt: 1 }).skip(skip).limit(limit),
      Faq.countDocuments(filter),
    ]);

    return apiSuccess({ faqs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[GET /api/admin/faqs]", error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    // Server-side publish gate: placeholder/test content must never go live,
    // regardless of what the admin UI sends.
    if (parsed.data.status === "active") {
      if (isPlaceholderFaqText(parsed.data.question) || isPlaceholderFaqText(parsed.data.answer)) {
        return apiError(
          "This FAQ looks like placeholder/test content and cannot be published. Please provide real question and answer text.",
          400
        );
      }
    }

    const faq = await Faq.create(parsed.data);
    return apiSuccess(faq, 201);
  } catch (error) {
    console.error("[POST /api/admin/faqs]", error);
    return handleApiError(error);
  }
}
