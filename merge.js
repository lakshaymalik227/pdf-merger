const PDFMerger = require('pdf-merger-js').default;

const mergePdfs = async (file1, file2, useBuffer = false) => {
  const merger = new PDFMerger();

  if (useBuffer) {
    // If running on Vercel (using memoryStorage)
    await merger.add(file1);
    await merger.add(file2);
    return await merger.saveAsBuffer();
  } else {
    // Local file-based merge
    await merger.add(file1);
    await merger.add(file2);
    let d = new Date().getTime();
    await merger.save(`public/${d}.pdf`);
    return d; // Return file name timestamp
  }
};

module.exports = { mergePdfs };
