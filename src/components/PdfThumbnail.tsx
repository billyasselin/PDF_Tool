import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Props = {
  file: File;
  pageNumber?: number; // default to first page
};

export default function PdfThumbnail({ file, pageNumber = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;

    const renderPdf = async () => {
      if (!canvas || !isMounted) return;

      // Cancel any ongoing render
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(pageNumber);

        // Use a fixed scale and ignore rotation/metadata
        const viewport = page.getViewport({ scale: 0.4, rotation: 0 });

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context.clearRect(0, 0, canvas.width, canvas.height);

        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport,
        });

        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
      } catch (err) {
        if (isMounted) console.error("PDF thumbnail render error:", err);
      }
    };

    // Only render once canvas container has a measurable size
    const container = canvas.parentElement;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      // Render only when container has width/height
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        renderPdf();
      }
    });

    observer.observe(container);

    return () => {
      isMounted = false;
      observer.disconnect();
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [file, pageNumber]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas ref={canvasRef} style={{ border: "2px solid cyan" }} />
      {/* <p style={{ fontSize: "12px" }}>{file.name}</p> let FileUploader handle*/}
    </div>
  );
}
