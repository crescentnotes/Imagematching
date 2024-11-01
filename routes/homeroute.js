import express from "express";
import multer from "multer";
import { exec } from "child_process";
import path from "path";

const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // save uploads to /uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage: storage });

router.get("/", (req, res) => {
    res.render("home");
});
// POST route to handle file upload and image matching
router.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
  
    const uploadedImagePath = path.join("uploads", req.file.filename);
  
    // Run the Python image matching script
    exec(`python match.py "${uploadedImagePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send("Error running Python script");
      }
  
      try {
        const result = JSON.parse(stdout); // Parse the JSON output from the Python script
  
        // Prepare data to pass to EJS
        const matchedImage = result["Best Matching Image"]
          ? `/images/${result["Best Matching Image"]}`
          : null; // If no match, matchedImage will be null
  
          res.render("result", {
            title: "Image Match Result", // Define the title here
            matchResult: result["Match Result"],
            matchScore: result["Match Score"],
            uploadedImage: `/uploads/${req.file.filename}`,
            matchedImage: matchedImage,
            personInfo: {
              name: result["Name"] || "N/A",
              rrn: result["RRN"] || "N/A",
              department: result["Department"] || "N/A",
              year: result["Year"] || "N/A",
              section: result["Section"] || "N/A"
            }
          });
          
      } catch (e) {
        console.error("Failed to parse JSON from Python script:", e);
        res.status(500).send("Failed to parse JSON output");
      }
    });
  });
  

export default router;

