import { sendWeeklyEmails } from "./resend.js";
import { getCIEvents } from "./supabase/ci-events.js";
import { getUsers } from "./supabase/users.js";
import { utils } from "./utils.js";

const groupEventsByDistrict = (events) => {
  return events.reduce((acc, event) => {
    if (!acc[event.district]) {
      acc[event.district] = [];
    }
    acc[event.district].push(event);
    return acc;
  }, {});
};

async function sendEventNotification() {
  const events = await getCIEvents();
  const users = await getUsers();

  const eventsByDistrict = utils.eventsByDistrict(events);

  const eventsForUsers = utils.formatEmailToUser(users, eventsByDistrict);
  const { sentEmails, failedEmails } = await sendWeeklyEmails(eventsForUsers);

  return { sentEmails, failedEmails };
}

export { sendEventNotification };
