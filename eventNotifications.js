import dayjs from "dayjs";
import { sendWeeklyEmails } from "./resend.js";
import { getCIEvents } from "./supabase/ci-events.js";
import { getUsers } from "./supabase/users.js";
import { utils } from "./utils.js";
import { sendSMSs } from "./twillio.js";
async function sendEventEmailTemplateNotification() {
  console.log(
    `Sending event email template notification at ${dayjs().format(
      "YYYY-MM-DD HH:mm:ss"
    )}`
  );
  const events = await getCIEvents();
  const users = await getUsers();

  const eventsByDistrict = utils.eventsByDistrict(events);

  const eventsForUsers = utils.formatEmailToUser(users, eventsByDistrict);
  const { sentEmails, failedEmails } = await sendWeeklyEmails(eventsForUsers);

  return { sentEmails, failedEmails };
}

async function sendEventSMSNotifications() {
  console.log(
    `Sending event SMS notification at ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`
  );
  const users = await getUsers("phoneNumber");
  console.log("users", users);
  const { sentSMSs, failedSMSs } = await sendSMSs(users);
  return { sentSMSs, failedSMSs };
}

export { sendEventEmailTemplateNotification, sendEventSMSNotifications };
