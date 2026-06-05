
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const shortid = require("shortid");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/urlshortener")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Schema
const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  
  {
    timestamps: true,
  }
);

// Model
const Url = mongoose.model("Url", urlSchema);

// Create Short URL
app.post("/api/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        message: "URL is required",
      });
    }

    const shortCode = shortid.generate();

    const newUrl = await Url.create({
      originalUrl,
      shortCode,
    });

    res.status(201).json({
      success: true,
      originalUrl: newUrl.originalUrl,
      shortUrl: `http://localhost:5001/${newUrl.shortCode}`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get All URLs
app.get("/api/urls", async (req, res) => {
  try {
    const urls = await Url.find().sort({
      createdAt: -1,
    });

    res.json(urls);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete URL
app.delete("/api/url/:id", async (req, res) => {
  try {
    await Url.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "URL Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Redirect Route
app.get("/:shortCode", async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
    });

    if (!url) {
      return res.status(404).json({
        message: "URL Not Found",
      });
    }

    url.clicks += 1;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Analytics
app.get("/api/analytics/:shortCode", async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
    });

    if (!url) {
      return res.status(404).json({
        message: "URL Not Found",
      });
    }

    res.json({
      originalUrl: url.originalUrl,
      shortUrl: `http://localhost:5001/${url.shortCode}`,
      totalClicks: url.clicks,
      createdAt: url.createdAt,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});