// If TypeScript complains about missing types
// @ts-ignore
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import PdfThumbnail from "./PdfThumbnail";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type FileWithId = { id: string; file: File };


export default function FileUploader() {
    const [files, setFiles] = useState<FileWithId[]>([]);

    const sensors = useSensors(useSensor(PointerSensor));

    const [mergeUrl, setMergeUrl] = useState<string | null>(null);

    function removeFile(id: string) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }

    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const newFiles: FileWithId[] = Array.from(e.target.files).map((f) => ({
            file: f,
            id: `${f.name}-${Date.now()}`, // unique id
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = files.findIndex((f) => f.id === active.id);
            const newIndex = files.findIndex((f) => f.id === over.id);
            setFiles((files) => arrayMove(files, oldIndex, newIndex));
        }
    }


    async function handleMerge() {
        if (files.length === 0) return;

        try {
            const mergedPdf = await PDFDocument.create();

            for (const f of files) {
                const arrayBuffer = await f.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page: import("pdf-lib").PDFPage) => mergedPdf.addPage(page));
            }

            const mergedBytes = await mergedPdf.save();
            const blob = new Blob([mergedBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setMergeUrl(url);
        } catch (err) {
            console.error("Error merging PDFs:", err);
            alert("Failed to merge PDFs.");
        }
    }

    return (
        <div>
            <input type="file" multiple accept="application/pdf" onChange={handleUpload} />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {files.map((f) => (
                                <SortablePdfCard
                                    key={f.id}
                                    file={f.file}
                                    id={f.id}
                                    onDelete={() => removeFile(f.id)} // ← add this
                                />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Merge button and download link */}
            <div style={{ marginTop: "20px" }}>
                <button onClick={handleMerge} disabled={files.length === 0}>
                    Merge PDFs
                </button>

                {mergeUrl && (
                    <a href={mergeUrl} download="merged.pdf" style={{ marginLeft: "15px" }}>
                        Download Merged PDF
                    </a>
                )}
            </div>
        </div>
    );
}

type SortablePdfCardProps = {
  file: File;
  id: string;
  onDelete: () => void;
};

function SortablePdfCard({ file, id, onDelete }: SortablePdfCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const boxStyle: React.CSSProperties = {   /* React is stricter than CSS so casting to avoid warning */
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "8px 8px 5px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#f9f9f9",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    width: "max-content",
    gap: 3,
    position: "relative", // needed for absolute delete button
  };

const deleteButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 4,
  right: 4,
  width: "32px",        // bigger click zone
  height: "32px",
  background: "transparent",
  border: "none",
  color: "#e74c3c",
  cursor: "pointer",
  fontSize: "32px",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  lineHeight: 1,
};

  return (
    <div
      ref={setNodeRef}
      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}
      {...attributes}
      {...listeners}
    >
      {/* White box with thumbnail + filename */}
      <div style={boxStyle}>
        <PdfThumbnail file={file} pageNumber={1} />

        <p
          style={{
            fontSize: "12px",
            color: "#333",
            margin: 0,
            wordBreak: "break-word",
            textAlign: "center",
            width: "240px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={file.name}
        >
          {file.name}
        </p>

        {/* Delete button */}
        <button
            type="button"
            style={deleteButtonStyle}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            onMouseDown={(e) => e.stopPropagation()} // prevent drag start
            onPointerDown={(e) => e.stopPropagation()}
        >
            ×
        </button>
      </div>
    </div>
  );
}