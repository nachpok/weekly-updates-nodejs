import dayjs from "dayjs";

const WeekendEventType = {
  class: "cl",
  jame: "j",
  workshop: "w",
  conference: "co",
  underscore: "u",
  retreat: "r",
};

const WeekendDistrict = {
  north: "n",
  south: "s",
  center: "c",
  jerusalem: "j",
};

export const utils = {
  getUpcomingSaturdays: function () {
    const today = dayjs();
    const saturday = 6; // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

    let upcomingSaturday = today;

    // Find the first upcoming Saturday
    while (upcomingSaturday.day() !== saturday) {
      upcomingSaturday = upcomingSaturday.add(1, "day");
    }

    // Get the Saturday after that
    const followingSaturday = upcomingSaturday.add(7, "day");

    return {
      upcomingSaturday: upcomingSaturday.format("YYYY-MM-DD"),
      followingSaturday: followingSaturday.format("YYYY-MM-DD"),
    };
  },

  eventsByDistrict: function (events) {
    const cleanEvents = events.map((event) => {
      return {
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        district: event.district,
        types: event.subEvents.map((subEvent) => subEvent.type),
      };
    });
    return cleanEvents.reduce((acc, event) => {
      if (!acc[event.district]) {
        acc[event.district] = [];
      }
      acc[event.district].push(event);
      return acc;
    }, {});
  },

  formatEmailToUser: function (users, events) {
    const eventsForUsers = [];
    for (const user of users) {
      const districts = user.newsletter.districts;
      const eventTypes = user.newsletter.eventTypes;

      let userEvents = {};
      for (const district in events) {
        if (districts.length === 0 || districts.includes(district)) {
          if (eventTypes.length === 0) {
            userEvents[district] = events[district];
          } else {
            userEvents[district] = events[district].filter((event) =>
              eventTypes.some((type) => event.types.includes(type))
            );
          }
        }
      }
      eventsForUsers.push({ user, events: userEvents });
    }
    return eventsForUsers;
  },

  buildPersonalizedEventsUrl: function (newsletterSettings, domain) {
    const { districts, eventTypes } = newsletterSettings;
    let url = `${domain}/weekly-events?`;

    districts.forEach((district) => {
      url += `d=${WeekendDistrict[district]}&`;
    });

    eventTypes.forEach((eventType) => {
      url += `e=${WeekendEventType[eventType]}&`;
    });

    return url;
  },
};
