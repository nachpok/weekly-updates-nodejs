import { supabase } from "./client.js";

async function getUsers(method = "email") {
  try {
    let query = supabase.from("users").select(`fullName,${method},newsletter`);
    query = query.filter("newsletter->active", "eq", true);

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error in getUsers:", error);
    return [];
  }
}
export { getUsers };
