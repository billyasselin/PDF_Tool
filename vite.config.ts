import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/PDF_Tool/", // <-- EXACT name of your GitHub repo
});