import express from "express";
import homeroutes from "./routes/homeroute.js"; // Import home routes
import aboutroutes from "./routes/aboutroute.js"; // Import about routes
import contactroutes from "./routes/contactroute.js"; // Import contact routes
import path from "path";

const app = express();
const port = 8000;

// Set EJS as the template engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static('public'));

// Serve uploaded files and predefined images
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("images"));

// Middleware to collect the data sent in the post request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use home routes
app.use("/", homeroutes);

// Use about routes
app.use("/about", aboutroutes);

// Use contact router
app.use("/contact", contactroutes);

// Start the server
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
