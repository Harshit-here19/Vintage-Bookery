/* ============================================
   VINTAGE BOOKERY - COMPLETE JAVASCRIPT
   Version: 2.0
   Features: PDF, EPUB, TXT support, Search,
             Audio Reader, Export, Themes
   ============================================ */

// Initialize PDF.js
if (typeof pdfjsLib !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

/* ============================================
   STATE MANAGEMENT
   ============================================ */

const state = {
  theme: "classic",
  mode: "light",
  text: "",
  title: "Untitled Book",
  author: "Unknown Author",
  pages: [],
  currentPage: 0,
  fontSize: 100,
  bookmarks: new Set(),
  charsPerPage: 900,
};

const epubState = {
  metadata: null,
  chapters: [],
  toc: [],
  currentFile: null,
};

const searchState = {
  results: [],
  currentIndex: 0,
  searchTerm: "",
};

const exportState = {
  format: "pdf",
};

/* ============================================
   DOM ELEMENTS
   ============================================ */

const elements = {};

function cacheElements() {
  // Upload Screen
  elements.uploadScreen = document.getElementById("uploadScreen");
  elements.dropZone = document.getElementById("dropZone");
  elements.fileInput = document.getElementById("fileInput");
  elements.browseBtn = document.getElementById("browseBtn");
  elements.textInput = document.getElementById("textInput");
  elements.bookTitle = document.getElementById("bookTitle");
  elements.authorName = document.getElementById("authorName");
  elements.createBtn = document.getElementById("createBtn");
  elements.demoBtn = document.getElementById("demoBtn");
  elements.errorMsg = document.getElementById("errorMsg");
  elements.themeGrid = document.getElementById("themeGrid");
  elements.modeToggle = document.getElementById("modeToggle");

  // Reader Screen
  elements.readerScreen = document.getElementById("readerScreen");
  elements.backBtn = document.getElementById("backBtn");
  elements.displayTitle = document.getElementById("displayTitle");
  elements.displayAuthor = document.getElementById("displayAuthor");
  elements.spineTitle = document.getElementById("spineTitle");
  elements.bookOpen = document.getElementById("bookOpen");
  elements.pageLeft = document.getElementById("pageLeft");
  elements.pageRight = document.getElementById("pageRight");
  elements.leftContent = document.getElementById("leftContent");
  elements.rightContent = document.getElementById("rightContent");
  elements.leftPageNum = document.getElementById("leftPageNum");
  elements.rightPageNum = document.getElementById("rightPageNum");
  elements.leftHeaderText = document.getElementById("leftHeaderText");
  elements.rightHeaderText = document.getElementById("rightHeaderText");
  elements.prevBtn = document.getElementById("prevBtn");
  elements.nextBtn = document.getElementById("nextBtn");
  elements.pageInfo = document.getElementById("pageInfo");
  elements.progressFill = document.getElementById("progressFill");
  elements.progressText = document.getElementById("progressText");
  elements.bookmark = document.getElementById("bookmark");

  // Controls
  elements.fontDown = document.getElementById("fontDown");
  elements.fontUp = document.getElementById("fontUp");
  elements.fontSizeDisplay = document.getElementById("fontSizeDisplay");
  elements.themeBtn = document.getElementById("themeBtn");
  elements.themeDropdown = document.getElementById("themeDropdown");
  elements.darkModeBtn = document.getElementById("darkModeBtn");
  elements.tocBtn = document.getElementById("tocBtn");
  elements.fullscreenBtn = document.getElementById("fullscreenBtn");

  // Modals
  elements.tocModal = document.getElementById("tocModal");
  elements.tocClose = document.getElementById("tocClose");
  elements.tocList = document.getElementById("tocList");
  elements.loadingOverlay = document.getElementById("loadingOverlay");
  elements.loadingText = document.getElementById("loadingText");

  // Search Elements
  elements.searchModal = document.getElementById("searchModal");
  elements.searchClose = document.getElementById("searchClose");
  elements.searchInput = document.getElementById("searchInput");
  elements.searchBtn = document.getElementById("searchBtn");
  elements.searchStats = document.getElementById("searchStats");
  elements.searchNavigation = document.getElementById("searchNavigation");
  elements.searchPrev = document.getElementById("searchPrev");
  elements.searchNext = document.getElementById("searchNext");
  elements.searchPosition = document.getElementById("searchPosition");
  elements.searchResults = document.getElementById("searchResults");
  elements.searchOpenBtn = document.getElementById("searchOpenBtn");

  // Export Elements
  elements.exportModal = document.getElementById("exportModal");
  elements.exportClose = document.getElementById("exportClose");
  elements.exportOpenBtn = document.getElementById("exportOpenBtn");
  elements.exportBtn = document.getElementById("exportBtn");
  elements.exportProgress = document.getElementById("exportProgress");
  elements.exportProgressFill = document.getElementById("exportProgressFill");
  elements.exportProgressText = document.getElementById("exportProgressText");
  elements.exportIncludeCover = document.getElementById("exportIncludeCover");
  elements.exportVintageStyle = document.getElementById("exportVintageStyle");
  elements.exportPageSize = document.getElementById("exportPageSize");
}

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  cacheElements();
  setupEventListeners();
  loadSavedPreferences();
  initSearch();
  initExport();
});

