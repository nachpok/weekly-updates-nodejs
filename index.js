import express from "express";
import bodyParser from "body-parser";
import {
  sendEventEmailTemplateNotification,
  sendEventSMSNotifications,
} from "./eventNotifications.js";
import cron from "node-cron";
const app = express();
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST endpoint to send WhatsApp message
// app.post("/api/send-whatsapp", async (req, res) => {
//   const { temp, to, from, body } = req.body;

//   // Validate input
//   if (!temp || !to || !from || !body) {
//     return res.status(400).json({ error: "Missing required field" });
//   }

//   try {
//     const message = await sendWhatsAppMessage(temp, from, to, body);
//     res.json({ success: true, messageSid: message.sid });
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);
//     res.status(500).json({
//       error: "Failed to send WhatsApp message",
//       details: error.message,
//     });
//   }
// });

app.get("/api/send-email", async (req, res) => {
  const { sentEmails, failedEmails } =
    await sendEventEmailTemplateNotification();

  res.status(200).json({ success: true, sentEmails, failedEmails });
});

app.get("/api/send-sms", async (req, res) => {
  const { sentSMSs, failedSMSs } = await sendEventSMSNotifications();
  res.status(200).json({ success: true, sentSMSs, failedSMSs });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

cron.schedule(process.env.CRON_TIME, sendEventEmailTemplateNotification, {
  timezone: "Asia/Jerusalem",
});

export default app;
