import express from "express";
import { createServer as createViteServer } from "vite";
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Debug: Log environment variables (masking secrets)
console.log("R2 Configuration:", {
  endpoint: process.env.R2_ENDPOINT,
  bucket: process.env.R2_BUCKET_NAME,
  accessKeyId: process.env.R2_ACCESS_KEY_ID ? "PRESENT" : "MISSING",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ? "PRESENT" : "MISSING",
});

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "https://c4420116af108df67eebb3006b804452.r2.cloudflarestorage.com",
  forcePathStyle: true, // Often required for R2 to avoid virtual-hosted style issues
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "4d65b74dafd19faaae7fcde79a10f020",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "4f233978c955a46099292e4fcb5823bb32b1a1c8dac011c158f76b4e14bc5ce8",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "posts";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-787d908cd4db458da923c4d16758ba46.r2.dev";

// API Routes
app.get("/api/files", async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });
    const response = await s3Client.send(command);
    const files = response.Contents?.map(file => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      url: `${PUBLIC_URL}/${file.Key}`,
    })) || [];
    res.json(files);
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

app.post("/api/upload-url", async (req, res) => {
  const { fileName, contentType, prefix = "" } = req.body;
  if (!fileName) return res.status(400).json({ error: "File name is required" });

  const key = prefix ? `${prefix.replace(/\/$/, "")}/${fileName}` : fileName;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ url, key });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

app.delete("/api/files/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
