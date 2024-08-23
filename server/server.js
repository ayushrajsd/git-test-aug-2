const express = require("express");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*", // Allow only your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const clientBuildPath = path.join(__dirname, "../client/build");
console.log("cliuent path", clientBuildPath);
// Serve static files from the React app
app.use(express.static(clientBuildPath));

// The "catchall" handler: for any request that doesn't match an API route, serve the index.html file

// app.use(helmet());
app.use(mongoSanitize());
app.use(helmet());

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           "'unsafe-eval'",
//           "https://git-test-aug-2.onrender.com/", // Replace with your actual production URL
//         ],
//         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//         imgSrc: ["'self'", "data:", "https://git-test-aug-2.onrender.com/"], // Replace with your actual production URL
//         connectSrc: ["'self'", "https://git-test-aug-2.onrender.com/"], // Your API domain
//         fontSrc: ["'self'", "https://git-test-aug-2.onrender.com/"],
//         objectSrc: ["'none'"],
//         upgradeInsecureRequests: [],
//       },
//     },
//   })
// );

app.use(express.json());
// load the environment variables into process.env

const userRouter = require("./routes/userRoutes");
const movieRouter = require("./routes/movieRoutes");
const theatreRouter = require("./routes/theatreRoutes");
const showRouter = require("./routes/showRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const connectDb = require("./config/db");
connectDb();
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply rate limiter to all API routes
app.use("/api/", apiLimiter);

/** * Routes */
app.use((req, res, next) => {
  console.log("request received on server", req.body, req.url);
  next();
});
app.use("/api/users", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/theatres", theatreRouter);
app.use("/api/shows", showRouter);
app.use("/api/bookings", bookingRouter);

app.get("*", (req, res) => {
  console.log("sending file", path.join(clientBuildPath, "index.html"));
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(8082, () => {
  console.log("Server is up and running on port 8082");
});
