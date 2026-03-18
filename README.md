# Privacy-First PDF Merger

A **client-side PDF merger** built with **React + TypeScript + Vite**.  
Everything runs locally in your browser **no PDFs are uploaded to any server**, so your documents stay private.

## Features

- Upload multiple PDFs at once
- Drag to reorder files
- Delete accidentally uploaded files
- Merge PDFs into a single file
- Fully runs in the browser (privacy-first)

## Live Demo

[Try it online!](https://billyasselin.github.io/PDF_Tool/)

## Usage

1. Click **Choose Files** to upload PDFs  
2. Drag to reorder or delete files  
3. Click **Merge PDFs**  
4. Download your merged PDF

## Usage Setup for Development

```bash
# Install dependencies
npm install

# Run locally in development mode
npm run dev

# Build production-ready files
npm run build

# Deploy to GitHub Pages
npm run deploy

The app will be available at https://<username>.github.io/<repo-name>/ after deploying.
Make sure vite.config.ts has base: '/<repo-name>/' so assets load correctly.
```

## License

This project is open-source under the MIT License.

---
