/* ============================================
   VINTAGE BOOKERY - ENHANCED JAVASCRIPT
   ============================================ */

// Initialize PDF.js
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ============================================
// STATE
// ============================================

const state = {
    theme: 'classic',
    mode: 'light',
    text: '',
    rawText: '',
    title: 'Untitled Book',
    author: 'Unknown Author',
    pages: [],
    currentPage: 0,
    fontSize: 100,
    bookmarks: new Set(),
    charsPerPage: 1400,
    
    // Search
    searchTerm: '',
    searchResults: [],
    currentSearchIndex: -1,
    
    // Audio
    isPlaying: false,
    speechUtterance: null,
    speechRate: 1,
    selectedVoice: null,
    currentSentenceIndex: 0
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {};

function cacheElements() {
    // Upload Screen
    elements.uploadScreen = document.getElementById('uploadScreen');
    elements.dropZone = document.getElementById('dropZone');
    elements.fileInput = document.getElementById('fileInput');
    elements.browseBtn = document.getElementById('browseBtn');
    elements.textInput = document.getElementById('textInput');
    elements.bookTitle = document.getElementById('bookTitle');
    elements.authorName = document.getElementById('authorName');
    elements.createBtn = document.getElementById('createBtn');
    elements.demoBtn = document.getElementById('demoBtn');
    elements.errorMsg = document.getElementById('errorMsg');
    elements.themeGrid = document.getElementById('themeGrid');
    elements.modeToggle = document.getElementById('modeToggle');

    // Reader Screen
    elements.readerScreen = document.getElementById('readerScreen');
    elements.backBtn = document.getElementById('backBtn');
    elements.displayTitle = document.getElementById('displayTitle');
    elements.displayAuthor = document.getElementById('displayAuthor');
    elements.spineTitle = document.getElementById('spineTitle');
    elements.bookOpen = document.getElementById('bookOpen');
    elements.leftContent = document.getElementById('leftContent');
    elements.rightContent = document.getElementById('rightContent');
    elements.leftPageNum = document.getElementById('leftPageNum');
    elements.rightPageNum = document.getElementById('rightPageNum');
    elements.leftHeaderText = document.getElementById('leftHeaderText');
    elements.rightHeaderText = document.getElementById('rightHeaderText');
    elements.prevBtn = document.getElementById('prevBtn');
    elements.nextBtn = document.getElementById('nextBtn');
    elements.pageInfo = document.getElementById('pageInfo');
    elements.progressFill = document.getElementById('progressFill');
    elements.progressText = document.getElementById('progressText');
    elements.bookmark = document.getElementById('bookmark');

    // Controls
    elements.fontDown = document.getElementById('fontDown');
    elements.fontUp = document.getElementById('fontUp');
    elements.fontSizeDisplay = document.getElementById('fontSizeDisplay');
    elements.themeBtn = document.getElementById('themeBtn');
    elements.themeDropdown = document.getElementById('themeDropdown');
    elements.darkModeBtn = document.getElementById('darkModeBtn');
    elements.tocBtn = document.getElementById('tocBtn');
    elements.fullscreenBtn = document.getElementById('fullscreenBtn');
    elements.searchBtn = document.getElementById('searchBtn');

    // Audio
    elements.audioPlayBtn = document.getElementById('audioPlayBtn');
    elements.audioStopBtn = document.getElementById('audioStopBtn');
    elements.audioSpeed = document.getElementById('audioSpeed');
    elements.audioVoice = document.getElementById('audioVoice');
    elements.audioStatus = document.getElementById('audioStatus');

    // Search Modal
    elements.searchModal = document.getElementById('searchModal');
    elements.searchClose = document.getElementById('searchClose');
    elements.searchInput = document.getElementById('searchInput');
    elements.searchSubmit = document.getElementById('searchSubmit');
    elements.searchCaseSensitive = document.getElementById('searchCaseSensitive');
    elements.searchWholeWord = document.getElementById('searchWholeWord');
    elements.searchResultsInfo = document.getElementById('searchResultsInfo');
    elements.searchNav = document.getElementById('searchNav');
    elements.searchPrev = document.getElementById('searchPrev');
    elements.searchNext = document.getElementById('searchNext');
    elements.searchPosition = document.getElementById('searchPosition');
    elements.searchResults = document.getElementById('searchResults');

    // TOC Modal
    elements.tocModal = document.getElementById('tocModal');
    elements.tocClose = document.getElementById('tocClose');
    elements.tocList = document.getElementById('tocList');

    // Loading
    elements.loadingOverlay = document.getElementById('loadingOverlay');
    elements.loadingText = document.getElementById('loadingText');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    cacheElements();
    setupEventListeners();
    loadSavedPreferences();
    initSpeechSynthesis();
});

