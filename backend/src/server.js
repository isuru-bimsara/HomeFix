require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const sequelize =
  require("./config/database");

const routes =
  require("./routes");

const {
  apiLimiter,
  authLimiter,
} = require("./middleware/rate-limit.middleware");

const cloudinary = require("./config/cloudinary");


const errorMiddleware =
  require("./middleware/error.middleware");

// Load all models + relationships
require("./models");


const app = express();


// ==================================================
// BASIC CONFIGURATION
// ==================================================

app.set(
  "trust proxy",
  1
);


// ==================================================
// SECURITY
// ==================================================

app.use(
  helmet()
);


// ==================================================
// CORS
// ==================================================

const corsOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://10.18.181.146:3000",
  ...(process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        corsOrigins.has("*") ||
        corsOrigins.has(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked request from ${origin}`)
      );
    },

    credentials: true,
  })
);


// ==================================================
// BODY PARSERS
// ==================================================

app.use(
  express.json({
    limit: "100kb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "100kb",
  })
);


// ==================================================
// LOGGER
// ==================================================

if (
  process.env.NODE_ENV !==
  "production"
) {
  app.use(
    morgan("dev")
  );
}

// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
  "/health",
  (req, res) => {
    res.json({
      success: true,

      message:
        "Home Service API is running.",
    });
  }
);


// ==================================================
// API ROUTES

app.use(
  "/api",
  apiLimiter
);

app.use(
  "/api/auth",
  authLimiter
);

app.use(
  "/api",
  routes
);


// ==================================================
// 404
// ==================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,

      message:
        "API endpoint not found.",
    });
  }
);


// ==================================================
// ERROR HANDLER
// ==================================================

app.use(
  errorMiddleware
);


// ==================================================
// START SERVER
// ==================================================

const PORT =
  Number(
    process.env.PORT
  ) || 5000;

const ensureHourlyRateColumn = require(
  "./migrations/ensure-hourly-rate-column"
);
const ensureDirectMessages = require(
  "./migrations/ensure-direct-messages"
);
const ensureBookingSchedule = require("./migrations/ensure-booking-schedule");
const ensureInsuranceReviewDetails = require("./migrations/ensure-insurance-review-details");


async function startServer() {

  try {

    await sequelize.authenticate();

    console.log(
      "Database connected successfully."
    );

    // Development only
    await sequelize.sync();

    await ensureHourlyRateColumn(sequelize);
    await ensureDirectMessages(sequelize);
    await ensureBookingSchedule(sequelize);
    await ensureInsuranceReviewDetails(sequelize);

    console.log(
      "Database synchronized."
    );

    console.log({
  cloudName: cloudinary.config().cloud_name,
  apiKey: cloudinary.config().api_key ? "OK" : "MISSING",
  apiSecret: cloudinary.config().api_secret ? "OK" : "MISSING",
});


    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );

  } catch (error) {

    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
}


startServer();
