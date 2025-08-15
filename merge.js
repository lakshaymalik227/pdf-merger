const PDFMerger = require('pdf-merger-js').default;

const mergePdfs = async (file1, file2, useBuffer = false) => {
  const merger = new PDFMerger();

  if (useBuffer) {
    // For Vercel: merge from buffers
    await merger.add(file1);
    await merger.add(file2);
    return await merger.saveAsBuffer();
  } else {
    // Local: merge from disk and save
    await merger.add(file1);
    await merger.add(file2);
    let d = new Date().getTime();
    await merger.save(`public/${d}.pdf`);
    return d;
  }
};

module.exports = { mergePdfs };
