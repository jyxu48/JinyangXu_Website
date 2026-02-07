<script>

console.log("pdf-viewer.js loaded");

// ===== PDF.js viewer (canvas + aligned text layer) =====

const url = new URL("CV-0207.pdf", import.meta.url).href;
const container = document.getElementById('pdf-container');

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const SCALE = 1.4;

pdfjsLib.getDocument(url).promise.then(pdf => {
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    pdf.getPage(pageNum).then(page => {

      // ✅ ONE viewport for BOTH canvas & text layer
      const viewport = page.getViewport({ scale: SCALE });

      // ===== page wrapper =====
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page';
      pageWrapper.style.width = `${viewport.width}px`;
      pageWrapper.style.height = `${viewport.height}px`;
      container.appendChild(pageWrapper);

      // ===== canvas =====
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const outputScale = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

      pageWrapper.appendChild(canvas);

      page.render({
        canvasContext: context,
        viewport
      });

      // ===== text layer =====
      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';
      pageWrapper.appendChild(textLayerDiv);

      page.getTextContent().then(textContent => {
        pdfjsLib.renderTextLayer({
          textContent,
          container: textLayerDiv,
          viewport,
          textDivs: [],
        });
      });
    });
  }
});


</script>
