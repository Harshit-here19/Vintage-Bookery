# 📚 Vintage Bookery - Classic Book Reader

Transform your digital texts into beautiful vintage-styled books with an authentic old-world reading experience.

![Vintage Bookery](https://img.shields.io/badge/Version-2.0-gold)
![License](https://img.shields.io/badge/License-MIT-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

Check out the project here: [Vintage Bookery](https://harshit-here19.github.io/Vintage-Bookery/)

## ✨ Features

### 📤 File Support
- **PDF** - Full text extraction using PDF.js
- **EPUB** - Complete parsing with metadata extraction using JSZip
- **TXT** - Plain text file support
- **Drag & Drop** - Easy file upload interface

### 🎨 12 Vintage Themes
| Theme | Description |
|-------|-------------|
| Classic Vintage | Warm sepia tones, cream paper |
| Victorian Gothic | Purple/mauve, ornate style |
| Medieval Script | Parchment, illuminated manuscript |
| Antique Leather | Rich brown leather binding |
| Old Library | Green leather, gold accents |
| Dark Academia | Scholarly, muted elegance |
| Steampunk | Copper/bronze, industrial Victorian |
| Art Nouveau | Organic greens, flowing natural |
| Renaissance | Rich reds, Italian manuscript |
| Colonial | Muted reds/blues, early American |
| Old Newspaper | Black/white, vintage print |
| Fairytale | Purple/gold, magical storybook |

### 🌓 Light/Dark Mode
- Toggle between light and dark modes
- Each theme has unique dark mode colors
- Preferences saved to localStorage

### 🔍 Search Functionality
- Full-text search across all pages
- Search result highlighting
- Navigate between results
- Keyboard shortcut: `Ctrl+F`

### 🔊 Audio Reader (Text-to-Speech)
- Multiple voice options
- Adjustable speed (0.5x - 2x)
- Pitch control
- Play, pause, stop, rewind, forward controls
- Visual word highlighting during playback

### 📥 Export Options
- **PDF** - Vintage-styled printable document
- **TXT** - Plain text file
- **HTML** - Styled web page
- **EPUB** - E-reader compatible format

### 📖 Reading Features
- Realistic 3D book appearance
- Aged paper textures & coffee stains
- Drop caps (decorative first letters)
- Book spine with title
- Page edges effect
- Bookmark ribbon
- Keyboard navigation (Arrow keys, Space)
- Font size adjustment (70%-150%)
- Reading progress tracking
- Fullscreen mode

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for PDF.js and JSZip CDN)

# 🎮 Usage Guide

## 📤 Uploading Content

### Drag & Drop
- Drag a **PDF, EPUB, or TXT** file onto the upload zone

### Click to Browse
- Click the upload zone or the **“Browse Files”** button
- Select a file from the file dialog

### Paste Text
- Paste text directly into the text area
- Add a custom **book title** and **author name**

### Demo Mode
- Click **“Try with sample text”** to load demo content

---

## 📖 Reading Controls

| Action | Control |
|------|--------|
| Next Page | → / ↓ / Space / Click **Next** |
| Previous Page | ← / ↑ / Click **Previous** |
| Toggle Bookmark | Click bookmark ribbon |
| Change Theme | Click 🎨 button |
| Toggle Dark Mode | Click 🌙 / ☀️ button |
| Search | Click 🔍 or **Ctrl + F** |
| Audio Reader | Click 🔊 button |
| Export | Click 📥 button |
| Table of Contents | Click 📑 button |
| Fullscreen | Click ⛶ button |
| Increase Font | Click **A+** |
| Decrease Font | Click **A-** |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| ← / ↑ | Previous page |
| → / ↓ / Space | Next page |
| Ctrl + F | Open search |
| Escape | Close modals |
| F11 | Fullscreen (browser) |


## 📐 Adjusting Page Size

You can control how much text appears on each page by modifying the `charsPerPage` value in `script.js`.

### Location
```js
const state = {
    // ...
    charsPerPage: 1400 // Adjust this value
};


# Feature Support Notes

## 📄 PDF Reading
- Requires an internet connection for **PDF.js CDN**

## 📚 EPUB Reading
- Requires an internet connection for **JSZip CDN**

## 🔊 Text-to-Speech
- Uses the **Web Speech API**
- Browser-dependent support

## 🖥️ Fullscreen
- Uses the **Fullscreen API**

## 💾 Preferences Storage
- Requires **localStorage** for saving user preferences

---

# 🐛 Troubleshooting

## PDF Not Loading
- Ensure you have an active internet connection
- Check if the **PDF.js CDN** is accessible
- Try loading a different PDF file
- Open the browser console and check for errors

## EPUB Not Loading
- Ensure you have an active internet connection
- Check if the **JSZip CDN** is accessible
- Verify the EPUB file is **not DRM-protected**
- Try converting the EPUB to **TXT** first

## Text-to-Speech Not Working
- Confirm the browser supports the **Web Speech API**
- Try a different browser (**Chrome recommended**)
- Ensure your system has voice packages installed

## Styles Not Applying
- Clear the browser cache
- Check for CSS syntax errors
- Verify all file paths are correct

## Performance Issues
- Reduce page size for large documents
- Close the audio panel when not in use
- Disable animations if necessary


<p align="center"> Made with ❤️ for book lovers everywhere <br> <strong>📚 Happy Reading! 📚</strong> </p>