function setupEventListeners() {
    // Theme selection on upload screen
    elements.themeGrid.addEventListener('click', function(e) {
        const option = e.target.closest('.theme-option');
        if (option) {
            selectTheme(option.dataset.theme);
        }
    });

    // Mode toggle
    elements.modeToggle.addEventListener('change', function() {
        toggleMode(this.checked ? 'dark' : 'light');
    });

    // File handling
    elements.browseBtn.addEventListener('click', function() {
        elements.fileInput.click();
    });

    elements.dropZone.addEventListener('click', function(e) {
        if (e.target !== elements.browseBtn) {
            elements.fileInput.click();
        }
    });

    elements.dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    elements.dropZone.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });

    elements.dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    elements.fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });

    // Create book
    elements.createBtn.addEventListener('click', createBook);
    elements.demoBtn.addEventListener('click', loadDemoText);

    // Navigation
    elements.prevBtn.addEventListener('click', prevPage);
    elements.nextBtn.addEventListener('click', nextPage);
    elements.backBtn.addEventListener('click', goBack);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!elements.readerScreen.classList.contains('active')) return;
        if (document.activeElement.tagName === 'INPUT') return;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                prevPage();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                nextPage();
                break;
            case 'Escape':
                closeAllModals();
                break;
            case 'f':
                if (e.ctrlKey) {
                    e.preventDefault();
                    openSearchModal();
                }
                break;
        }
    });

    // Font controls
    elements.fontDown.addEventListener('click', function() {
        adjustFontSize(-10);
    });

    elements.fontUp.addEventListener('click', function() {
        adjustFontSize(10);
    });

    // Theme dropdown in reader
    elements.themeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        elements.themeDropdown.classList.toggle('active');
    });

    elements.themeDropdown.addEventListener('click', function(e) {
        const item = e.target.closest('.dropdown-item');
        if (item) {
            selectTheme(item.dataset.theme);
            elements.themeDropdown.classList.remove('active');
        }
    });

    document.addEventListener('click', function() {
        elements.themeDropdown.classList.remove('active');
    });

    // Dark mode
    elements.darkModeBtn.addEventListener('click', function() {
        toggleMode(state.mode === 'light' ? 'dark' : 'light');
    });

    // Table of contents
    elements.tocBtn.addEventListener('click', function() {
        elements.tocModal.classList.add('active');
    });

    elements.tocClose.addEventListener('click', function() {
        elements.tocModal.classList.remove('active');
    });

    elements.tocModal.addEventListener('click', function(e) {
        if (e.target === elements.tocModal) {
            elements.tocModal.classList.remove('active');
        }
    });

    // Fullscreen
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Bookmark
    elements.bookmark.addEventListener('click', toggleBookmark);

    // Search
    elements.searchBtn.addEventListener('click', openSearchModal);
    elements.searchClose.addEventListener('click', closeSearchModal);
    elements.searchModal.addEventListener('click', function(e) {
        if (e.target === elements.searchModal) {
            closeSearchModal();
        }
    });
    elements.searchSubmit.addEventListener('click', performSearch);
    elements.searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    elements.searchPrev.addEventListener('click', prevSearchResult);
    elements.searchNext.addEventListener('click', nextSearchResult);

    // Audio controls
    elements.audioPlayBtn.addEventListener('click', toggleAudioPlayback);
    elements.audioStopBtn.addEventListener('click', stopAudioPlayback);
    elements.audioSpeed.addEventListener('change', function() {
        state.speechRate = parseFloat(this.value);
        if (state.isPlaying) {
            stopAudioPlayback();
            startAudioPlayback();
        }
    });
    elements.audioVoice.addEventListener('change', function() {
        const voices = speechSynthesis.getVoices();
        state.selectedVoice = voices.find(v => v.name === this.value) || null;
    });
}

// ============================================
// SPEECH SYNTHESIS (TEXT-TO-SPEECH)
// ============================================

function initSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
        elements.audioControls && (elements.audioControls.style.display = 'none');
        return;
    }

    // Load voices
    function loadVoices() {
        const voices = speechSynthesis.getVoices();
        elements.audioVoice.innerHTML = '<option value="">Default Voice</option>';
        
        voices.forEach(function(voice) {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = voice.name + ' (' + voice.lang + ')';
            if (voice.lang.startsWith('en')) {
                elements.audioVoice.appendChild(option);
            }
        });
    }

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}

function toggleAudioPlayback() {
    if (state.isPlaying) {
        pauseAudioPlayback();
    } else {
        startAudioPlayback();
    }
}

function startAudioPlayback() {
    if (!('speechSynthesis' in window)) {
        showError('Text-to-speech is not supported in your browser.');
        return;
    }

    // Get text from current pages
    const leftText = getPlainTextFromPage(state.currentPage);
    const rightText = getPlainTextFromPage(state.currentPage + 1);
    const textToRead = leftText + ' ' + rightText;

    if (!textToRead.trim()) {
        showError('No text to read on current pages.');
        return;
    }

    state.isPlaying = true;
    elements.audioPlayBtn.classList.add('playing');
    elements.audioStatus.textContent = 'Reading...';

    // Split into sentences for better control
    const sentences = textToRead.match(/[^.!?]+[.!?]+/g) || [textToRead];
    state.currentSentenceIndex = 0;

    speakSentence(sentences);
}

function speakSentence(sentences) {
    if (!state.isPlaying || state.currentSentenceIndex >= sentences.length) {
        if (state.isPlaying && state.currentSentenceIndex >= sentences.length) {
            // Auto-advance to next page
            if (state.currentPage + 2 < state.pages.length) {
                nextPage();
                setTimeout(function() {
                    startAudioPlayback();
                }, 500);
            } else {
                stopAudioPlayback();
                elements.audioStatus.textContent = 'Finished';
            }
        }
        return;
    }

    const utterance = new SpeechSynthesisUtterance(sentences[state.currentSentenceIndex]);
    utterance.rate = state.speechRate;
    
    if (state.selectedVoice) {
        utterance.voice = state.selectedVoice;
    }

    utterance.onend = function() {
        state.currentSentenceIndex++;
        speakSentence(sentences);
    };

    utterance.onerror = function() {
        stopAudioPlayback();
    };

    state.speechUtterance = utterance;
    speechSynthesis.speak(utterance);
}

function pauseAudioPlayback() {
    state.isPlaying = false;
    speechSynthesis.pause();
    elements.audioPlayBtn.classList.remove('playing');
    elements.audioStatus.textContent = 'Paused';
}

function stopAudioPlayback() {
    state.isPlaying = false;
    speechSynthesis.cancel();
    elements.audioPlayBtn.classList.remove('playing');
    elements.audioStatus.textContent = '';
    state.currentSentenceIndex = 0;
}

