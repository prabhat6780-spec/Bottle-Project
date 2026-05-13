const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static("uploads"));



app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/brand", require("./routes/brand.routes"));
app.use("/api/variant", require("./routes/variant.routes"));
app.use("/api/bottle-spec", require("./routes/bottlespecs.routes"));
app.use("/api/production", require("./routes/production.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/permissions", require("./routes/permission.routes"));
app.use("/api/vision", require("./routes/vision.routes"));
module.exports = app;