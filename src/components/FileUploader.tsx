import { useState } from "react";
import PdfThumbnail from "./PdfThumbnail";

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const pdfFiles = Array.from(selectedFiles).filter(
      (file) => file.type === "application/pdf"
    );

    setFiles((prev) => [...prev, ...pdfFiles]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed #888",
          padding: "40px",
          textAlign: "center",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <p>Drag and drop PDF files here</p>
        <p>or</p>

        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleChange}
        />
      </div>

      <div>
        <h3>Uploaded files</h3>

        {files.length === 0 && <p>No files uploaded yet</p>}

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {files.map((file, index) => (
                <PdfThumbnail key={index} file={file} />
            ))}
        </div>
      </div>
    </div>
  );
}