function getPlainTextFromPage(pageIndex) {
    if (pageIndex >= state.pages.length) return '';
    
    // Strip HTML tags
    const temp = document.createElement('div');
    temp.innerHTML = state.pages[pageIndex];
    return temp.textContent || temp.innerText || '';
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function openSearchModal() {
    elements.searchModal.classList.add('active');
    elements.searchInput.focus();
}

function closeSearchModal() {
    elements.searchModal.classList.remove('active');
    clearSearchHighlights();
}

function performSearch() {
    const term = elements.searchInput.value.trim();
    if (!term) {
        elements.searchResultsInfo.textContent = 'Please enter a search term.';
        return;
    }

    state.searchTerm = term;
    state.searchResults = [];
    state.currentSearchIndex = -1;

    const caseSensitive = elements.searchCaseSensitive.checked;
    const wholeWord = elements.searchWholeWord.checked;

    // Search through all pages
    state.pages.forEach(function(pageContent, pageIndex) {
        const plainText = getPlainTextFromHtml(pageContent);
        const matches = findMatches(plainText, term, caseSensitive, wholeWord);
        
        matches.forEach(function(match) {
            state.searchResults.push({
                pageIndex: pageIndex,
                position: match.index,
                context: getSearchContext(plainText, match.index, term.length),
                term: match.text
            });
        });
    });

    displaySearchResults();
}

function getPlainTextFromHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

function findMatches(text, term, caseSensitive, wholeWord) {
    const matches = [];
    let searchText = caseSensitive ? text : text.toLowerCase();
    let searchTerm = caseSensitive ? term : term.toLowerCase();
    
    let pos = 0;
    while ((pos = searchText.indexOf(searchTerm, pos)) !== -1) {
        if (wholeWord) {
            const before = pos === 0 ? ' ' : text[pos - 1];
            const after = pos + term.length >= text.length ? ' ' : text[pos + term.length];
            if (/\w/.test(before) || /\w/.test(after)) {
                pos++;
                continue;
            }
        }
        matches.push({
            index: pos,
            text: text.substr(pos, term.length)
        });
        pos++;
    }
    
    return matches;
}

function getSearchContext(text, position, termLength) {
    const contextLength = 50;
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + termLength + contextLength);
    
    let context = '';
    if (start > 0) context += '...';
    context += text.substring(start, position);
    context += '<mark>' + text.substring(position, position + termLength) + '</mark>';
    context += text.substring(position + termLength, end);
    if (end < text.length) context += '...';
    
    return context;
}

function displaySearchResults() {
    const count = state.searchResults.length;
    
    if (count === 0) {
        elements.searchResultsInfo.textContent = 'No results found for "' + state.searchTerm + '"';
        elements.searchNav.style.display = 'none';
        elements.searchResults.innerHTML = '';
        return;
    }

    elements.searchResultsInfo.textContent = 'Found ' + count + ' result' + (count > 1 ? 's' : '') + ' for "' + state.searchTerm + '"';
    elements.searchNav.style.display = 'flex';
    updateSearchPosition();

    // Display result items
    elements.searchResults.innerHTML = '';
    state.searchResults.forEach(function(result, index) {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = 
            '<div class="search-result-page">Page ' + (result.pageIndex + 1) + '</div>' +
            '<div class="search-result-text">' + result.context + '</div>';
        
        item.addEventListener('click', function() {
            goToSearchResult(index);
        });
        
        elements.searchResults.appendChild(item);
    });

    // Go to first result
    goToSearchResult(0);
}

function goToSearchResult(index) {
    if (index < 0 || index >= state.searchResults.length) return;
    
    state.currentSearchIndex = index;
    const result = state.searchResults[index];
    
    // Navigate to the page
    state.currentPage = Math.floor(result.pageIndex / 2) * 2;
    renderPages();
    highlightSearchTerms();
    updateSearchPosition();
    
    // Highlight current result item
    const items = elements.searchResults.querySelectorAll('.search-result-item');
    items.forEach(function(item, i) {
        item.style.background = i === index ? 'rgba(201, 162, 39, 0.3)' : '';
    });
}

function prevSearchResult() {
    if (state.currentSearchIndex > 0) {
        goToSearchResult(state.currentSearchIndex - 1);
    }
}

function nextSearchResult() {
    if (state.currentSearchIndex < state.searchResults.length - 1) {
        goToSearchResult(state.currentSearchIndex + 1);
    }
}

function updateSearchPosition() {
    elements.searchPosition.textContent = (state.currentSearchIndex + 1) + ' of ' + state.searchResults.length;
}

function highlightSearchTerms() {
    if (!state.searchTerm) return;
    
    const caseSensitive = elements.searchCaseSensitive.checked;
    const term = state.searchTerm;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp('(' + escapeRegex(term) + ')', flags);
    
    [elements.leftContent, elements.rightContent].forEach(function(container) {
        highlightInElement(container, regex);
    });
}

function highlightInElement(container, regex) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    
    textNodes.forEach(function(node) {
        if (regex.test(node.textContent)) {
            const span = document.createElement('span');
            span.innerHTML = node.textContent.replace(regex, '<span class="search-highlight">$1</span>');
            node.parentNode.replaceChild(span, node);
        }
    });
}

