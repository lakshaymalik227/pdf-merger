const express = require('express');
const path = require('path');
const multer = require('multer');
const { mergePdfs } = require('./merge');

const app = express();
const isVercel = process.env.VERCEL === '1';

// Use memory storage for Vercel (stateless) and disk for local
const upload = multer({
  storage: isVercel ? multer.memoryStorage() : multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); 
    }
  })
});

app.use('/static', express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "templates/index.html"));
});

app.post('/merge', upload.array('pdfs', 2), async (req, res) => {
  try {
    if (isVercel) {
      // Merge from buffers (Vercel)
      const mergedBuffer = await mergePdfs(req.files[0].buffer, req.files[1].buffer, true);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
      res.send(mergedBuffer);
    } else {
      // Merge from file paths (local)
      let d = await mergePdfs(
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

// Export app for Vercel, listen locally
if (isVercel) {
  module.exports = app;
} else {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}
