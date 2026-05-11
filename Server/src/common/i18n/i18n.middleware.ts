import { Request, Response, NextFunction } from "express";
import { t } from "./i18n.service";

declare global {
  namespace Express {
    interface Request {
      lang: string;
      t: (key: string) => string;
    }
  }
}

export const i18n = (req: Request, _res: Response, next: NextFunction) => {
  const lang =
    ((req.headers["accept-language"] ||
      req.headers["x-lang"] ||
      "en") as string) || "en";
  const supportedLangs = ["en", "ar"];
  const langCode = supportedLangs.includes(lang) ? lang : "en";

  req.lang = langCode;
  req.t = (key: string) => t(key, langCode);

  next();
};
