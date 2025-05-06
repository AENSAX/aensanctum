import { SessionOptions } from "iron-session";
export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "aenstSession",
  cookieOptions: {
    secure: true,
  },
};
