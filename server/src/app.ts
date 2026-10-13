import express from "express";

import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import { billRouter } from "./routes/bill.routes.js";
import { cageRouter } from "./routes/cage.routes.js";
import { customerRouter } from "./routes/customer.routes.js";
import { deathRouter } from "./routes/death.routes.js";
import { discardRouter } from "./routes/discard.routes.js";
import { eggCollectionRouter } from "./routes/egg-collection.routes.js";
import { entryRouter } from "./routes/entry.routes.js";
import { invoiceRouter } from "./routes/invoice.routes.js";
import { medicationApplicationRouter } from "./routes/medication-application.routes.js";
import { medicationRouter } from "./routes/medication.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { supplierRouter } from "./routes/supplier.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use("/api", cageRouter);
  app.use("/api", eggCollectionRouter);
  app.use("/api", deathRouter);
  app.use("/api", entryRouter);
  app.use("/api", discardRouter);
  app.use("/api", medicationRouter);
  app.use("/api", medicationApplicationRouter);
  app.use("/api", customerRouter);
  app.use("/api", supplierRouter);
  app.use("/api", productRouter);
  app.use("/api", orderRouter);
  app.use("/api", invoiceRouter);
  app.use("/api", billRouter);
  app.use("/api", reportRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
