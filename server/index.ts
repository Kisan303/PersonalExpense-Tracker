import dotenv from 'dotenv';
dotenv.config();  // Make sure this is placed at the top of your file before any other code

console.log(process.env.MONGODB_URI);  // Log the environment variable to check if it’s loaded

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToMongoDB, closeMongoDB } from "./mongodb";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Try to connect to MongoDB, but don't fail if it doesn't work
    try {
      await connectToMongoDB();
      log('Successfully connected to MongoDB Atlas', 'server');
    } catch (dbError) {
      log(`Warning: MongoDB connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`, 'server');
      log('Continuing with in-memory storage', 'server');
    }
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      log('Shutting down server gracefully...', 'server');
      await closeMongoDB();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      log('Shutting down server gracefully...', 'server');
      await closeMongoDB();
      process.exit(0);
    });
    
  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`, 'server');
    process.exit(1);
  }
})();
