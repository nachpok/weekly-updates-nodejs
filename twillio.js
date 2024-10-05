import twilio from "twilio";
import dotenv from "dotenv";
import { utils } from "./utils.js";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const tempKey = process.env.TEMP_KEY;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const currentDomain = process.env.CURRENT_DOMAIN;

if (!accountSid || !authToken || !currentDomain) {
  console.error(
    "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN or CURRENT_DOMAIN environment variables"
  );
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function sendWhatsAppMessage(temp, from, to, body) {
  if (temp !== tempKey) {
    throw new Error("Invalid key");
  }
  try {
    const message = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body: body,
    });
    console.log(`Message sent successfully. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
}

async function broadcastWhatsAppMessage(temp, from, toList, body) {
  if (temp !== tempKey) {
    throw new Error("Invalid key");
  }
  const results = [];
  for (const to of toList) {
    try {
      const message = await sendWhatsAppMessage(temp, from, to, body);
      results.push({ to, status: "success", messageSid: message.sid });
    } catch (error) {
      results.push({ to, status: "failed", error: error.message });
    }
  }
  return results;
}

async function sendSMS(to, body) {
  // Format the phone number
  let formattedTo = to;
  if (formattedTo[0] === "0") {
    formattedTo = "+972" + formattedTo.slice(1);
  } else if (formattedTo[0] === "9") {
    formattedTo = "+" + formattedTo;
  }

  try {
    const message = await client.messages.create({
      from: `${twilioPhoneNumber}`,
      to: `${formattedTo}`,
      body: body,
    });
    console.log(`Message sent successfully. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
}

async function sendSMSs(users) {
  let sentSMSs = [];
  let failedSMSs = [];

  for (const user of users) {
    try {
      const url = utils.buildPersonalizedEventsUrl(
        user.newsletter,
        currentDomain
      );

      const body = `אירועי קונטקט בשבוע הקרוב: \n ${url}`;
      const message = await sendSMS(user.phoneNumber, body);
      console.log(`Message sent successfully. SID: ${message}`);
      sentSMSs.push(user.phoneNumber);
    } catch (error) {
      console.error("Error sending message:", error);
      failedSMSs.push(user.phoneNumber);
    }
  }
  return { sentSMSs, failedSMSs };
}

// Example usage:
// sendWhatsAppMessage("+14155238886", "+972552655454", "Hello, this is a test message!")
//   .then(message => console.log("Message details:", message))
//   .catch(error => console.error("Failed to send message:", error));

export { sendWhatsAppMessage, broadcastWhatsAppMessage, sendSMS, sendSMSs };
