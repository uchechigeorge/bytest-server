import express from "express";
import { normalizeQueryParams } from "../middleware/normalize-params.middleware";
import userRoutes from "./user";

const apiRoutes = express.Router();

// Adds helper function to request object to help with normalizing query params
apiRoutes.use(normalizeQueryParams);

apiRoutes.use("/", userRoutes);

export default apiRoutes;
