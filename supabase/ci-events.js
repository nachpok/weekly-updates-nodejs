import { supabase } from "./client.js";
import { utils } from "../utils.js";

async function getCIEvents() {
  try {
    let query = supabase.from("ci-events").select("*");

    const { upcomingSaturday, followingSaturday } =
      utils.getUpcomingSaturdays();
    query = query.gte("startDate", upcomingSaturday);
    query = query.lte("endDate", followingSaturday);
    query = query.eq("hide", false);
    query = query.order("startDate", { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching CI events:", error);
    throw error;
  }
}

export { getCIEvents };