function clearSearchHighlights() {
    document.querySelectorAll('.search-highlight').forEach(function(el) {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// THEME & MODE
// ============================================

function selectTheme(theme) {
    state.theme = theme;
    document.body.dataset.theme = theme;
    
    document.querySelectorAll('.theme-option').forEach(function(opt) {
        opt.classList.toggle('active', opt.dataset.theme === theme);
    });
    
    savePreferences();
}

function toggleMode(mode) {
    state.mode = mode;
    document.body.dataset.mode = mode;
    elements.modeToggle.checked = mode === 'dark';
    elements.darkModeBtn.textContent = mode === 'dark' ? '☀️' : '🌙';
    savePreferences();
}

function savePreferences() {
    localStorage.setItem('vintageBookery', JSON.stringify({
        theme: state.theme,
        mode: state.mode,
        fontSize: state.fontSize
    }));
}

function loadSavedPreferences() {
    try {
        const saved = localStorage.getItem('vintageBookery');
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
        console.warn('Could not load preferences:', e);
    }
}

// ============================================
// FILE HANDLING
// ============================================

function handleFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    showLoading('Reading your file...');
    
    if (extension === 'txt' || extension === 'text') {
        readTextFile(file);
    } else if (extension === 'pdf') {
        readPdfFile(file);
    } else {
        hideLoading();
        showError('Please use PDF or TXT files only.');
    }
}

function readTextFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        elements.textInput.value = e.target.result;
        hideLoading();
        
        if (!elements.bookTitle.value) {
            elements.bookTitle.value = file.name.replace(/\.[^/.]+$/, '');
        }
    };
    
    reader.onerror = function() {
        hideLoading();
        showError('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
}

function readPdfFile(file) {
    if (typeof pdfjsLib === 'undefined') {
        hideLoading();
        showError('PDF support requires internet connection. Try a text file.');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const typedArray = new Uint8Array(e.target.result);
        
        pdfjsLib.getDocument(typedArray).promise
            .then(function(pdf) {
                elements.loadingText.textContent = 'Extracting ' + pdf.numPages + ' pages...';
                
                const textPromises = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    textPromises.push(extractPageText(pdf, i));
                }
                
                return Promise.all(textPromises);
            })
            .then(function(pageTexts) {
                elements.textInput.value = pageTexts.join('\n\n');
                hideLoading();
                
                if (!elements.bookTitle.value) {
                    elements.bookTitle.value = file.name.replace(/\.[^/.]+$/, '');
                }
            })
            .catch(function(err) {
                hideLoading();
                showError('Error reading PDF: ' + err.message);
            });
    };
    
    reader.readAsArrayBuffer(file);
}

function extractPageText(pdf, pageNum) {
    return pdf.getPage(pageNum)
        .then(function(page) {
            return page.getTextContent();
        })
        .then(function(textContent) {
            return textContent.items.map(function(item) {
                return item.str;
            }).join(' ');
        });
}

// ============================================
// BOOK CREATION
// ============================================

function createBook() {
    const text = elements.textInput.value.trim();
    
    if (!text) {
        showError('Please upload a file or paste some text.');
        return;
    }
    
    if (text.length < 50) {
        showError('Please provide more content for your book.');
        return;
    }
    
    showLoading('Creating your vintage book...');
    
    state.text = text;
    state.rawText = text;
    state.title = elements.bookTitle.value.trim() || 'Untitled Book';
    state.author = elements.authorName.value.trim() || 'Unknown Author';
    state.currentPage = 0;
    state.bookmarks.clear();
    state.searchTerm = '';
    state.searchResults = [];
    
    paginateText();
    generateTableOfContents();
    
    setTimeout(function() {
        hideLoading();
        showReader();
        renderPages();
    }, 800);
}

function paginateText() {
    state.pages = [];
    
    let text = state.text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n');
    
    const paragraphs = text.split(/\n\n+/);
    
    let currentPage = '';
    let charCount = 0;
    const charsPerPage = Math.floor(state.charsPerPage * (100 / state.fontSize));
    
    paragraphs.forEach(function(para) {
        para = para.trim();
        if (!para) return;
        
        if (charCount + para.length > charsPerPage && currentPage) {
            state.pages.push(currentPage);
            currentPage = '';
            charCount = 0;
        }
        
        currentPage += '<p>' + escapeHtml(para) + '</p>';
        charCount += para.length;
    });
    
    if (currentPage) {
        state.pages.push(currentPage);
    }
    
    if (state.pages.length === 0) {
        state.pages.push('<p>' + escapeHtml(state.text.substring(0, 500)) + '</p>');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateTableOfContents() {
    elements.tocList.innerHTML = '';
    
    const sectionsCount = Math.min(15, Math.ceil(state.pages.length / 3));
    
    for (let i = 0; i < sectionsCount; i++) {
        const pageNum = i * Math.floor(state.pages.length / sectionsCount);
        
        const item = document.createElement('div');
        item.className = 'toc-item';
        item.innerHTML = 
            '<span class="toc-item-title">Section ' + (i + 1) + '</span>' +
            '<span class="toc-item-page">Page ' + (pageNum + 1) + '</span>';
        item.dataset.page = pageNum;
        
        item.addEventListener('click', function() {
            const targetPage = parseInt(this.dataset.page);
            state.currentPage = Math.floor(targetPage / 2) * 2;
            renderPages();
            elements.tocModal.classList.remove('active');
            animatePageTurn();
        });
        
        elements.tocList.appendChild(item);
    }
}

// ============================================
// RENDERING
// ============================================

function showReader() {
    elements.uploadScreen.classList.add('hidden');
    elements.readerScreen.classList.add('active');
    
    elements.displayTitle.textContent = state.title;
    elements.displayAuthor.textContent = 'by ' + state.author;
    elements.spineTitle.textContent = state.title;
}

function renderPages() {
    stopAudioPlayback();
    
    const leftIdx = state.currentPage;
    const rightIdx = state.currentPage + 1;
    const total = state.pages.length;
    
    // Left page
    if (leftIdx < total) {
        elements.leftContent.innerHTML = state.pages[leftIdx];
        elements.leftPageNum.textContent = leftIdx + 1;
        addDropCap(elements.leftContent);
    } else {
        elements.leftContent.innerHTML = '<p style="text-align:center;font-style:italic;color:var(--ink-faded);padding-top:50px;">— The End —</p>';
        elements.leftPageNum.textContent = '';
    }
    
    // Right page
    if (rightIdx < total) {
        elements.rightContent.innerHTML = state.pages[rightIdx];
        elements.rightPageNum.textContent = rightIdx + 1;
    } else {
        elements.rightContent.innerHTML = '';
        elements.rightPageNum.textContent = '';
    }
    
    // Headers
    elements.leftHeaderText.textContent = state.title;
    elements.rightHeaderText.textContent = state.author;
    
    // Navigation state
    elements.prevBtn.disabled = state.currentPage === 0;
    elements.nextBtn.disabled = rightIdx >= total - 1;
    
    // Page info
    const startPage = leftIdx + 1;
    const endPage = Math.min(rightIdx + 1, total);
    elements.pageInfo.textContent = 'Pages ' + startPage + '-' + endPage + ' of ' + total;
    
    // Progress
    const progress = Math.round(((rightIdx + 1) / total) * 100);
    elements.progressFill.style.width = progress + '%';
    elements.progressText.textContent = progress + '%';
    
    // Bookmark
    const hasBookmark = state.bookmarks.has(leftIdx) || state.bookmarks.has(rightIdx);
    elements.bookmark.classList.toggle('active', hasBookmark);
    
    updateFontSize();
    
    // Re-highlight search if active
    if (state.searchTerm) {
        highlightSearchTerms();
    }
}

function addDropCap(container) {
    const firstP = container.querySelector('p:first-child');
    if (firstP && firstP.textContent.trim()) {
        firstP.classList.add('drop-cap');
    }
}

// ============================================
// NAVIGATION
// ============================================

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
    elements.bookOpen.classList.add('turning');
    setTimeout(function() {
        elements.bookOpen.classList.remove('turning');
    }, 600);
}

function goBack() {
    stopAudioPlayback();
    elements.readerScreen.classList.remove('active');
    elements.uploadScreen.classList.remove('hidden');
}

// ============================================
// CONTROLS
// ============================================

function adjustFontSize(delta) {
    state.fontSize = Math.max(70, Math.min(150, state.fontSize + delta));
    updateFontSize();
    savePreferences();
    
    paginateText();
    
    if (state.currentPage >= state.pages.length) {
        state.currentPage = Math.max(0, state.pages.length - 2);
    }
    
    renderPages();
}

function updateFontSize() {
    const size = state.fontSize / 100;
    elements.leftContent.style.fontSize = (1.05 * size) + 'rem';
    elements.rightContent.style.fontSize = (1.05 * size) + 'rem';
    elements.fontSizeDisplay.textContent = state.fontSize + '%';
}

function toggleBookmark() {
    const pageIdx = state.currentPage;
    
    if (state.bookmarks.has(pageIdx)) {
        state.bookmarks.delete(pageIdx);
        elements.bookmark.classList.remove('active');
    } else {
        state.bookmarks.add(pageIdx);
        elements.bookmark.classList.add('active');
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function(err) {
            console.warn('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function closeAllModals() {
    elements.tocModal.classList.remove('active');
    elements.searchModal.classList.remove('active');
    elements.themeDropdown.classList.remove('active');
}

// ============================================
// UI HELPERS
// ============================================

function showLoading(message) {
    elements.loadingText.textContent = message || 'Loading...';
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
}

function showError(message) {
    elements.errorMsg.textContent = message;
    setTimeout(function() {
        elements.errorMsg.textContent = '';
    }, 5000);
}

/* ============================================
   SEARCH FUNCTIONALITY
   ============================================ */

const searchState = {
    results: [],
    currentIndex: 0,
    searchTerm: ''
};

function initSearch() {
    // Cache new elements
    elements.searchModal = document.getElementById('searchModal');
    elements.searchClose = document.getElementById('searchClose');
    elements.searchInput = document.getElementById('searchInput');
    elements.searchBtn = document.getElementById('searchBtn');
    elements.searchStats = document.getElementById('searchStats');
    elements.searchNavigation = document.getElementById('searchNavigation');
    elements.searchPrev = document.getElementById('searchPrev');
    elements.searchNext = document.getElementById('searchNext');
    elements.searchPosition = document.getElementById('searchPosition');
    elements.searchResults = document.getElementById('searchResults');
    elements.searchOpenBtn = document.getElementById('searchOpenBtn');

    // Event listeners
    elements.searchOpenBtn.addEventListener('click', function() {
        elements.searchModal.classList.add('active');
        elements.searchInput.focus();
    });

    elements.searchClose.addEventListener('click', function() {
        elements.searchModal.classList.remove('active');
        clearSearchHighlights();
    });

    elements.searchModal.addEventListener('click', function(e) {
        if (e.target === elements.searchModal) {
            elements.searchModal.classList.remove('active');
            clearSearchHighlights();
        }
    });

    elements.searchBtn.addEventListener('click', performSearch);
    
    elements.searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    elements.searchPrev.addEventListener('click', function() {
        navigateSearchResult(-1);
    });

    elements.searchNext.addEventListener('click', function() {
        navigateSearchResult(1);
    });
}

function performSearch() {
    const term = elements.searchInput.value.trim().toLowerCase();
    
    if (!term || term.length < 2) {
        showSearchError('Please enter at least 2 characters');
        return;
    }

    searchState.searchTerm = term;
    searchState.results = [];
    searchState.currentIndex = 0;

    // Search through all pages
    state.pages.forEach(function(pageContent, pageIndex) {
        const plainText = pageContent.replace(/<[^>]+>/g, ' ').toLowerCase();
        let position = 0;
        
        while ((position = plainText.indexOf(term, position)) !== -1) {
            // Get context around the match
            const start = Math.max(0, position - 40);
            const end = Math.min(plainText.length, position + term.length + 40);
            const context = plainText.substring(start, end);
            
            searchState.results.push({
                pageIndex: pageIndex,
                position: position,
                context: context
            });
            
            position += term.length;
        }
    });

    displaySearchResults();
}

function displaySearchResults() {
    const results = searchState.results;
    
    if (results.length === 0) {
        elements.searchStats.textContent = 'No results found for "' + searchState.searchTerm + '"';
        elements.searchStats.classList.add('active');
        elements.searchNavigation.classList.remove('active');
        elements.searchResults.innerHTML = '<p style="text-align:center;color:var(--ink-faded);padding:20px;">Try a different search term</p>';
        return;
    }

    elements.searchStats.textContent = 'Found ' + results.length + ' result(s) for "' + searchState.searchTerm + '"';
    elements.searchStats.classList.add('active');
    elements.searchNavigation.classList.add('active');
    updateSearchPosition();

    // Build results list
    let html = '';
    results.forEach(function(result, index) {
        const highlightedContext = result.context.replace(
            new RegExp('(' + escapeRegex(searchState.searchTerm) + ')', 'gi'),
            '<mark>$1</mark>'
        );
        
        html += '<div class="search-result-item" data-index="' + index + '">' +
                '<div class="search-result-page">Page ' + (result.pageIndex + 1) + '</div>' +
                '<div class="search-result-text">...' + highlightedContext + '...</div>' +
                '</div>';
    });
    
    elements.searchResults.innerHTML = html;

    // Add click handlers to results
    document.querySelectorAll('.search-result-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            searchState.currentIndex = index;
            goToSearchResult(index);
        });
    });
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
    
    // Navigate to the page
    state.currentPage = Math.floor(result.pageIndex / 2) * 2;
    renderPages();
    
    // Highlight the search term on the page
    highlightSearchTerm();
    
    // Update position display
    updateSearchPosition();
    
    // Close modal
    elements.searchModal.classList.remove('active');
}

function updateSearchPosition() {
    elements.searchPosition.textContent = (searchState.currentIndex + 1) + ' of ' + searchState.results.length;
    elements.searchPrev.disabled = searchState.currentIndex === 0;
    elements.searchNext.disabled = searchState.currentIndex === searchState.results.length - 1;
}

function highlightSearchTerm() {
    const term = searchState.searchTerm;
    if (!term) return;

    [elements.leftContent, elements.rightContent].forEach(function(container) {
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach(function(node) {
            const text = node.textContent;
            const regex = new RegExp('(' + escapeRegex(term) + ')', 'gi');
            
            if (regex.test(text)) {
                const span = document.createElement('span');
                span.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
                node.parentNode.replaceChild(span, node);
            }
        });
    });
}

function clearSearchHighlights() {
    document.querySelectorAll('.search-highlight').forEach(function(mark) {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showSearchError(message) {
    elements.searchStats.textContent = message;
    elements.searchStats.classList.add('active');
    elements.searchNavigation.classList.remove('active');
    elements.searchResults.innerHTML = '';
}

/* ============================================
   EXPORT FUNCTIONALITY
   ============================================ */

const exportState = {
    format: 'pdf'
};

function initExport() {
    // Cache elements
    elements.exportModal = document.getElementById('exportModal');
    elements.exportClose = document.getElementById('exportClose');
    elements.exportOpenBtn = document.getElementById('exportOpenBtn');
    elements.exportBtn = document.getElementById('exportBtn');
    elements.exportProgress = document.getElementById('exportProgress');
    elements.exportProgressFill = document.getElementById('exportProgressFill');
    elements.exportProgressText = document.getElementById('exportProgressText');
    elements.exportIncludeCover = document.getElementById('exportIncludeCover');
    elements.exportVintageStyle = document.getElementById('exportVintageStyle');
    elements.exportPageSize = document.getElementById('exportPageSize');

    // Event listeners
    elements.exportOpenBtn.addEventListener('click', function() {
        elements.exportModal.classList.add('active');
    });

    elements.exportClose.addEventListener('click', function() {
        elements.exportModal.classList.remove('active');
    });

    elements.exportModal.addEventListener('click', function(e) {
        if (e.target === elements.exportModal) {
            elements.exportModal.classList.remove('active');
        }
    });

    // Export format selection
    document.querySelectorAll('.export-option').forEach(function(option) {
        option.addEventListener('click', function() {
            document.querySelectorAll('.export-option').forEach(function(o) {
                o.classList.remove('selected');
            });
            this.classList.add('selected');
            exportState.format = this.dataset.format;
        });
    });

    // Select PDF by default
    document.querySelector('.export-option[data-format="pdf"]').classList.add('selected');

    elements.exportBtn.addEventListener('click', startExport);
}

function startExport() {
    const format = exportState.format;
    
    elements.exportProgress.classList.add('active');
    elements.exportProgressFill.style.width = '0%';
    elements.exportProgressText.textContent = 'Preparing export...';

    switch (format) {
        case 'pdf':
            exportToPDF();
            break;
        case 'txt':
            exportToTXT();
            break;
        case 'html':
            exportToHTML();
            break;
        case 'epub':
            exportToEPUB();
            break;
    }
}

function exportToPDF() {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
        elements.exportProgressText.textContent = 'PDF library not loaded. Please refresh and try again.';
        return;
    }

    const { jsPDF } = window.jspdf;
    
    const pageSize = elements.exportPageSize.value;
    const includeCover = elements.exportIncludeCover.checked;
    const vintageStyle = elements.exportVintageStyle.checked;

    // Page dimensions
    const sizes = {
        'a4': [210, 297],
        'letter': [215.9, 279.4],
        'a5': [148, 210]
    };
    
    const [width, height] = sizes[pageSize];
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [width, height]
    });

    const margin = 20;
    const lineHeight = 7;
    const fontSize = pageSize === 'a5' ? 10 : 12;
    const titleFontSize = pageSize === 'a5' ? 20 : 24;
    let currentY = margin;

    // Set vintage colors if enabled
    const textColor = vintageStyle ? [44, 24, 16] : [0, 0, 0];
    const titleColor = vintageStyle ? [139, 0, 0] : [0, 0, 0];

    // Cover page
    if (includeCover) {
        updateExportProgress(5, 'Creating cover page...');
        
        if (vintageStyle) {
            doc.setFillColor(244, 228, 193);
            doc.rect(0, 0, width, height, 'F');
            
            // Border
            doc.setDrawColor(101, 67, 33);
            doc.setLineWidth(2);
            doc.rect(10, 10, width - 20, height - 20);
            
            // Inner border
            doc.setLineWidth(0.5);
            doc.rect(15, 15, width - 30, height - 30);
        }
        
        // Title
        doc.setFont('times', 'bold');
        doc.setFontSize(titleFontSize);
        doc.setTextColor(...titleColor);
        
        const titleLines = doc.splitTextToSize(state.title, width - margin * 2);
        const titleY = height / 3;
        titleLines.forEach(function(line, idx) {
            const textWidth = doc.getTextWidth(line);
            doc.text(line, (width - textWidth) / 2, titleY + idx * 12);
        });
        
        // Author
        doc.setFont('times', 'italic');
        doc.setFontSize(fontSize + 4);
        const authorText = 'by ' + state.author;
        const authorWidth = doc.getTextWidth(authorText);
        doc.text(authorText, (width - authorWidth) / 2, titleY + titleLines.length * 12 + 20);
        
        // Ornament
        doc.setFontSize(20);
        doc.text('❦', width / 2 - 5, height / 2 + 30);
        
        doc.addPage();
    }

    // Content pages
    doc.setFont('times', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...textColor);
    
    const totalPages = state.pages.length;
    
    state.pages.forEach(function(pageContent, pageIdx) {
        updateExportProgress(10 + (pageIdx / totalPages) * 80, 'Exporting page ' + (pageIdx + 1) + ' of ' + totalPages + '...');
        
        if (pageIdx > 0) {
            doc.addPage();
        }
        
        currentY = margin;
        
        if (vintageStyle) {
            doc.setFillColor(244, 228, 193);
            doc.rect(0, 0, width, height, 'F');
        }
        
        // Page header
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(state.title, margin, 10);
        
        doc.setFont('times', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(...textColor);
        
        // Get plain text from HTML
        const plainText = pageContent.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n\n').trim();
        const lines = doc.splitTextToSize(plainText, width - margin * 2);
        
        lines.forEach(function(line) {
            if (currentY > height - margin) {
                doc.addPage();
                currentY = margin;
                
                if (vintageStyle) {
                    doc.setFillColor(244, 228, 193);
                    doc.rect(0, 0, width, height, 'F');
                }
            }
            
            doc.text(line, margin, currentY);
            currentY += lineHeight;
        });
        
        // Page number
        doc.setFont('times', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const pageNum = String(pageIdx + 1);
        const pageNumWidth = doc.getTextWidth(pageNum);
        doc.text(pageNum, (width - pageNumWidth) / 2, height - 10);
    });

    updateExportProgress(95, 'Finalizing PDF...');

    // Save
    setTimeout(function() {
        doc.save(state.title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
        updateExportProgress(100, 'Export complete!');
        
        setTimeout(function() {
            elements.exportProgress.classList.remove('active');
            elements.exportModal.classList.remove('active');
        }, 1500);
    }, 500);
}

function exportToTXT() {
    updateExportProgress(30, 'Preparing text...');
    
    let content = state.title + '\n';
    content += 'by ' + state.author + '\n';
    content += '\n' + '='.repeat(50) + '\n\n';
    
    state.pages.forEach(function(pageContent, idx) {
        const plainText = pageContent.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n\n').trim();
        content += plainText + '\n\n';
        content += '--- Page ' + (idx + 1) + ' ---\n\n';
    });
    
    updateExportProgress(80, 'Creating file...');
    
    setTimeout(function() {
        downloadFile(content, state.title + '.txt', 'text/plain');
        updateExportProgress(100, 'Export complete!');
        
        setTimeout(function() {
            elements.exportProgress.classList.remove('active');
            elements.exportModal.classList.remove('active');
        }, 1500);
    }, 500);
}

function exportToHTML() {
    updateExportProgress(30, 'Generating HTML...');
    
    const vintageStyle = elements.exportVintageStyle.checked;
    
    let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
    html += '<meta charset="UTF-8">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    html += '<title>' + escapeHtml(state.title) + '</title>\n';
    html += '<style>\n';
    
    if (vintageStyle) {
        html += 'body { font-family: Georgia, serif; background: #f4e4c1; color: #2c1810; max-width: 800px; margin: 0 auto; padding: 40px; }\n';
        html += 'h1 { text-align: center; color: #8b0000; border-bottom: 2px solid #654321; padding-bottom: 20px; }\n';
        html += '.author { text-align: center; font-style: italic; margin-bottom: 40px; }\n';
        html += '.page { margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.5); border-left: 3px solid #654321; }\n';
        html += 'p { text-indent: 2em; line-height: 1.8; text-align: justify; }\n';
        html += 'p:first-child { text-indent: 0; }\n';
        html += 'p:first-child::first-letter { font-size: 3em; float: left; padding-right: 10px; color: #8b0000; }\n';
    } else {
        html += 'body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; }\n';
        html += 'h1 { text-align: center; }\n';
        html += '.author { text-align: center; font-style: italic; margin-bottom: 40px; }\n';
        html += '.page { margin-bottom: 30px; }\n';
        html += 'p { text-indent: 2em; line-height: 1.8; }\n';
    }
    
    html += '</style>\n</head>\n<body>\n';
    html += '<h1>' + escapeHtml(state.title) + '</h1>\n';
    html += '<p class="author">by ' + escapeHtml(state.author) + '</p>\n';
    
    state.pages.forEach(function(pageContent, idx) {
        updateExportProgress(30 + (idx / state.pages.length) * 50, 'Processing page ' + (idx + 1) + '...');
        html += '<div class="page">\n' + pageContent + '\n</div>\n';
    });
    
    html += '</body>\n</html>';
    
    updateExportProgress(90, 'Creating file...');
    
    setTimeout(function() {
        downloadFile(html, state.title + '.html', 'text/html');
        updateExportProgress(100, 'Export complete!');
        
        setTimeout(function() {
            elements.exportProgress.classList.remove('active');
            elements.exportModal.classList.remove('active');
        }, 1500);
    }, 500);
}

function exportToEPUB() {
    updateExportProgress(20, 'Generating EPUB structure...');
    
    // Create a simplified EPUB (HTML file with EPUB-like structure)
    // For a full EPUB, you'd need a library like epub-gen
    
    let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
    content += '<html xmlns="http://www.w3.org/1999/xhtml">\n<head>\n';
    content += '<title>' + escapeHtml(state.title) + '</title>\n';
    content += '<style>body{font-family:Georgia,serif;margin:2em;line-height:1.8}h1{text-align:center}p{text-indent:2em;text-align:justify}</style>\n';
    content += '</head>\n<body>\n';
    content += '<h1>' + escapeHtml(state.title) + '</h1>\n';
    content += '<p style="text-align:center;font-style:italic">by ' + escapeHtml(state.author) + '</p>\n<hr/>\n';
    
    state.pages.forEach(function(pageContent, idx) {
        updateExportProgress(20 + (idx / state.pages.length) * 60, 'Processing page ' + (idx + 1) + '...');
        content += '<div>\n' + pageContent + '\n</div>\n';
    });
    
    content += '</body>\n</html>';
    
    updateExportProgress(90, 'Creating file...');
    
    setTimeout(function() {
        downloadFile(content, state.title + '.xhtml', 'application/xhtml+xml');
        updateExportProgress(100, 'Export complete! (XHTML format for e-readers)');
        
        setTimeout(function() {
            elements.exportProgress.classList.remove('active');
            elements.exportModal.classList.remove('active');
        }, 2000);
    }, 500);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function updateExportProgress(percent, text) {
    elements.exportProgressFill.style.width = percent + '%';
    elements.exportProgressText.textContent = text;
}

/* ============================================
   INITIALIZE NEW FEATURES
   ============================================ */

// Add to the existing DOMContentLoaded or call after cacheElements()
const originalSetup = setupEventListeners;

setupEventListeners = function() {
    originalSetup();
    
    // Initialize new features after a short delay to ensure DOM is ready
    setTimeout(function() {
        initSearch();
        initAudioReader();
        initExport();
    }, 100);
};

// If the page is already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        initSearch();
        initAudioReader();
        initExport();
    }, 100);
}

// ============================================
// DEMO TEXT
// ============================================

function loadDemoText() {
    const demoText = `CHAPTER I
The Beginning of All Things

It was a dark and stormy night when our tale begins. The wind howled through the ancient oaks that lined the manor's long driveway, their gnarled branches reaching toward the heavens like the fingers of desperate supplicants.

Inside the great house, candles flickered in their sconces, casting dancing shadows upon the walls. The fire in the library's massive hearth crackled and popped, sending sparks swirling up the chimney like miniature stars ascending to join their celestial brethren.

Lord Blackwood sat in his leather armchair, a glass of aged brandy warming in his weathered hands. His eyes, sharp despite his seventy years, were fixed upon the flames, but his thoughts wandered far beyond the confines of this room, beyond even the boundaries of his vast estate.

He thought of his youth, of adventures long past, of loves won and lost. The manor had witnessed so much—births and deaths, celebrations and sorrows, secrets whispered in shadowy corners that still echoed through its ancient halls.


CHAPTER II
A Mysterious Visitor

The clock had just struck midnight when the sound of hoofbeats pierced the storm's fury. Lord Blackwood raised his head, listening intently. Few would venture out on such a night, and fewer still would seek entrance to Blackwood Manor at such an hour.

The butler, ever vigilant despite the late hour, appeared at the library door. His face, normally impassive, bore the slightest hint of concern—a remarkable display of emotion for one so practiced in the art of domestic stoicism.

"My lord," he announced, "there is a visitor. A young lady, traveling alone. She claims to bear news of some urgency."

Lord Blackwood set down his brandy and rose slowly from his chair. His bones ached with the dampness that had seeped into the old house, but curiosity overrode discomfort. A young lady, alone, at midnight, in a storm? Such circumstances demanded investigation.


CHAPTER III
The Letter

The young woman who stood in the entrance hall was drenched from head to toe, her traveling cloak offering little protection against the tempest. Yet despite her bedraggled appearance, there was something noble in her bearing, something that spoke of gentle breeding and iron will combined.

"Forgive my intrusion, my lord," she said, her voice steady despite the chill that must have permeated her very bones. "I am Eleanor Ashworth, and I bring tidings that could not wait for morning's light."

From within her cloak, she produced a letter, its seal unbroken despite the journey. The wax bore an impression that made Lord Blackwood's heart skip a beat—an impression he had not seen for over forty years.

"This letter," Eleanor continued, "is from your brother, Sir William. He lives still, my lord, and he has sent me to bring you home."


CHAPTER IV
Revelations

The words hung in the air like morning mist over a meadow. Lord Blackwood felt the room spin slightly, and he gripped the back of a nearby chair for support.

"William?" he whispered. "But William died. The shipwreck... there were no survivors. They told us there were no survivors."

Eleanor shook her head gently. "There was one survivor, my lord. Your brother was rescued by fishermen and taken to a remote island where he lived in exile for many years. It is a long tale, and I shall tell it all, but first—might I trouble you for a seat by your fire? The journey has been most arduous."

And so began the strangest night of Lord Blackwood's long life. As the storm raged outside and the fire burned low, Eleanor Ashworth unfolded a tale of adventure, betrayal, and redemption that would change everything the old lord thought he knew about his family's past.


CHAPTER V
The Journey Begins

By the time dawn broke over the manor's ancient towers, Lord Blackwood had made his decision. Despite his advanced years, despite the comfortable life he had built within these walls, he would make this journey. He would find his brother.

"The path will not be easy," Eleanor warned. "Sir William resides now in a place few have seen and fewer still have returned from. There are those who do not wish him found, powerful enemies who believed their secrets buried with him at the bottom of the sea."

Lord Blackwood squared his shoulders with a resolve he had not felt in decades. "Then we shall ensure their disappointment is thorough and complete. Prepare the carriage, Hopkins. We leave within the hour."

And thus began an adventure that would take them across continents and through dangers untold, a journey that would test the very limits of human courage and reveal truths long hidden in shadow.


CHAPTER VI
Into the Unknown

The carriage rattled along muddy country roads as dawn painted the sky in shades of rose and gold. Inside, Lord Blackwood and Eleanor sat in contemplative silence, each lost in their own thoughts.

The landscape gradually changed as they traveled eastward. Rolling hills gave way to dense forests, their ancient trees standing sentinel over secrets as old as time itself. Villages became fewer, the people they encountered more wary of strangers.

"Tell me more of my brother," Lord Blackwood finally said, breaking the silence. "How did you come to know him? How did he survive all these years?"

Eleanor's eyes grew distant. "That, my lord, is a tale that spans decades and continents. It begins with a shipwreck, yes, but it continues through temples hidden in mountain mists, through bazaars in cities whose names are known only to explorers and dreamers."

She paused, as if weighing how much to reveal. "Your brother became something more than a man during his years of exile. He became a keeper of knowledge, a guardian of truths that powerful men would kill to possess—or to destroy."`;

    elements.textInput.value = demoText;
    elements.bookTitle.value = 'The Secrets of Blackwood Manor';
    elements.authorName.value = 'Victoria Ashworth';
}