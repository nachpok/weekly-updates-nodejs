import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const tempKey = process.env.TEMP_KEY;
if (!accountSid || !authToken) {
  console.error(
    "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN environment variables"
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

// Example usage:
// sendWhatsAppMessage("+14155238886", "+972552655454", "Hello, this is a test message!")
//   .then(message => console.log("Message details:", message))
//   .catch(error => console.error("Failed to send message:", error));

export { sendWhatsAppMessage, broadcastWhatsAppMessage };
