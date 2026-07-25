const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { uploadPosterBuffer, deletePoster } = require("../services/cloudinaryUpload.service");
const { logAdminAction } = require("../services/auditLog.service");

// GET /api/events?upcoming=true
const listEvents = asyncHandler(async (req, res) => {
  const { upcoming } = req.query;

  const where = {
    isDeleted: false,
    ...(upcoming === "true" ? { eventDate: { gte: new Date() } } : {}),
  };

  const events = await prisma.event.findMany({
    where,
    orderBy: { eventDate: "asc" },
    include: {
      postedBy: { select: { id: true, name: true } },
      coordinators: true,
    },
  });

  res.json({ events });
});

const getEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await prisma.event.findFirst({
    where: { id, isDeleted: false },
    include: {
      postedBy: { select: { id: true, name: true } },
      coordinators: true,
    },
  });
  if (!event) throw new ApiError(404, "Event not found.");
  res.json({ event });
});

// POST /api/events (multipart/form-data)
// Fields: title, eventDate, venue, clubName, additionalDetails,
//         coordinators (JSON string: [{name, contact}, ...]), poster (file)
// Requires: STUDENT_ADMIN or SUPER_ADMIN (enforced by route middleware)
const createEvent = asyncHandler(async (req, res) => {
  const { title, eventDate, venue, clubName, additionalDetails, coordinators } = req.body;

  if (!title || !eventDate || !venue || !clubName) {
    throw new ApiError(400, "Title, event date, venue, and club name are required.");
  }

  const parsedDate = new Date(eventDate);
  if (isNaN(parsedDate.getTime())) throw new ApiError(400, "Invalid event date.");

  let coordinatorList = [];
  if (coordinators) {
    try {
      coordinatorList = JSON.parse(coordinators);
      if (!Array.isArray(coordinatorList)) throw new Error();
    } catch {
      throw new ApiError(400, "Coordinators must be a JSON array of { name, contact }.");
    }
  }

  let posterUrl = null;
  let posterPublicId = null;

  if (req.file) {
    try {
      const uploaded = await uploadPosterBuffer(req.file.buffer);
      posterUrl = uploaded.url;
      posterPublicId = uploaded.publicId;
    } catch (err) {
      console.error("Cloudinary upload failed:", err.message);
      throw new ApiError(503, "Poster upload failed. Please try again.");
    }
  }

  const event = await prisma.event.create({
    data: {
      title,
      eventDate: parsedDate,
      venue,
      clubName,
      additionalDetails: additionalDetails || null,
      posterUrl,
      posterPublicId,
      postedById: req.user.id,
      coordinators: {
        create: coordinatorList
          .filter((c) => c && c.name && c.name.trim())
          .map((c) => ({ name: c.name.trim(), contact: c.contact?.trim() || null })),
      },
    },
    include: { coordinators: true, postedBy: { select: { id: true, name: true } } },
  });

  res.status(201).json({ event });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new ApiError(404, "Event not found.");

  // Route middleware already restricts this to admins, but double-check
  // in case the route is ever reused elsewhere.
  const isAdmin = ["STUDENT_ADMIN", "SUPER_ADMIN"].includes(req.user.role);
  if (!isAdmin) throw new ApiError(403, "Only admins can delete events.");

  await prisma.event.update({
    where: { id },
    data: { isDeleted: true, deletedById: req.user.id },
  });

  await deletePoster(event.posterPublicId);

  await logAdminAction({
    adminId: req.user.id,
    actionType: "DELETE_EVENT",
    targetType: "event",
    targetId: id,
    reason,
  });

  res.json({ message: "Event deleted." });
});

module.exports = { listEvents, getEvent, createEvent, deleteEvent };
