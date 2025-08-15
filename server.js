const express = require('express');
const path = require('path');
const multer = require('multer');
const { mergePdfs } = require('./merge');

const app = express();
const isVercel = process.env.VERCEL === '1';

// Serve static files from public/
app.use('/static', express.static(path.join(__dirname, 'public')));

// Multer storage
const upload = multer({
  storage: isVercel ? multer.memoryStorage() : multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Merge endpoint
app.post('/merge', upload.array('pdfs', 2), async (req, res) => {
  try {
    if (isVercel) {
      const mergedBuffer = await mergePdfs(req.files[0].buffer, req.files[1].buffer, true);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
      res.send(mergedBuffer);
    } else {
      const d = await mergePdfs(
        path.join(__dirname, req.files[0].path),
        path.join(__dirname, req.files[1].path)
      );
      res.redirect(`/static/${d}.pdf`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error merging PDFs');
  }
});

// Export for Vercel
if (isVercel) {
  module.exports = app;
} else {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
