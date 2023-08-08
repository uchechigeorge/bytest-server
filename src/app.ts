import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import apiRoute from "./api/routes";

dotenv.config();
const upload = multer();

const app = express();
// app.set("trust proxy", true);

app.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: "*",
  })
);

// Enable json body
app.use(express.json());
// Enable urlencoded body
app.use(express.urlencoded({ extended: true }));
// Enable formdate body
app.use(upload.any());

// Handle files
app.use("/files", express.static("public"));

// Handle routes
app.use("/api", apiRoute);

app.get("/", (req, res) => {
  const response = {
    status: true,
    message: "You probably shouldn't be here, but...",
    data: {
      service: "bytest-api",
      version: "1.0.0",
    },
  };

  res.send(`<pre>${JSON.stringify(response, null, 4)}</pre>`);
});

export default app;
