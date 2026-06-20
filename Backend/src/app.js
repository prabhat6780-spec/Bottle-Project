const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

// Add all your allowed domains in this array
const allowedOrigins = [
  "http://localhost:5173",
  "https://erp.shayonaglass.com",
  "https://application.shayonaglass.com",
  // Add more domains here anytime you need
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (Postman, mobile apps, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookieParser());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/company", require("./routes/company.routes"));
app.use("/api/brand", require("./routes/brand.routes"));
app.use("/api/variant", require("./routes/variant.routes"));
app.use("/api/bottle-spec", require("./routes/bottlespecs.routes"));
app.use("/api/production", require("./routes/production.routes"));
app.use("/api/coating-production", require("./routes/coatingProduction.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/permissions", require("./routes/permission.routes"));
app.use("/api/vision", require("./routes/vision.routes"));
app.use("/api/printing-type", require("./routes/printingType.routes"));
app.use("/api/printing-color", require("./routes/printingColor.routes"));
app.use("/api/coating-type", require("./routes/coatingType.routes"));
app.use("/api/text-color", require("./routes/textcolor.routes"));
app.use("/api/operator", require("./routes/operator.routes"));
app.use("/api/shift", require("./routes/shift.routes"));

// Added testing routes for the browser
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Bottle Project API! The backend is running successfully." });
});

app.get("/api", (req, res) => {
  res.json({ message: "Bottle Project API is active. Please specify a specific endpoint (e.g., /api/users)." });
});

module.exports = app;
