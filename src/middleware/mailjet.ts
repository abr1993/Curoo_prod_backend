import nodemailer from "nodemailer";

export const mailjetTransport = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MJ_APIKEY_PUBLIC!,
    pass: process.env.MJ_APIKEY_PRIVATE!,
  },
});
