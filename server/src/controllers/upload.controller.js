const path = require('path');
const fs = require('fs');
const User = require('../models/User');

let pdfParse;
try { pdfParse = require('pdf-parse'); } catch (_) {
  console.warn('[Upload] pdf-parse not available — text extraction disabled');
  pdfParse = null;
}

/**
 * POST /api/upload/resume
 * Accepts PDF/DOC/DOCX upload, extracts text via pdf-parse (PDF only),
 * stores file URL + extracted text on the User document.
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();

    console.log(`[Upload] File received: ${file.originalname} (${file.size} bytes) for user ${req.user._id}`);

    // ── Extract text from PDF ──────────────────────────────────────────────
    let resumeText = '';
    if (ext === '.pdf' && pdfParse) {
      try {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);
        resumeText = (pdfData.text || '').trim();
        console.log(`[Upload] PDF text extracted: ${resumeText.length} chars`);
      } catch (parseErr) {
        console.warn('[Upload] PDF parse failed:', parseErr.message);
        resumeText = '';
      }
    } else if (['.doc', '.docx'].includes(ext)) {
      resumeText = '';
      console.log('[Upload] DOC/DOCX — text extraction skipped (no mammoth)');
    }

    // ── Build public URL ───────────────────────────────────────────────────
    const fileUrl = `/uploads/resumes/${file.filename}`;

    // ── Update User document ───────────────────────────────────────────────
    const updateResult = await User.findByIdAndUpdate(
      req.user._id,
      {
        resume: fileUrl,
        resumeText: resumeText.slice(0, 10000), // cap at 10k chars
        resumeUploadedAt: new Date(),
      },
      { new: true }
    );

    if (!updateResult) {
      console.error('[Upload] User not found for ID:', req.user._id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log(`[Upload] User ${req.user._id} updated — resumeText: ${updateResult.resumeText?.length || 0} chars`);

    const hasExtractedText = resumeText.length > 50;

    return res.json({
      success: true,
      data: {
        fileUrl,
        filename: file.originalname,
        size: file.size,
        hasExtractedText,
        message: hasExtractedText
          ? `Resume uploaded! Extracted ${resumeText.length} characters — AI matching ready 🤖`
          : ext !== '.pdf'
          ? 'Resume uploaded. For best AI matching, please upload a PDF with selectable text.'
          : 'Resume uploaded. Text extraction was limited — ensure the PDF has selectable text (not scanned image).',
      },
    });
  } catch (err) {
    console.error('[Upload] Error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};

module.exports = { uploadResume };
