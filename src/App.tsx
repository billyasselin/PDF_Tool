import FileUploader from "./components/FileUploader";

function App() {
  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "40px" }}>
      <h1>Privacy-First PDF Merge Tool</h1>

      <p>
        🔒 Your PDFs are processed entirely in your browser. Files never leave
        your device.
      </p>

      <FileUploader />
    </div>
  );
}

export default App;