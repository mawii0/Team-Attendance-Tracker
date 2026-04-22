import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-06a79272/health", (c) => {
  return c.json({ status: "ok" });
});

// Team Members endpoints
app.get("/make-server-06a79272/team-members", async (c) => {
  try {
    const members = await kv.get("team_members");
    return c.json(members || []);
  } catch (error) {
    console.log("Error fetching team members:", error);
    return c.json({ error: "Failed to fetch team members" }, 500);
  }
});

app.post("/make-server-06a79272/team-members", async (c) => {
  try {
    const members = await c.req.json();
    await kv.set("team_members", members);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving team members:", error);
    return c.json({ error: "Failed to save team members" }, 500);
  }
});

// Attendance Records endpoints
app.get("/make-server-06a79272/attendance-records", async (c) => {
  try {
    const records = await kv.get("attendance_records");
    return c.json(records || []);
  } catch (error) {
    console.log("Error fetching attendance records:", error);
    return c.json({ error: "Failed to fetch attendance records" }, 500);
  }
});

app.post("/make-server-06a79272/attendance-records", async (c) => {
  try {
    const records = await c.req.json();
    await kv.set("attendance_records", records);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving attendance records:", error);
    return c.json({ error: "Failed to save attendance records" }, 500);
  }
});

// Sync endpoint - saves both team members and attendance records
app.post("/make-server-06a79272/sync", async (c) => {
  try {
    const { teamMembers, attendanceRecords } = await c.req.json();
    await kv.set("team_members", teamMembers);
    await kv.set("attendance_records", attendanceRecords);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error syncing data:", error);
    return c.json({ error: "Failed to sync data" }, 500);
  }
});

Deno.serve(app.fetch);