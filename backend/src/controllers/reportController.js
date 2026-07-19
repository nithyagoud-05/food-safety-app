import { createReport, listReports } from "../data/store.js";
import { uploadEvidenceImages } from "../services/UploadService.js";
import { sendError } from "../utils/errors.js";

const categories = ["Unhygienic Food", "Allergy Issue", "Food Poisoning", "Wrong Ingredients", "Other"];

export async function submitReport(req, res) {
  try {
    const { restaurantId, category, description, image, evidenceImageUrl, evidenceImageUrls } = req.body;
    if (!restaurantId || !category || !description) {
      return res.status(400).json({ message: "Restaurant, category, and description are required" });
    }
    if (!categories.includes(category)) {
      return res.status(400).json({ message: "Invalid report category" });
    }
    const report = await createReport(req.user, { restaurantId, category, description, image, evidenceImageUrl, evidenceImageUrls });
    res.status(201).json(report);
  } catch (error) {
    sendError(res, error);
  }
}

export async function uploadReportEvidence(req, res) {
  try {
    const urls = await uploadEvidenceImages(req.files || []);
    res.status(201).json({ urls, evidenceImageUrls: urls });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getReports(_req, res) {
  try {
    const reports = await listReports();
    res.json(reports);
  } catch (error) {
    sendError(res, error);
  }
}
