// cron/handler.ts
import expireConsultsService from "../services/expireConsults.service.js";

export const handler = async () => {
  try {
    const result = await expireConsultsService.expireOldConsults();
    console.log("Expire consults job completed");
    return { status: "ok", result: result };
  } catch (err) {
    console.error("Error in expire consults cron:", err);
    throw err;
  }
};
