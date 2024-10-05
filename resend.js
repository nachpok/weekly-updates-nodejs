import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import Handlebars from "handlebars";
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(resendApiKey);

const templateSource = fs.readFileSync("EmailTemplates/weekly.html", "utf-8");
const template = Handlebars.compile(templateSource);

async function sendWeeklyEmails(eventsForUsers) {
  let sentEmails = [];
  let failedEmails = [];
  for (const userEvents of eventsForUsers) {
    const { user, events } = userEvents;

    const htmlContent = template({
      fullName: user.full_name,
      events: events,
    });

    try {
      const { error, data } = await resend.emails.send({
        from: "info@nachli.com",
        to: user.email,
        subject: "אירועי  קונטקט השבוע",
        html: htmlContent,
      });
      if (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        failedEmails.push(user.email);
      } else {
        console.log(`Email sent successfully to ${user.email}`, data);
        sentEmails.push(user.email);
      }
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
      failedEmails.push(user.email);
    }
  }

  return { sentEmails, failedEmails };
}

export { sendWeeklyEmails };
