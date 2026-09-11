import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Settings from "@/lib/models/Settings";
import Property from "@/lib/models/Property";
import Room from "@/lib/models/Room";
import City from "@/lib/models/City";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    await connectDB();

    // Ensure models are registered
    void City;
    void Property;
    void Room;

    const [settingsDoc, properties, rooms] = await Promise.all([
      Settings.findOne().select("bookingEngine").lean(),
      Property.find()
        .populate("city", "name slug")
        .select("name slug city hotelCode bookingEngineUrl status order")
        .sort({ order: 1, name: 1 })
        .lean(),
      Room.find()
        .populate("property", "name slug")
        .populate("city", "name slug")
        .select("name slug property city link roomCode category price status order")
        .sort({ order: 1, name: 1 })
        .lean(),
    ]);

    const defaultBookingEngine = {
      provider: "eZee / IPMS247",
      baseUrl: "https://live.ipms247.com/booking/book-rooms-",
      apiKey: "",
      apiSecret: "",
      defaultHotelCode: "kattil",
      globalBookingUrl: "https://live.ipms247.com/booking/book-rooms-kattil",
    };

    return apiSuccess({
      bookingEngine: (settingsDoc as any)?.bookingEngine || defaultBookingEngine,
      properties: properties || [],
      rooms: rooms || [],
    });
  } catch (error) {
    console.error("[GET /api/admin/booking-api]", error);
    return apiError("Failed to fetch booking API data", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Update Global Booking Engine Settings if provided
    if (body.bookingEngine) {
      await Settings.findOneAndUpdate(
        {},
        { $set: { bookingEngine: body.bookingEngine } },
        { upsert: true, new: true }
      );
    }

    // 2. Update specific property if propertyId is passed
    if (body.propertyId && (body.hotelCode !== undefined || body.bookingEngineUrl !== undefined)) {
      const updateData: Record<string, any> = {};
      if (body.hotelCode !== undefined) updateData.hotelCode = body.hotelCode.trim();
      if (body.bookingEngineUrl !== undefined) updateData.bookingEngineUrl = body.bookingEngineUrl.trim();

      await Property.findByIdAndUpdate(body.propertyId, { $set: updateData });
    }

    // 3. Update specific room if roomId is passed
    if (body.roomId && (body.link !== undefined || body.roomCode !== undefined)) {
      const updateData: Record<string, any> = {};
      if (body.link !== undefined) updateData.link = body.link.trim();
      if (body.roomCode !== undefined) updateData.roomCode = body.roomCode.trim();

      await Room.findByIdAndUpdate(body.roomId, { $set: updateData });
    }

    // 4. Bulk property updates if array provided
    if (Array.isArray(body.properties)) {
      const propertyUpdates = body.properties.map((p: any) =>
        Property.findByIdAndUpdate(p._id, {
          $set: {
            hotelCode: (p.hotelCode || "").trim(),
            bookingEngineUrl: (p.bookingEngineUrl || "").trim(),
          },
        })
      );
      await Promise.all(propertyUpdates);
    }

    // 5. Bulk room updates if array provided
    if (Array.isArray(body.rooms)) {
      const roomUpdates = body.rooms.map((r: any) =>
        Room.findByIdAndUpdate(r._id, {
          $set: {
            link: (r.link || "").trim(),
            roomCode: (r.roomCode || "").trim(),
          },
        })
      );
      await Promise.all(roomUpdates);
    }

    return apiSuccess({ message: "Booking API & Let's Book settings updated successfully" });
  } catch (error) {
    console.error("[PUT /api/admin/booking-api]", error);
    return apiError("Failed to update booking API data", 500);
  }
}
