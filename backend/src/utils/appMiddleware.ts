import express, { Express } from "express";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";
import helmet from "helmet";



const enableJson = (app: Express) => {
  app.use(express.json({limit: "50mb"}));
}

const printRequests = (app: Express) => {
  app.use(morgan("dev"));
}

const addSecurityMiddleware = (app: Express) => {
  app.use(cors()); //allow any cross origin
  app.use(helmet()); //no bad headers
  app.use(xss()); //no <tags> in input
  const limiter = rateLimit({ //no billion calls a minute
      windowMs: 60 * 1000,
      max: 1000
    });
  app.use(limiter);
  app.use(hpp()); //no duplicite body & queryString values
}



export const addAppMiddleware = (app: Express) => {
  enableJson(app);
  printRequests(app);
  addSecurityMiddleware(app);
}