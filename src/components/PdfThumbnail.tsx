import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Props = {
    file: File;
};

export default function PdfThumbnail({ file }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        async function renderPdf() {
            if (!canvasRef.current) return;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.4 });
            const rotatedViewport = viewport.clone({ rotation: page.rotate });

            const canvas = canvasRef.current;
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const context = canvas.getContext("2d");
            if (!context) return;

            // set up canvas
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // save canvas state
            context.save();
            context.clearRect(0, 0, canvas.width, canvas.height);

            // apply rotation transform based on page.rotate
            switch (page.rotate) {
                case 90:
                    context.translate(canvas.width, 0);
                    context.rotate((90 * Math.PI) / 180);
                    break;
                case 180:
                    context.translate(canvas.width, canvas.height);
                    context.rotate((180 * Math.PI) / 180);
                    break;
                case 270:
                    context.translate(0, canvas.height);
                    context.rotate((270 * Math.PI) / 180);
                    break;
                default:
                    // no rotation
                    break;
            }

            // render the page
            await page.render({
                canvasContext: context,
                canvas,
                viewport, rotatedViewport,
            }).promise;

            // restore canvas state
            context.restore();


            await page.render({
                canvasContext: context,
                canvas,
                viewport,
            }).promise;

            // restore canvas state
            context.restore();
        }

        renderPdf();
    }, [file]);

    return (
        <div style={{ width: "120px", textAlign: "center" }}>
            <canvas ref={canvasRef} style={{ border: "1px solid red" }}></canvas>
            <p style={{ fontSize: "12px" }}>{file.name}</p>
        </div>
    );
}