function setupEventListeners() {
  // Theme selection on upload screen
  if (elements.themeGrid) {
    elements.themeGrid.addEventListener("click", function (e) {
      const option = e.target.closest(".theme-option");
      if (option) {
        selectTheme(option.dataset.theme);
      }
    });
  }

  // Mode toggle
  if (elements.modeToggle) {
    elements.modeToggle.addEventListener("change", function () {
      toggleMode(this.checked ? "dark" : "light");
    });
  }

  // File handling
  if (elements.browseBtn) {
    elements.browseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      elements.fileInput.click();
    });
  }

  if (elements.dropZone) {
    elements.dropZone.addEventListener("click", function (e) {
      if (e.target !== elements.browseBtn && !e.target.closest(".browse-btn")) {
        elements.fileInput.click();
      }
    });

    elements.dropZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("drag-over");
    });

    elements.dropZone.addEventListener("dragleave", function () {
      this.classList.remove("drag-over");
    });

    elements.dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("drag-over");
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        showFileTypeIndicator(file);
        handleFile(file);
      }
    });
  }

  if (elements.fileInput) {
    elements.fileInput.addEventListener("change", function () {
      if (this.files.length > 0) {
        const file = this.files[0];
        showFileTypeIndicator(file);
        handleFile(file);
      }
    });
  }

  // Create book
  if (elements.createBtn) {
    elements.createBtn.addEventListener("click", createBook);
  }

  if (elements.demoBtn) {
    elements.demoBtn.addEventListener("click", loadDemoText);
  }

  // Navigation
  if (elements.prevBtn) {
    elements.prevBtn.addEventListener("click", prevPage);
  }

  if (elements.nextBtn) {
    elements.nextBtn.addEventListener("click", nextPage);
  }

  if (elements.backBtn) {
    elements.backBtn.addEventListener("click", goBack);
  }

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (
      !elements.readerScreen ||
      !elements.readerScreen.classList.contains("active")
    )
      return;

    // Don't trigger if typing in an input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        prevPage();
        break;
      case "ArrowRight":
      case "ArrowDown":
      case " ":
        e.preventDefault();
        nextPage();
        break;
      case "Escape":
        closeAllModals();
        break;
      case "f":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (elements.searchModal) {
            elements.searchModal.classList.add("active");
            if (elements.searchInput) {
              elements.searchInput.focus();
            }
          }
        }
        break;
    }
  });

  // Font controls
  if (elements.fontDown) {
    elements.fontDown.addEventListener("click", function () {
      adjustFontSize(-10);
    });
  }

  if (elements.fontUp) {
    elements.fontUp.addEventListener("click", function () {
      adjustFontSize(10);
    });
  }

  // Theme dropdown in reader
  if (elements.themeBtn) {
    elements.themeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (elements.themeDropdown) {
        elements.themeDropdown.classList.toggle("active");
      }
    });
  }

  if (elements.themeDropdown) {
    elements.themeDropdown.addEventListener("click", function (e) {
      const item = e.target.closest(".dropdown-item");
      if (item) {
        selectTheme(item.dataset.theme);
        elements.themeDropdown.classList.remove("active");
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (elements.themeDropdown && !e.target.closest(".control-group")) {
      elements.themeDropdown.classList.remove("active");
    }
  });

  // Dark mode toggle in reader
  if (elements.darkModeBtn) {
    elements.darkModeBtn.addEventListener("click", function () {
      toggleMode(state.mode === "light" ? "dark" : "light");
    });
  }

  // Table of contents
  if (elements.tocBtn) {
    elements.tocBtn.addEventListener("click", function () {
      if (elements.tocModal) {
        elements.tocModal.classList.add("active");
      }
    });
  }

  if (elements.tocClose) {
    elements.tocClose.addEventListener("click", function () {
      if (elements.tocModal) {
        elements.tocModal.classList.remove("active");
      }
    });
  }

  if (elements.tocModal) {
    elements.tocModal.addEventListener("click", function (e) {
      if (e.target === elements.tocModal) {
        elements.tocModal.classList.remove("active");
      }
    });
  }

  // Fullscreen
  if (elements.fullscreenBtn) {
    elements.fullscreenBtn.addEventListener("click", toggleFullscreen);
  }

  // Bookmark
  if (elements.bookmark) {
    elements.bookmark.addEventListener("click", toggleBookmark);
  }
}

/* ============================================
   THEME & MODE MANAGEMENT
   ============================================ */

function selectTheme(theme) {
  if (!theme) return;

  state.theme = theme;
  document.body.dataset.theme = theme;

  // Update upload screen selection
  document.querySelectorAll(".theme-option").forEach(function (opt) {
    opt.classList.toggle("active", opt.dataset.theme === theme);
  });

  // Update dropdown selection
  document.querySelectorAll(".dropdown-item").forEach(function (item) {
    item.classList.toggle("active", item.dataset.theme === theme);
  });

  savePreferences();
}

function toggleMode(mode) {
  if (!mode) return;

  state.mode = mode;
  document.body.dataset.mode = mode;

  if (elements.modeToggle) {
    elements.modeToggle.checked = mode === "dark";
  }

  if (elements.darkModeBtn) {
    elements.darkModeBtn.textContent = mode === "dark" ? "☀️" : "🌙";
  }

  savePreferences();
}

function savePreferences() {
  try {
    localStorage.setItem(
      "vintageBookery",
      JSON.stringify({
        theme: state.theme,
        mode: state.mode,
        fontSize: state.fontSize,
      }),
    );
  } catch (e) {
    console.warn("Could not save preferences:", e);
  }
}

function loadSavedPreferences() {
  try {
    const saved = localStorage.getItem("vintageBookery");
    if (saved) {
      const prefs = JSON.parse(saved);
      if (prefs.theme) selectTheme(prefs.theme);
      if (prefs.mode) toggleMode(prefs.mode);
      if (prefs.fontSize) {
        state.fontSize = prefs.fontSize;
        updateFontSize();
      }
    }
  } catch (e) {
    console.warn("Could not load preferences:", e);
  }
}

/* ============================================
   FILE HANDLING
   ============================================ */

function handleFile(file) {
  if (!file) return;

  const extension = file.name.split(".").pop().toLowerCase();

  showLoading("Reading your file...");

  // Store current file info
  epubState.currentFile = {
    name: file.name,
    size: formatFileSize(file.size),
    type: extension.toUpperCase(),
  };

  // Clear previous EPUB metadata
  hideEpubMetadata();

  switch (extension) {
    case "txt":
    case "text":
      readTextFile(file);
      break;
    case "pdf":
      readPdfFile(file);
      break;
    case "epub":
      readEpubFile(file);
      break;
    default:
      hideLoading();
      showError("Unsupported file format. Please use PDF, EPUB, or TXT files.");
  }
}

function readTextFile(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    if (elements.textInput) {
      elements.textInput.value = e.target.result;
    }
    hideLoading();

    // Auto-set title from filename
    if (elements.bookTitle && !elements.bookTitle.value) {
      elements.bookTitle.value = file.name.replace(/\.[^/.]+$/, "");
    }
  };

  reader.onerror = function () {
    hideLoading();
    showError("Error reading file. Please try again.");
  };

  reader.readAsText(file);
}

function readPdfFile(file) {
  if (typeof pdfjsLib === "undefined") {
    hideLoading();
    showError(
      "PDF support requires internet connection. Please try a text file.",
    );
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const typedArray = new Uint8Array(e.target.result);

    pdfjsLib
      .getDocument(typedArray)
      .promise.then(function (pdf) {
        updateLoadingText("Extracting " + pdf.numPages + " pages...");

        const textPromises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          textPromises.push(extractPdfPageText(pdf, i));
        }

        return Promise.all(textPromises);
      })
      .then(function (pageTexts) {
        if (elements.textInput) {
          elements.textInput.value = pageTexts.join("\n\n");
        }
        hideLoading();

        if (elements.bookTitle && !elements.bookTitle.value) {
          elements.bookTitle.value = file.name.replace(/\.[^/.]+$/, "");
        }
      })
      .catch(function (err) {
        hideLoading();
        showError("Error reading PDF: " + err.message);
      });
  };

  reader.onerror = function () {
    hideLoading();
    showError("Error reading file. Please try again.");
  };

  reader.readAsArrayBuffer(file);
}

function extractPdfPageText(pdf, pageNum) {
  return pdf
    .getPage(pageNum)
    .then(function (page) {
      return page.getTextContent();
    })
    .then(function (textContent) {
      return textContent.items
        .map(function (item) {
          return item.str;
        })
        .join(" ");
    });
}

/* ============================================
   EPUB FILE HANDLING
   ============================================ */

