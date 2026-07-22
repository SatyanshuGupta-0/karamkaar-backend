const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();

// ==========================================
// DATABASE
// ==========================================

require("./DB/db");

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://karamkaar.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without Origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(helmet());

app.use(morgan("dev"));

// ==========================================
// ROUTERS
// ==========================================

const userRouter = require("./router/registration_router");


const bookingRouter = require(
  "./router/booking_router"
);

const notificationRouter = require(
  "./router/notification_router"
);

const paymentRouter = require(
  "./router/payment_router"
);

const reviewRouter = require(
  "./router/review_router"
);
const serverRoutes = require(
  "./router/review_router"
);


// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server Running Successfully",
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/user", userRouter);


app.use("/api/booking", bookingRouter);

app.use(
  "/api/notification",
  notificationRouter
);

app.use("/api/payment", paymentRouter);

app.use("/api/review", reviewRouter);
app.use("/api/server", serverRoutes);
// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.log(err);

  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});