function readEpubFile(file) {
  if (typeof JSZip === "undefined") {
    hideLoading();
    showError("EPUB support requires JSZip library. Please refresh the page.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const arrayBuffer = e.target.result;

    parseEpub(arrayBuffer, file.name)
      .then(function (result) {
        // Set text content
        if (elements.textInput) {
          elements.textInput.value = result.text;
        }

        // Set metadata
        if (result.metadata) {
          if (
            result.metadata.title &&
            elements.bookTitle &&
            !elements.bookTitle.value
          ) {
            elements.bookTitle.value = result.metadata.title;
          }
          if (
            result.metadata.creator &&
            elements.authorName &&
            !elements.authorName.value
          ) {
            elements.authorName.value = result.metadata.creator;
          }
        }

        // Store EPUB data
        epubState.metadata = result.metadata;
        epubState.chapters = result.chapters;
        epubState.toc = result.toc;

        hideLoading();
        showEpubMetadata(result);
      })
      .catch(function (error) {
        hideLoading();
        showError("Error reading EPUB: " + error.message);
        console.error("EPUB Error:", error);
      });
  };

  reader.onerror = function () {
    hideLoading();
    showError("Error reading file. Please try again.");
  };

  reader.readAsArrayBuffer(file);
}

function parseEpub(arrayBuffer, fileName) {
  return new Promise(function (resolve, reject) {
    JSZip.loadAsync(arrayBuffer)
      .then(function (zip) {
        updateLoadingText("Extracting EPUB contents...");

        // Find container.xml
        const containerFile = zip.file("META-INF/container.xml");
        if (!containerFile) {
          throw new Error("Invalid EPUB: No container.xml found");
        }

        return containerFile.async("string").then(function (containerXml) {
          const parser = new DOMParser();
          const containerDoc = parser.parseFromString(
            containerXml,
            "application/xml",
          );
          const rootfile = containerDoc.querySelector("rootfile");

          if (!rootfile) {
            throw new Error("Invalid EPUB: No rootfile found");
          }

          const opfPath = rootfile.getAttribute("full-path");
          const opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

          return { zip: zip, opfPath: opfPath, opfDir: opfDir };
        });
      })
      .then(function (data) {
        updateLoadingText("Reading book metadata...");

        const opfFile = data.zip.file(data.opfPath);
        if (!opfFile) {
          throw new Error("Invalid EPUB: Cannot find content file");
        }

        return opfFile.async("string").then(function (opfContent) {
          const parser = new DOMParser();
          const opfDoc = parser.parseFromString(opfContent, "application/xml");

          const metadata = extractEpubMetadata(opfDoc);
          const spine = extractSpineOrder(opfDoc);
          const manifest = extractManifest(opfDoc);

          return {
            zip: data.zip,
            opfDir: data.opfDir,
            metadata: metadata,
            spine: spine,
            manifest: manifest,
          };
        });
      })
      .then(function (data) {
        updateLoadingText("Extracting chapters...");

        const contentPromises = [];

        data.spine.forEach(function (itemId, index) {
          const item = data.manifest[itemId];
          if (
            item &&
            (item.mediaType === "application/xhtml+xml" ||
              item.mediaType === "text/html")
          ) {
            let filePath = data.opfDir + item.href;
            filePath = filePath.replace(/^\/+/, "");

            const zipFile = data.zip.file(filePath) || data.zip.file(item.href);

            if (zipFile) {
              contentPromises.push(
                zipFile
                  .async("string")
                  .then(function (content) {
                    return {
                      index: index,
                      id: itemId,
                      content: content,
                      href: item.href,
                    };
                  })
                  .catch(function () {
                    return null;
                  }),
              );
            }
          }
        });

        return Promise.all(contentPromises).then(function (results) {
          const validResults = results
            .filter(function (r) {
              return r !== null;
            })
            .sort(function (a, b) {
              return a.index - b.index;
            });

          return { metadata: data.metadata, chapters: validResults };
        });
      })
      .then(function (data) {
        updateLoadingText("Processing content...");

        let fullText = "";
        const processedChapters = [];
        const totalChapters = data.chapters.length;

        data.chapters.forEach(function (chapter, idx) {
          const progress = Math.round((idx / totalChapters) * 100);
          updateLoadingProgress(progress);

          const chapterText = extractTextFromHtml(chapter.content);
          const chapterTitle =
            extractChapterTitle(chapter.content) || "Chapter " + (idx + 1);

          if (chapterText.trim()) {
            processedChapters.push({
              title: chapterTitle,
              text: chapterText,
              index: idx,
            });

            if (fullText) {
              fullText += "\n\n";
            }
            fullText += chapterTitle.toUpperCase() + "\n\n";
            fullText += chapterText;
          }
        });

        resolve({
          text: fullText,
          metadata: data.metadata,
          chapters: processedChapters,
          toc: processedChapters.map(function (ch) {
            return { title: ch.title, index: ch.index };
          }),
        });
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

function extractEpubMetadata(opfDoc) {
  const metadata = {};

  const metadataEl =
    opfDoc.querySelector("metadata") ||
    opfDoc.getElementsByTagName("metadata")[0];

  if (!metadataEl) return metadata;

  // Helper function to get element text
  function getMetaText(names) {
    for (let i = 0; i < names.length; i++) {
      const el =
        metadataEl.querySelector(names[i]) ||
        metadataEl.getElementsByTagName(names[i])[0] ||
        metadataEl.querySelector("dc\\:" + names[i]) ||
        metadataEl.getElementsByTagNameNS(
          "http://purl.org/dc/elements/1.1/",
          names[i],
        )[0];
      if (el && el.textContent) {
        return el.textContent.trim();
      }
    }
    return null;
  }

  metadata.title = getMetaText(["title", "dc:title"]);
  metadata.creator = getMetaText(["creator", "dc:creator"]);
  metadata.publisher = getMetaText(["publisher", "dc:publisher"]);
  metadata.language = getMetaText(["language", "dc:language"]);
  metadata.description = getMetaText(["description", "dc:description"]);
  metadata.date = getMetaText(["date", "dc:date"]);
  metadata.subject = getMetaText(["subject", "dc:subject"]);

  return metadata;
}

function extractSpineOrder(opfDoc) {
  const spine = [];
  const spineEl =
    opfDoc.querySelector("spine") || opfDoc.getElementsByTagName("spine")[0];

  if (spineEl) {
    const itemrefs = spineEl.querySelectorAll("itemref");
    itemrefs.forEach(function (itemref) {
      const idref = itemref.getAttribute("idref");
      if (idref) {
        spine.push(idref);
      }
    });
  }

  return spine;
}

function extractManifest(opfDoc) {
  const manifest = {};
  const manifestEl =
    opfDoc.querySelector("manifest") ||
    opfDoc.getElementsByTagName("manifest")[0];

  if (manifestEl) {
    const items = manifestEl.querySelectorAll("item");
    items.forEach(function (item) {
      const id = item.getAttribute("id");
      const href = item.getAttribute("href");
      const mediaType = item.getAttribute("media-type");

      if (id) {
        manifest[id] = { href: href, mediaType: mediaType };
      }
    });
  }

  return manifest;
}

function extractTextFromHtml(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  // Remove unwanted elements
  const unwanted = doc.querySelectorAll(
    "script, style, noscript, nav, header, footer",
  );
  unwanted.forEach(function (el) {
    el.remove();
  });

  const body = doc.body || doc.documentElement;
  if (!body) return "";

  let text = "";
  const textElements = body.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, div, li, blockquote, span",
  );

  if (textElements.length > 0) {
    const processedTexts = [];

    textElements.forEach(function (el) {
      const elText = el.textContent.trim();
      if (elText && elText.length > 0) {
        const tagName = el.tagName.toLowerCase();
        if (tagName.match(/^h[1-6]$/)) {
          processedTexts.push("\n" + elText + "\n");
        } else if (!el.querySelector("p, div, li")) {
          processedTexts.push(elText);
        }
      }
    });

    text = processedTexts.join("\n\n");
  } else {
    text = body.textContent || "";
  }

  return text
    .replace(/[\r\n]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extractChapterTitle(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const headings = ["h1", "h2", "h3", "title"];

  for (let i = 0; i < headings.length; i++) {
    const heading = doc.querySelector(headings[i]);
    if (heading && heading.textContent.trim()) {
      const text = heading.textContent.trim();
      if (text.length < 100) {
        return text;
      }
    }
  }

  return null;
}

function showEpubMetadata(result) {
  let metadataDiv = document.getElementById("epubMetadata");

  if (!metadataDiv && elements.textInput) {
    metadataDiv = document.createElement("div");
    metadataDiv.id = "epubMetadata";
    metadataDiv.className = "epub-metadata";
    elements.textInput.parentElement.appendChild(metadataDiv);
  }

  if (!metadataDiv) return;

  const metadata = result.metadata || {};
  const chapters = result.chapters || [];

  let html = '<div class="epub-metadata-title">📚 EPUB Information</div>';

  if (metadata.title) {
    html +=
      '<div class="epub-metadata-item"><span class="epub-metadata-label">Title:</span><span class="epub-metadata-value">' +
      escapeHtml(metadata.title) +
      "</span></div>";
  }
  if (metadata.creator) {
    html +=
      '<div class="epub-metadata-item"><span class="epub-metadata-label">Author:</span><span class="epub-metadata-value">' +
      escapeHtml(metadata.creator) +
      "</span></div>";
  }
  if (metadata.publisher) {
    html +=
      '<div class="epub-metadata-item"><span class="epub-metadata-label">Publisher:</span><span class="epub-metadata-value">' +
      escapeHtml(metadata.publisher) +
      "</span></div>";
  }
  if (metadata.language) {
    html +=
      '<div class="epub-metadata-item"><span class="epub-metadata-label">Language:</span><span class="epub-metadata-value">' +
      escapeHtml(metadata.language) +
      "</span></div>";
  }

  html +=
    '<div class="epub-metadata-item"><span class="epub-metadata-label">Chapters:</span><span class="epub-metadata-value">' +
    chapters.length +
    "</span></div>";

  const charCount = result.text ? result.text.length : 0;
  html +=
    '<div class="epub-metadata-item"><span class="epub-metadata-label">Characters:</span><span class="epub-metadata-value">' +
    charCount.toLocaleString() +
    "</span></div>";

  if (chapters.length > 0) {
    html += '<div class="epub-chapters">';
    chapters.slice(0, 10).forEach(function (chapter, idx) {
      html += '<div class="epub-chapter-item">';
      html += '<span class="chapter-num">' + (idx + 1) + "</span>";
      html += "<span>" + escapeHtml(chapter.title) + "</span>";
      html += "</div>";
    });
    if (chapters.length > 10) {
      html +=
        '<div class="epub-chapter-item" style="opacity:0.6;font-style:italic;">...and ' +
        (chapters.length - 10) +
        " more chapters</div>";
    }
    html += "</div>";
  }

  metadataDiv.innerHTML = html;
  metadataDiv.style.display = "block";
}

function hideEpubMetadata() {
  const metadataDiv = document.getElementById("epubMetadata");
  if (metadataDiv) {
    metadataDiv.style.display = "none";
  }
}

function showFileTypeIndicator(file) {
  let indicator = document.getElementById("fileTypeIndicator");

  if (!indicator && elements.dropZone) {
    indicator = document.createElement("div");
    indicator.id = "fileTypeIndicator";
    indicator.className = "file-type-indicator";

    indicator.innerHTML =
      '<span class="file-icon"></span>' +
      '<div class="file-info">' +
      '<span class="file-name"></span>' +
      '<span class="file-size"></span>' +
      "</div>" +
      '<button class="file-remove" title="Remove file">✕</button>';

    elements.dropZone.appendChild(indicator);

    indicator
      .querySelector(".file-remove")
      .addEventListener("click", function (e) {
        e.stopPropagation();
        clearFileSelection();
        indicator.classList.remove("active");
      });
  }

  if (!indicator) return;

  const extension = file.name.split(".").pop().toLowerCase();
  const icons = {
    pdf: "📄",
    epub: "📚",
    txt: "📝",
    text: "📝",
  };

  indicator.querySelector(".file-icon").textContent = icons[extension] || "📄";
  indicator.querySelector(".file-name").textContent = file.name;
  indicator.querySelector(".file-size").textContent = formatFileSize(file.size);
  indicator.classList.add("active");
}

function clearFileSelection() {
  if (elements.fileInput) {
    elements.fileInput.value = "";
  }
  if (elements.textInput) {
    elements.textInput.value = "";
  }
  epubState.currentFile = null;
  epubState.metadata = null;
  epubState.chapters = [];
  epubState.toc = [];
  hideEpubMetadata();
}

/* ============================================
   BOOK CREATION
   ============================================ */

function createBook() {
  const text = elements.textInput ? elements.textInput.value.trim() : "";

  if (!text) {
    showError("Please upload a file or paste some text.");
    return;
  }

  if (text.length < 50) {
    showError("Please provide more content for your book.");
    return;
  }

  showLoading("Creating your vintage book...");

  state.text = text;
  state.title =
    (elements.bookTitle && elements.bookTitle.value.trim()) || "Untitled Book";
  state.author =
    (elements.authorName && elements.authorName.value.trim()) ||
    "Unknown Author";
  state.currentPage = 0;
  state.bookmarks.clear();

  // Paginate
  paginateText();

  // Generate TOC
  generateTableOfContents();

  // Show reader
  setTimeout(function () {
    hideLoading();
    showReader();
    renderPages();
  }, 800);
}

function paginateText() {
  state.pages = [];

  let text = state.text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  const paragraphs = text.split(/\n\n+/);

  let currentPage = "";
  let charCount = 0;
  const charsPerPage = Math.floor(state.charsPerPage * (100 / state.fontSize));

  paragraphs.forEach(function (para) {
    para = para.trim();
    if (!para) return;

    if (charCount + para.length > charsPerPage && currentPage) {
      state.pages.push(currentPage);
      currentPage = "";
      charCount = 0;
    }

    currentPage += "<p>" + escapeHtml(para) + "</p>";
    charCount += para.length;
  });

  if (currentPage) {
    state.pages.push(currentPage);
  }

  if (state.pages.length === 0) {
    state.pages.push("<p>" + escapeHtml(state.text.substring(0, 500)) + "</p>");
  }
}

function generateTableOfContents() {
  if (!elements.tocList) return;

  elements.tocList.innerHTML = "";

  // Use EPUB chapters if available
  if (epubState.chapters && epubState.chapters.length > 0) {
    epubState.chapters.forEach(function (chapter, idx) {
      let pageIndex = findPageForChapter(chapter.title);

      const item = document.createElement("div");
      item.className = "toc-item";
      item.innerHTML =
        '<span class="toc-item-title">' +
        escapeHtml(chapter.title) +
        "</span>" +
        '<span class="toc-item-page">Page ' +
        (pageIndex + 1) +
        "</span>";
      item.dataset.page = pageIndex;

      item.addEventListener("click", function () {
        state.currentPage = Math.floor(parseInt(this.dataset.page) / 2) * 2;
        renderPages();
        if (elements.tocModal) {
          elements.tocModal.classList.remove("active");
        }
        animatePageTurn();
      });

      elements.tocList.appendChild(item);
    });
  } else {
    // Default sections
    const sectionsCount = Math.min(12, Math.ceil(state.pages.length / 4));

    for (let i = 0; i < sectionsCount; i++) {
      const pageNum = i * Math.floor(state.pages.length / sectionsCount);

      const item = document.createElement("div");
      item.className = "toc-item";
      item.innerHTML =
        '<span class="toc-item-title">Section ' +
        (i + 1) +
        "</span>" +
        '<span class="toc-item-page">Page ' +
        (pageNum + 1) +
        "</span>";
      item.dataset.page = pageNum;

      item.addEventListener("click", function () {
        state.currentPage = Math.floor(parseInt(this.dataset.page) / 2) * 2;
        renderPages();
        if (elements.tocModal) {
          elements.tocModal.classList.remove("active");
        }
        animatePageTurn();
      });

      elements.tocList.appendChild(item);
    }
  }
}

function findPageForChapter(chapterTitle) {
  const titleUpper = chapterTitle.toUpperCase();
  let charCount = 0;

  for (let i = 0; i < state.pages.length; i++) {
    const pageText = state.pages[i].replace(/<[^>]+>/g, "").toUpperCase();
    if (pageText.includes(titleUpper)) {
      return i;
    }
    charCount += pageText.length;
  }

  return 0;
}

/* ============================================
   RENDERING
   ============================================ */

function showReader() {
  if (elements.uploadScreen) {
    elements.uploadScreen.classList.add("hidden");
  }
  if (elements.readerScreen) {
    elements.readerScreen.classList.add("active");
  }

  if (elements.displayTitle) {
    elements.displayTitle.textContent = state.title;
  }
  if (elements.displayAuthor) {
    elements.displayAuthor.textContent = "by " + state.author;
  }
  if (elements.spineTitle) {
    elements.spineTitle.textContent = state.title;
  }
}

function renderPages() {
  const leftIdx = state.currentPage;
  const rightIdx = state.currentPage + 1;
  const total = state.pages.length;

  // Left page
  if (elements.leftContent) {
    if (leftIdx < total) {
      elements.leftContent.innerHTML = state.pages[leftIdx];
      addDropCap(elements.leftContent);
    } else {
      elements.leftContent.innerHTML =
        '<p class="end-text" style="text-align:center;font-style:italic;color:var(--ink-faded);">— The End —</p>';
    }
  }

  if (elements.leftPageNum) {
    elements.leftPageNum.textContent = leftIdx < total ? leftIdx + 1 : "";
  }

  // Right page
  if (elements.rightContent) {
    if (rightIdx < total) {
      elements.rightContent.innerHTML = state.pages[rightIdx];
    } else {
      elements.rightContent.innerHTML = "";
    }
  }

  if (elements.rightPageNum) {
    elements.rightPageNum.textContent = rightIdx < total ? rightIdx + 1 : "";
  }

  // Headers
  if (elements.leftHeaderText) {
    elements.leftHeaderText.textContent = state.title;
  }
  if (elements.rightHeaderText) {
    elements.rightHeaderText.textContent = state.author;
  }

  // Navigation state
  if (elements.prevBtn) {
    elements.prevBtn.disabled = state.currentPage === 0;
  }
  if (elements.nextBtn) {
    elements.nextBtn.disabled = rightIdx >= total - 1;
  }

  // Page info
  if (elements.pageInfo) {
    const startPage = leftIdx + 1;
    const endPage = Math.min(rightIdx + 1, total);
    elements.pageInfo.textContent =
      "Pages " + startPage + "-" + endPage + " of " + total;
  }

  // Progress
  const progress = Math.round(((rightIdx + 1) / total) * 100);
  if (elements.progressFill) {
    elements.progressFill.style.width = Math.min(progress, 100) + "%";
  }
  if (elements.progressText) {
    elements.progressText.textContent = Math.min(progress, 100) + "%";
  }

  // Bookmark state
  if (elements.bookmark) {
    const hasBookmark =
      state.bookmarks.has(leftIdx) || state.bookmarks.has(rightIdx);
    elements.bookmark.classList.toggle("active", hasBookmark);
  }

  // Apply font size
  updateFontSize();

  // Re-apply search highlights if active
  if (searchState.searchTerm) {
    highlightSearchTerm();
  }
}

function addDropCap(container) {
  if (!container) return;

  const firstP = container.querySelector("p:first-child");
  if (firstP && !firstP.classList.contains("end-text")) {
    firstP.classList.add("drop-cap");
  }
}

/* ============================================
   NAVIGATION
   ============================================ */

function prevPage() {
  if (state.currentPage >= 2) {
    state.currentPage -= 2;
    animatePageTurn();
    renderPages();
  }
}

function nextPage() {
  if (state.currentPage + 2 < state.pages.length) {
    state.currentPage += 2;
    animatePageTurn();
    renderPages();
  }
}

function animatePageTurn() {
  if (elements.bookOpen) {
    elements.bookOpen.classList.add("turning");
    setTimeout(function () {
      elements.bookOpen.classList.remove("turning");
    }, 600);
  }
}

function goBack() {
  if (elements.readerScreen) {
    elements.readerScreen.classList.remove("active");
  }
  if (elements.uploadScreen) {
    elements.uploadScreen.classList.remove("hidden");
  }
}

/* ============================================
   CONTROLS
   ============================================ */

function adjustFontSize(delta) {
  state.fontSize = Math.max(70, Math.min(150, state.fontSize + delta));
  updateFontSize();
  savePreferences();

  // Re-paginate
  paginateText();

  if (state.currentPage >= state.pages.length) {
    state.currentPage = Math.max(0, state.pages.length - 2);
  }

  renderPages();
}

function updateFontSize() {
  const size = state.fontSize / 100;

  if (elements.leftContent) {
    elements.leftContent.style.fontSize = 1.1 * size + "rem";
  }
  if (elements.rightContent) {
    elements.rightContent.style.fontSize = 1.1 * size + "rem";
  }
  if (elements.fontSizeDisplay) {
    elements.fontSizeDisplay.textContent = state.fontSize + "%";
  }
}

function toggleBookmark() {
  const pageIdx = state.currentPage;

  if (state.bookmarks.has(pageIdx)) {
    state.bookmarks.delete(pageIdx);
    if (elements.bookmark) {
      elements.bookmark.classList.remove("active");
    }
  } else {
    state.bookmarks.add(pageIdx);
    if (elements.bookmark) {
      elements.bookmark.classList.add("active");
    }
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(function (err) {
      console.warn("Fullscreen error:", err);
    });
  } else {
    document.exitFullscreen();
  }
}

function closeAllModals() {
  if (elements.tocModal) {
    elements.tocModal.classList.remove("active");
  }
  if (elements.searchModal) {
    elements.searchModal.classList.remove("active");
  }
  if (elements.exportModal) {
    elements.exportModal.classList.remove("active");
  }
  if (elements.themeDropdown) {
    elements.themeDropdown.classList.remove("active");
  }
}

/* ============================================
   SEARCH FUNCTIONALITY
   ============================================ */

function initSearch() {
  if (!elements.searchOpenBtn) return;

  elements.searchOpenBtn.addEventListener("click", function () {
    if (elements.searchModal) {
      elements.searchModal.classList.add("active");
      if (elements.searchInput) {
        elements.searchInput.focus();
      }
    }
  });

  if (elements.searchClose) {
    elements.searchClose.addEventListener("click", function () {
      if (elements.searchModal) {
        elements.searchModal.classList.remove("active");
      }
      clearSearchHighlights();
    });
  }

  if (elements.searchModal) {
    elements.searchModal.addEventListener("click", function (e) {
      if (e.target === elements.searchModal) {
        elements.searchModal.classList.remove("active");
        clearSearchHighlights();
      }
    });
  }

  if (elements.searchBtn) {
    elements.searchBtn.addEventListener("click", performSearch);
  }

  if (elements.searchInput) {
    elements.searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }

  if (elements.searchPrev) {
    elements.searchPrev.addEventListener("click", function () {
      navigateSearchResult(-1);
    });
  }

  if (elements.searchNext) {
    elements.searchNext.addEventListener("click", function () {
      navigateSearchResult(1);
    });
  }
}

function performSearch() {
  const term = elements.searchInput
    ? elements.searchInput.value.trim().toLowerCase()
    : "";

  if (!term || term.length < 2) {
    showSearchMessage("Please enter at least 2 characters");
    return;
  }

  searchState.searchTerm = term;
  searchState.results = [];
  searchState.currentIndex = 0;

  state.pages.forEach(function (pageContent, pageIndex) {
    const plainText = pageContent.replace(/<[^>]+>/g, " ").toLowerCase();
    let position = 0;

    while ((position = plainText.indexOf(term, position)) !== -1) {
      const start = Math.max(0, position - 40);
      const end = Math.min(plainText.length, position + term.length + 40);
      const context = plainText.substring(start, end);

      searchState.results.push({
        pageIndex: pageIndex,
        position: position,
        context: context,
      });

      position += term.length;
    }
  });

  displaySearchResults();
}

function displaySearchResults() {
  const results = searchState.results;

  if (results.length === 0) {
    showSearchMessage('No results found for "' + searchState.searchTerm + '"');
    if (elements.searchNavigation) {
      elements.searchNavigation.classList.remove("active");
    }
    if (elements.searchResults) {
      elements.searchResults.innerHTML =
        '<p style="text-align:center;color:var(--ink-faded);padding:20px;">Try a different search term</p>';
    }
    return;
  }

  showSearchMessage(
    "Found " +
      results.length +
      ' result(s) for "' +
      searchState.searchTerm +
      '"',
  );

  if (elements.searchNavigation) {
    elements.searchNavigation.classList.add("active");
  }

  updateSearchPosition();

  if (elements.searchResults) {
    let html = "";
    results.forEach(function (result, index) {
      const highlightedContext = result.context.replace(
        new RegExp("(" + escapeRegex(searchState.searchTerm) + ")", "gi"),
        "<mark>$1</mark>",
      );

      html +=
        '<div class="search-result-item" data-index="' +
        index +
        '">' +
        '<div class="search-result-page">Page ' +
        (result.pageIndex + 1) +
        "</div>" +
        '<div class="search-result-text">...' +
        highlightedContext +
        "...</div>" +
        "</div>";
    });

    elements.searchResults.innerHTML = html;

    document.querySelectorAll(".search-result-item").forEach(function (item) {
      item.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        searchState.currentIndex = index;
        goToSearchResult(index);
      });
    });
  }
}

function showSearchMessage(message) {
  if (elements.searchStats) {
    elements.searchStats.textContent = message;
    elements.searchStats.classList.add("active");
  }
}

function navigateSearchResult(direction) {
  const newIndex = searchState.currentIndex + direction;

  if (newIndex >= 0 && newIndex < searchState.results.length) {
    searchState.currentIndex = newIndex;
    goToSearchResult(newIndex);
  }
}

function goToSearchResult(index) {
  const result = searchState.results[index];
  if (!result) return;

  state.currentPage = Math.floor(result.pageIndex / 2) * 2;
  renderPages();
  highlightSearchTerm();
  updateSearchPosition();

  if (elements.searchModal) {
    elements.searchModal.classList.remove("active");
  }
}

function updateSearchPosition() {
  if (elements.searchPosition) {
    elements.searchPosition.textContent =
      searchState.currentIndex + 1 + " of " + searchState.results.length;
  }
  if (elements.searchPrev) {
    elements.searchPrev.disabled = searchState.currentIndex === 0;
  }
  if (elements.searchNext) {
    elements.searchNext.disabled =
      searchState.currentIndex === searchState.results.length - 1;
  }
}

function highlightSearchTerm() {
  const term = searchState.searchTerm;
  if (!term) return;

  [elements.leftContent, elements.rightContent].forEach(function (container) {
    if (!container) return;

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(function (node) {
      const text = node.textContent;
      const regex = new RegExp("(" + escapeRegex(term) + ")", "gi");

      if (regex.test(text)) {
        const span = document.createElement("span");
        span.innerHTML = text.replace(
          regex,
          '<mark class="search-highlight">$1</mark>',
        );
        node.parentNode.replaceChild(span, node);
      }
    });
  });
}

function clearSearchHighlights() {
  document.querySelectorAll(".search-highlight").forEach(function (mark) {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });

  searchState.searchTerm = "";
}

/* ============================================
   EXPORT FUNCTIONALITY
   ============================================ */

function initExport() {
  if (!elements.exportOpenBtn) return;

  elements.exportOpenBtn.addEventListener("click", function () {
    if (elements.exportModal) {
      elements.exportModal.classList.add("active");
    }
  });

  if (elements.exportClose) {
    elements.exportClose.addEventListener("click", function () {
      if (elements.exportModal) {
        elements.exportModal.classList.remove("active");
      }
    });
  }

  if (elements.exportModal) {
    elements.exportModal.addEventListener("click", function (e) {
      if (e.target === elements.exportModal) {
        elements.exportModal.classList.remove("active");
      }
    });
  }

  // Export format selection
  document.querySelectorAll(".export-option").forEach(function (option) {
    option.addEventListener("click", function () {
      document.querySelectorAll(".export-option").forEach(function (o) {
        o.classList.remove("selected");
      });
      this.classList.add("selected");
      exportState.format = this.dataset.format;
    });
  });

  // Select PDF by default
  const pdfOption = document.querySelector('.export-option[data-format="pdf"]');
  if (pdfOption) {
    pdfOption.classList.add("selected");
  }

  if (elements.exportBtn) {
    elements.exportBtn.addEventListener("click", startExport);
  }
}

function startExport() {
  const format = exportState.format;

  if (elements.exportProgress) {
    elements.exportProgress.classList.add("active");
  }
  updateExportProgress(0, "Preparing export...");

  switch (format) {
    case "pdf":
      exportToPDF();
      break;
    case "txt":
      exportToTXT();
      break;
    case "html":
      exportToHTML();
      break;
    case "epub":
      exportToEPUB();
      break;
    default:
      exportToTXT();
  }
}

function exportToPDF() {
  if (typeof jspdf === "undefined" && typeof window.jspdf === "undefined") {
    updateExportProgress(
      100,
      "PDF library not loaded. Please refresh and try again.",
    );
    return;
  }

  const jsPDF = window.jspdf.jsPDF;

  const pageSize = elements.exportPageSize
    ? elements.exportPageSize.value
    : "a4";
  const includeCover = elements.exportIncludeCover
    ? elements.exportIncludeCover.checked
    : true;
  const vintageStyle = elements.exportVintageStyle
    ? elements.exportVintageStyle.checked
    : true;

  const sizes = {
    a4: [210, 297],
    letter: [215.9, 279.4],
    a5: [148, 210],
  };

  const dimensions = sizes[pageSize] || sizes["a4"];
  const width = dimensions[0];
  const height = dimensions[1];

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [width, height],
  });

  const margin = 20;
  const lineHeight = 7;
  const fontSize = pageSize === "a5" ? 10 : 12;
  const titleFontSize = pageSize === "a5" ? 20 : 24;
  let currentY = margin;

  const textColor = vintageStyle ? [44, 24, 16] : [0, 0, 0];
  const titleColor = vintageStyle ? [139, 0, 0] : [0, 0, 0];

  // Cover page
  if (includeCover) {
    updateExportProgress(5, "Creating cover page...");

    if (vintageStyle) {
      doc.setFillColor(244, 228, 193);
      doc.rect(0, 0, width, height, "F");

      doc.setDrawColor(101, 67, 33);
      doc.setLineWidth(2);
      doc.rect(10, 10, width - 20, height - 20);

      doc.setLineWidth(0.5);
      doc.rect(15, 15, width - 30, height - 30);
    }

    doc.setFont("times", "bold");
    doc.setFontSize(titleFontSize);
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);

    const titleLines = doc.splitTextToSize(state.title, width - margin * 2);
    const titleY = height / 3;
    titleLines.forEach(function (line, idx) {
      const textWidth = doc.getTextWidth(line);
      doc.text(line, (width - textWidth) / 2, titleY + idx * 12);
    });

    doc.setFont("times", "italic");
    doc.setFontSize(fontSize + 4);
    const authorText = "by " + state.author;
    const authorWidth = doc.getTextWidth(authorText);
    doc.text(
      authorText,
      (width - authorWidth) / 2,
      titleY + titleLines.length * 12 + 20,
    );

    doc.addPage();
  }

  // Content pages
  doc.setFont("times", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const totalPages = state.pages.length;

  state.pages.forEach(function (pageContent, pageIdx) {
    updateExportProgress(
      10 + (pageIdx / totalPages) * 80,
      "Exporting page " + (pageIdx + 1) + " of " + totalPages + "...",
    );

    if (pageIdx > 0) {
      doc.addPage();
    }

    currentY = margin;

    if (vintageStyle) {
      doc.setFillColor(244, 228, 193);
      doc.rect(0, 0, width, height, "F");
    }

    // Page header
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(state.title.substring(0, 50), margin, 10);

    doc.setFont("times", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const plainText = pageContent
      .replace(/<[^>]+>/g, "\n")
      .replace(/\n+/g, "\n\n")
      .trim();
    const lines = doc.splitTextToSize(plainText, width - margin * 2);

    lines.forEach(function (line) {
      if (currentY > height - margin) {
        doc.addPage();
        currentY = margin;

        if (vintageStyle) {
          doc.setFillColor(244, 228, 193);
          doc.rect(0, 0, width, height, "F");
        }
      }

      doc.text(line, margin, currentY);
      currentY += lineHeight;
    });

    // Page number
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const pageNum = String(pageIdx + 1);
    const pageNumWidth = doc.getTextWidth(pageNum);
    doc.text(pageNum, (width - pageNumWidth) / 2, height - 10);
  });

  updateExportProgress(95, "Finalizing PDF...");

  setTimeout(function () {
    const fileName =
      state.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") + ".pdf";
    doc.save(fileName);
    updateExportProgress(100, "Export complete!");

    setTimeout(function () {
      if (elements.exportProgress) {
        elements.exportProgress.classList.remove("active");
      }
      if (elements.exportModal) {
        elements.exportModal.classList.remove("active");
      }
    }, 1500);
  }, 500);
}

function exportToTXT() {
  updateExportProgress(30, "Preparing text...");

  let content = state.title + "\n";
  content += "by " + state.author + "\n";
  content += "\n" + "=".repeat(50) + "\n\n";

  state.pages.forEach(function (pageContent, idx) {
    const plainText = pageContent
      .replace(/<[^>]+>/g, "\n")
      .replace(/\n+/g, "\n\n")
      .trim();
    content += plainText + "\n\n";
    content += "--- Page " + (idx + 1) + " ---\n\n";
  });

  updateExportProgress(80, "Creating file...");

  setTimeout(function () {
    downloadFile(content, state.title + ".txt", "text/plain");
    finishExport();
  }, 500);
}

function exportToHTML() {
  updateExportProgress(30, "Generating HTML...");

  const vintageStyle = elements.exportVintageStyle
    ? elements.exportVintageStyle.checked
    : true;

  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
  html += '<meta charset="UTF-8">\n';
  html +=
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  html += "<title>" + escapeHtml(state.title) + "</title>\n";
  html += "<style>\n";

  if (vintageStyle) {
    html +=
      "body{font-family:Georgia,serif;background:#f4e4c1;color:#2c1810;max-width:800px;margin:0 auto;padding:40px;line-height:1.8;}\n";
    html +=
      "h1{text-align:center;color:#8b0000;border-bottom:2px solid #654321;padding-bottom:20px;}\n";
    html +=
      ".author{text-align:center;font-style:italic;margin-bottom:40px;}\n";
    html +=
      ".page{margin-bottom:30px;padding:20px;background:rgba(255,255,255,0.5);border-left:3px solid #654321;}\n";
    html += "p{text-indent:2em;text-align:justify;margin-bottom:1em;}\n";
    html += "p:first-child{text-indent:0;}\n";
    html +=
      "p:first-child::first-letter{font-size:3em;float:left;padding-right:10px;color:#8b0000;line-height:1;}\n";
  } else {
    html +=
      "body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;line-height:1.8;}\n";
    html += "h1{text-align:center;}\n";
    html +=
      ".author{text-align:center;font-style:italic;margin-bottom:40px;}\n";
    html += ".page{margin-bottom:30px;}\n";
    html += "p{text-indent:2em;margin-bottom:1em;}\n";
  }

  html += "</style>\n</head>\n<body>\n";
  html += "<h1>" + escapeHtml(state.title) + "</h1>\n";
  html += '<p class="author">by ' + escapeHtml(state.author) + "</p>\n";

  state.pages.forEach(function (pageContent, idx) {
    updateExportProgress(
      30 + (idx / state.pages.length) * 50,
      "Processing page " + (idx + 1) + "...",
    );
    html += '<div class="page">\n' + pageContent + "\n</div>\n";
  });

  html += "</body>\n</html>";

  updateExportProgress(90, "Creating file...");

  setTimeout(function () {
    downloadFile(html, state.title + ".html", "text/html");
    finishExport();
  }, 500);
}

function exportToEPUB() {
  updateExportProgress(20, "Generating EPUB structure...");

  let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
  content += '<html xmlns="http://www.w3.org/1999/xhtml">\n<head>\n';
  content += "<title>" + escapeHtml(state.title) + "</title>\n";
  content +=
    "<style>body{font-family:Georgia,serif;margin:2em;line-height:1.8}h1{text-align:center}p{text-indent:2em;text-align:justify}</style>\n";
  content += "</head>\n<body>\n";
  content += "<h1>" + escapeHtml(state.title) + "</h1>\n";
  content +=
    '<p style="text-align:center;font-style:italic">by ' +
    escapeHtml(state.author) +
    "</p>\n<hr/>\n";

  state.pages.forEach(function (pageContent, idx) {
    updateExportProgress(
      20 + (idx / state.pages.length) * 60,
      "Processing page " + (idx + 1) + "...",
    );
    content += "<div>\n" + pageContent + "\n</div>\n";
  });

  content += "</body>\n</html>";

  updateExportProgress(90, "Creating file...");

  setTimeout(function () {
    downloadFile(content, state.title + ".xhtml", "application/xhtml+xml");
    updateExportProgress(100, "Export complete! (XHTML format for e-readers)");

    setTimeout(function () {
      if (elements.exportProgress) {
        elements.exportProgress.classList.remove("active");
      }
      if (elements.exportModal) {
        elements.exportModal.classList.remove("active");
      }
    }, 2000);
  }, 500);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function updateExportProgress(percent, text) {
  if (elements.exportProgressFill) {
    elements.exportProgressFill.style.width = percent + "%";
  }
  if (elements.exportProgressText) {
    elements.exportProgressText.textContent = text;
  }
}

function finishExport() {
  updateExportProgress(100, "Export complete!");

  setTimeout(function () {
    if (elements.exportProgress) {
      elements.exportProgress.classList.remove("active");
    }
    if (elements.exportModal) {
      elements.exportModal.classList.remove("active");
    }
  }, 1500);
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function showLoading(message) {
  if (elements.loadingText) {
    elements.loadingText.textContent = message || "Loading...";
  }
  if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.add("active");
  }
}

function hideLoading() {
  if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.remove("active");
  }
}

function updateLoadingText(text) {
  if (elements.loadingText) {
    elements.loadingText.textContent = text;
  }
}

function updateLoadingProgress(percent) {
  // Optional: Update loading progress if you have a progress bar
  if (elements.loadingText) {
    const currentText = elements.loadingText.textContent;
    if (!currentText.includes("%")) {
      elements.loadingText.textContent = currentText + " (" + percent + "%)";
    }
  }
}

function showError(message) {
  if (elements.errorMsg) {
    elements.errorMsg.textContent = message;
    elements.errorMsg.style.display = "block";

    setTimeout(function () {
      elements.errorMsg.textContent = "";
    }, 5000);
  } else {
    console.error(message);
    alert(message);
  }
}

/* ============================================
   DEMO TEXT
   ============================================ */

function loadDemoText() {
  const demoText = `CHAPTER I
The Beginning of All Things

It was a dark and stormy night when our tale begins. The wind howled through the ancient oaks that lined the manor's long driveway, their gnarled branches reaching toward the heavens like the fingers of desperate supplicants.

Inside the great house, candles flickered in their sconces, casting dancing shadows upon the walls. The fire in the library's massive hearth crackled and popped, sending sparks swirling up the chimney like miniature stars ascending to join their celestial brethren.

Lord Blackwood sat in his leather armchair, a glass of aged brandy warming in his weathered hands. His eyes, sharp despite his seventy years, were fixed upon the flames, but his thoughts wandered far beyond the confines of this room, beyond even the boundaries of his vast estate.

The manor had stood for three centuries, witness to countless births and deaths, celebrations and tragedies. Its walls held secrets that would never be spoken aloud, and its corridors echoed with the footsteps of generations long since departed.

CHAPTER II
A Mysterious Visitor

The clock had just struck midnight when the sound of hoofbeats pierced the storm's fury. Lord Blackwood raised his head, listening intently. Few would venture out on such a night, and fewer still would seek entrance to Blackwood Manor at such an hour.

The butler, ever vigilant despite the late hour, appeared at the library door. His face, normally impassive, bore the slightest hint of concern—a remarkable display of emotion for one so practiced in the art of domestic stoicism.

"My lord," he announced, his voice steady but soft, "there is a visitor. A young lady, traveling alone. She claims to bear news of some urgency."

Lord Blackwood set down his brandy and rose slowly from his chair. His bones ached with the dampness that had seeped into the old house, but curiosity overrode discomfort. A young lady, alone, at midnight, in a storm? Such circumstances demanded investigation.

"Show her in, Jameson," he commanded. "And bring fresh tea. The poor creature must be chilled to the bone."

CHAPTER III
The Letter

The young woman who stood in the entrance hall was drenched from head to toe, her traveling cloak offering little protection against the tempest. Yet despite her bedraggled appearance, there was something noble in her bearing, something that spoke of gentle breeding and iron will combined.

"Forgive my intrusion, my lord," she said, her voice steady despite the chill that must have permeated her very bones. "I am Eleanor Ashworth, and I bring tidings that could not wait for morning's light."

From within her cloak, she produced a letter, its seal unbroken despite the journey. The wax bore an impression that made Lord Blackwood's heart skip a beat—an impression he had not seen for over forty years.

"This letter," Eleanor continued, her eyes meeting his with an intensity that belied her youth, "is from your brother, Sir William. He lives still, my lord, and he has sent me to bring you home."

The words hung in the air like morning mist over a meadow. Lord Blackwood felt the room spin slightly, and he gripped the back of a nearby chair for support.

"William?" he whispered, his voice barely audible above the storm's continued assault upon the windows. "But William died. The shipwreck... there were no survivors."

CHAPTER IV
Revelations

Eleanor shook her head gently, water droplets scattering from her dark curls. "There was one survivor, my lord. Your brother was rescued by fishermen and taken to a remote island where he lived in exile for many years. The reasons for his silence are contained within this letter."

She pressed the letter into his trembling hands. "I shall tell you all I know, but first—might I trouble you for a seat by your fire? The journey has been long, and the night unforgiving."

And so began the strangest night of Lord Blackwood's long life. As the storm raged outside and the fire burned low, Eleanor Ashworth unfolded a tale of adventure, betrayal, and redemption that would change everything the old lord thought he knew about his family's past.

The letter confirmed what she had said and more. William had not perished in the shipwreck of the Fortunate Son. He had been rescued, yes, but his survival had been kept secret by powerful enemies who wished him dead.

CHAPTER V
The Journey Begins

By morning, the storm had passed, leaving the grounds of Blackwood Manor washed clean and glistening in the pale winter sunlight. Lord Blackwood had not slept, nor had his unexpected guest. They had talked through the night, planning and preparing.

"We must leave at once," Lord Blackwood declared, a new vigor in his voice that his servants had not heard in years. "If what you say is true, my brother's life may still be in danger."

Eleanor nodded, her resolve matching his own. "I have horses waiting at the village inn. But I must warn you, my lord—the journey will be perilous. Those who wish Sir William harm have eyes everywhere."

Lord Blackwood smiled grimly, reaching for his father's sword which hung above the mantelpiece. "Then let them watch. After forty years of believing my brother dead, I would face the very gates of Hell to bring him home."

And so the adventure began, one that would take them across oceans and continents, through danger and discovery, to a reunion that neither brother had dared to dream possible.`;

  if (elements.textInput) {
    elements.textInput.value = demoText;
  }
  if (elements.bookTitle) {
    elements.bookTitle.value = "The Secrets of Blackwood Manor";
  }
  if (elements.authorName) {
    elements.authorName.value = "Victoria Ashworth";
  }
}

/* ============================================
   END OF SCRIPT
   ============================================ */

console.log("📚 Vintage Bookery loaded successfully!");
