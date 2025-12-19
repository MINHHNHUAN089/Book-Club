import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Book } from "../types";
import { getBook, getMyBooks, updateBookProgress } from "../api/backend";
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js - use CDN for Vite compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ReadingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get("bookId");
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("serif");
  const [theme, setTheme] = useState<"white" | "sepia" | "dark" | "black">("dark");
  const [progress, setProgress] = useState(0);
  const [userBookId, setUserBookId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pdfPages, setPdfPages] = useState<Map<number, HTMLCanvasElement>>(new Map());
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const estimatedProgressRef = useRef<number>(0);
  const savedScrollPositionRef = useRef<number | null>(null);

  // Load book and user progress
  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) {
        setError("Không tìm thấy ID sách");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const bookData = await getBook(parseInt(bookId));
        
        const authorName = bookData.authors && bookData.authors.length > 0
          ? bookData.authors.map((a: any) => a.name).join(", ")
          : bookData.author || "Unknown";
        
        const convertedBook: Book = {
          id: bookData.id.toString(),
          title: bookData.title,
          author: authorName,
          coverUrl: bookData.cover_url,
          fileUrl: bookData.file_url,
          progress: 0,
          description: bookData.description,
        };
        
        setBook(convertedBook);

        // Load user's progress for this book
        try {
          const userBooks = await getMyBooks();
          const userBook = userBooks.find(ub => ub.book_id === parseInt(bookId));
          if (userBook) {
            setUserBookId(userBook.id);
            const initialProgress = userBook.progress || 0;
            setProgress(initialProgress);
            estimatedProgressRef.current = initialProgress;
            
            // Load saved scroll position from localStorage
            const savedPosition = localStorage.getItem(`reading_position_${bookId}`);
            if (savedPosition) {
              savedScrollPositionRef.current = parseFloat(savedPosition);
              console.log("📖 Loaded saved scroll position:", savedScrollPositionRef.current);
            }
            
            startTimeRef.current = Date.now();
            lastActivityRef.current = Date.now();
          } else {
            // Book not in user's list yet, start at 0
            startTimeRef.current = Date.now();
            lastActivityRef.current = Date.now();
            estimatedProgressRef.current = 0;
          }
        } catch (err) {
          console.error("Error loading user progress:", err);
          startTimeRef.current = Date.now();
          lastActivityRef.current = Date.now();
        }

        setError(null);
      } catch (err) {
        console.error("Error loading book:", err);
        setError(err instanceof Error ? err.message : "Không thể tải thông tin sách");
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  // Load PDF document (metadata only, not pages)
  useEffect(() => {
    const loadPdfDocument = async () => {
      if (!book?.fileUrl || !book.fileUrl.includes('pdf')) {
        return;
      }

      try {
        setPdfLoading(true);
        setPdfError(null);
        console.log("📚 Loading PDF document:", book.fileUrl);

        // Try to load PDF with CORS handling
        const loadingTask = pdfjsLib.getDocument({
          url: book.fileUrl,
          httpHeaders: {},
          withCredentials: false,
          verbosity: 0, // Suppress warnings
          // Enable streaming for large files
          isEvalSupported: false,
          useSystemFonts: true
        });

        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);
        setPdfDocument(pdf);
        setUseIframeFallback(false);
        console.log("📄 PDF document loaded. Total pages:", pdf.numPages);

        // Restore scroll position if saved
        if (bookId && savedScrollPositionRef.current !== null) {
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = savedScrollPositionRef.current || 0;
              console.log("📍 Restored scroll position:", savedScrollPositionRef.current);
            }
          }, 500);
        }
      } catch (err: any) {
        console.error("❌ Error loading PDF document:", err);
        const errorMessage = err?.message || "Unknown error";
        console.error("Error details:", {
          message: errorMessage,
          name: err?.name,
          stack: err?.stack
        });
        
        // Fallback to iframe if PDF.js fails
        setPdfError(`PDF.js error: ${errorMessage}. Sử dụng iframe fallback.`);
        setUseIframeFallback(true);
        setPdfDocument(null);
      } finally {
        setPdfLoading(false);
      }
    };

    if (book?.fileUrl && !useIframeFallback) {
      loadPdfDocument();
    }
  }, [book?.fileUrl, bookId, useIframeFallback]);

  // Lazy load PDF pages as user scrolls
  const loadPage = useCallback(async (pageNum: number) => {
    if (!pdfDocument || pdfPages.has(pageNum) || loadingPages.has(pageNum)) {
      return;
    }

    try {
      setLoadingPages(prev => new Set(prev).add(pageNum));
      console.log(`📄 Loading page ${pageNum}...`);

      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        console.warn(`Cannot get context for page ${pageNum}`);
        return;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render page to canvas
      const renderContext: any = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      
      setPdfPages(prev => new Map(prev).set(pageNum, canvas));
      console.log(`✅ Rendered page ${pageNum}/${totalPages}`);
    } catch (err) {
      console.error(`Error loading page ${pageNum}:`, err);
    } finally {
      setLoadingPages(prev => {
        const next = new Set(prev);
        next.delete(pageNum);
        return next;
      });
    }
  }, [pdfDocument, pdfPages, loadingPages, totalPages]);

  // Load pages near viewport (current page ± 2)
  useEffect(() => {
    if (!pdfDocument || totalPages === 0) return;

    const pagesToLoad = new Set<number>();
    
    // Load current page and nearby pages
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      if (!pdfPages.has(i)) {
        pagesToLoad.add(i);
      }
    }

    // Also load first few pages immediately
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      if (!pdfPages.has(i)) {
        pagesToLoad.add(i);
      }
    }

    pagesToLoad.forEach(pageNum => {
      loadPage(pageNum);
    });
  }, [pdfDocument, currentPage, totalPages, pdfPages, loadPage]);

  // Update progress in backend (debounced)
  const updateProgressInBackend = useCallback(async (newProgress: number) => {
    if (!userBookId || newProgress < 0 || newProgress > 100) return;

    // Clear previous timeout
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }

    // Debounce: wait 1 second before updating
    progressUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateBookProgress(userBookId, Math.round(newProgress));
        console.log("Progress updated:", Math.round(newProgress));
        
        // Dispatch custom event to notify App.tsx to reload data
        window.dispatchEvent(new CustomEvent('bookProgressUpdated', {
          detail: { bookId: bookId, progress: Math.round(newProgress) }
        }));
      } catch (err) {
        console.error("Error updating progress:", err);
      }
    }, 1000);
  }, [userBookId, bookId]);

  // Track scroll in PDF iframe
  useEffect(() => {
    console.log("🔵 [Progress Tracking] useEffect started", { 
      hasFileUrl: !!book?.fileUrl, 
      hasIframe: !!iframeRef.current,
      hasUserBookId: !!userBookId,
      currentProgress: progress
    });

    if (!book?.fileUrl || !iframeRef.current || !userBookId) {
      console.log("⚠️ [Progress Tracking] Missing requirements, exiting", {
        fileUrl: book?.fileUrl,
        iframe: iframeRef.current,
        userBookId
      });
      return;
    }

    const iframe = iframeRef.current;
    console.log("📄 [Progress Tracking] Iframe element:", {
      src: iframe.src,
      contentWindow: !!iframe.contentWindow,
      contentDocument: !!iframe.contentDocument
    });

    let lastProgress = progress;
    let scrollCheckInterval: ReturnType<typeof setInterval> | null = null;
    let canAccessIframe = false;

    const checkProgress = () => {
      try {
        // Try to access iframe content (may fail due to CORS)
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          console.log("❌ [checkProgress] Cannot access iframe document", {
            hasContentWindow: !!iframe.contentWindow,
            hasContentDocument: !!iframe.contentDocument
          });
          return;
        }

        if (!canAccessIframe) {
          console.log("✅ [checkProgress] Successfully accessed iframe document for the first time!");
          canAccessIframe = true;
        }
        
        // Try multiple methods to get scroll position
        let currentScrollTop = 0;
        let currentScrollHeight = 0;
        let currentClientHeight = 0;

        // Method 1: Standard scroll properties
        currentScrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop || 0;
        currentScrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight || 0;
        currentClientHeight = iframeDoc.documentElement.clientHeight || iframeDoc.body.clientHeight || 0;

        // Method 2: Try window properties
        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            currentScrollTop = iframeWindow.pageYOffset || iframeWindow.scrollY || currentScrollTop;
            currentScrollHeight = Math.max(currentScrollHeight, iframeWindow.document?.documentElement?.scrollHeight || 0);
            currentClientHeight = Math.max(currentClientHeight, iframeWindow.innerHeight || 0);
          }
        } catch (e) {
          // Ignore
        }

        // Method 3: Check for PDF.js viewer
        try {
          const pdfViewer = iframeDoc.querySelector('#viewer') || iframeDoc.querySelector('.pdfViewer');
          if (pdfViewer) {
            const viewerScrollTop = (pdfViewer as HTMLElement).scrollTop || 0;
            const viewerScrollHeight = (pdfViewer as HTMLElement).scrollHeight || 0;
            const viewerClientHeight = (pdfViewer as HTMLElement).clientHeight || 0;
            
            if (viewerScrollHeight > 0) {
              currentScrollTop = viewerScrollTop;
              currentScrollHeight = viewerScrollHeight;
              currentClientHeight = viewerClientHeight;
            }
          }
        } catch (e) {
          // Ignore
        }

        const scrollTop = currentScrollTop;
        const scrollHeight = currentScrollHeight;
        const clientHeight = currentClientHeight;

        console.log("📊 [checkProgress] Scroll check:", { 
          scrollTop, 
          scrollHeight, 
          clientHeight, 
          maxScroll: scrollHeight - clientHeight,
          method1: {
            docScroll: iframeDoc.documentElement.scrollTop,
            bodyScroll: iframeDoc.body.scrollTop,
            docHeight: iframeDoc.documentElement.scrollHeight,
            bodyHeight: iframeDoc.body.scrollHeight
          },
          hasPdfViewer: !!(iframeDoc.querySelector('#viewer') || iframeDoc.querySelector('.pdfViewer'))
        });

        if (scrollHeight > clientHeight && scrollHeight > 0 && clientHeight > 0) {
          const maxScroll = scrollHeight - clientHeight;
          if (maxScroll > 0) {
            const newProgress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
            
            console.log("🧮 [checkProgress] Calculated progress:", {
              newProgress,
              lastProgress,
              difference: Math.abs(newProgress - lastProgress),
              willUpdate: Math.abs(newProgress - lastProgress) >= 0.5
            });
            
            // Only update if progress changed significantly (more than 0.5%)
            if (Math.abs(newProgress - lastProgress) >= 0.5) {
              lastProgress = newProgress;
              setProgress(newProgress);
              updateProgressInBackend(newProgress);
              
              // Save scroll position to localStorage
              if (bookId) {
                localStorage.setItem(`reading_position_${bookId}`, scrollTop.toString());
                console.log("💾 Saved scroll position:", scrollTop);
              }
              
              console.log("✅ [checkProgress] Progress updated to:", newProgress, "%");
            } else {
              console.log("⏸️ [checkProgress] Progress change too small, skipping update");
            }
          }
        } else if (scrollHeight > 0 && clientHeight > 0 && scrollHeight <= clientHeight) {
          // PDF is fully visible, consider it 100%
          if (lastProgress < 100) {
            console.log("PDF fully visible, setting to 100%");
            lastProgress = 100;
            setProgress(100);
            updateProgressInBackend(100);
          }
        } else {
          console.log("⚠️ [checkProgress] Cannot calculate progress - invalid dimensions:", { 
            scrollHeight, 
            clientHeight,
            scrollHeightValid: scrollHeight > 0,
            clientHeightValid: clientHeight > 0,
            canCalculate: scrollHeight > clientHeight
          });
        }
      } catch (err) {
        // CORS error
        console.error("🚫 [checkProgress] CORS error accessing iframe:", {
          error: err,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
          iframeSrc: iframe.src
        });
        canAccessIframe = false;
      }
    };

    // Inject script into iframe to track scroll (if same origin)
    const injectScrollTracker = () => {
      console.log("💉 [injectScrollTracker] Attempting to inject scroll tracker script...");
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          console.log("❌ [injectScrollTracker] Cannot access iframe document for script injection", {
            hasContentWindow: !!iframe.contentWindow,
            hasContentDocument: !!iframe.contentDocument
          });
          return;
        }

        // Check if script already injected
        if (iframeDoc.getElementById('scroll-tracker-script')) {
          console.log("ℹ️ [injectScrollTracker] Scroll tracker script already injected");
          return;
        }

        const script = iframeDoc.createElement('script');
        script.id = 'scroll-tracker-script';
        script.textContent = `
          (function() {
            let lastScrollTop = 0;
            let lastProgress = 0;
            
            function trackScroll() {
              try {
                // Try multiple methods to get scroll position
                let scrollTop = window.pageYOffset || window.scrollY || 
                               document.documentElement.scrollTop || 
                               document.body.scrollTop || 0;
                let scrollHeight = Math.max(
                  document.documentElement.scrollHeight || 0,
                  document.body.scrollHeight || 0,
                  document.documentElement.offsetHeight || 0
                );
                let clientHeight = Math.max(
                  document.documentElement.clientHeight || 0,
                  document.body.clientHeight || 0,
                  window.innerHeight || 0
                );
                
                // Check for PDF.js viewer
                const pdfViewer = document.querySelector('#viewer') || document.querySelector('.pdfViewer');
                if (pdfViewer) {
                  scrollTop = pdfViewer.scrollTop || scrollTop;
                  scrollHeight = pdfViewer.scrollHeight || scrollHeight;
                  clientHeight = pdfViewer.clientHeight || clientHeight;
                }
                
                if (scrollHeight > clientHeight && scrollHeight > 0) {
                  const maxScroll = scrollHeight - clientHeight;
                  if (maxScroll > 0) {
                    const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
                    
                    if (Math.abs(progress - lastProgress) >= 0.5) {
                      lastProgress = progress;
                      window.parent.postMessage({
                        type: 'pdfScroll',
                        scrollTop: scrollTop,
                        scrollHeight: scrollHeight,
                        clientHeight: clientHeight,
                        progress: progress
                      }, '*');
                    }
                  }
                } else if (scrollHeight > 0 && scrollHeight <= clientHeight) {
                  // Fully visible
                  if (lastProgress < 100) {
                    lastProgress = 100;
                    window.parent.postMessage({
                      type: 'pdfScroll',
                      scrollTop: 0,
                      scrollHeight: scrollHeight,
                      clientHeight: clientHeight,
                      progress: 100
                    }, '*');
                  }
                }
              } catch (e) {
                console.error('Error in scroll tracker:', e);
              }
            }
            
            // Attach listeners
            window.addEventListener('scroll', trackScroll, { passive: true });
            window.addEventListener('wheel', trackScroll, { passive: true });
            window.addEventListener('touchmove', trackScroll, { passive: true });
            document.addEventListener('scroll', trackScroll, { passive: true });
            
            // Also check periodically
            setInterval(trackScroll, 500);
            
            // Initial check
            setTimeout(trackScroll, 1000);
          })();
        `;
        iframeDoc.head.appendChild(script);
        console.log("✅ [injectScrollTracker] Scroll tracker script injected successfully");
      } catch (err) {
        console.error("❌ [injectScrollTracker] Cannot inject script (CORS or other error):", {
          error: err,
          errorMessage: err instanceof Error ? err.message : String(err),
          iframeSrc: iframe.src
        });
      }
    };

    // Listen for scroll events via message passing
    const handleMessage = (event: MessageEvent) => {
      // Log all messages for debugging
      if (event.data && typeof event.data === 'object') {
        console.log("📨 [handleMessage] Received message:", {
          type: event.data.type,
          origin: event.origin,
          data: event.data
        });
      }

      if (event.data && typeof event.data === 'object' && event.data.type === 'pdfScroll') {
        const { scrollTop, scrollHeight, clientHeight, progress: messageProgress } = event.data;
        console.log("📨 [handleMessage] PDF scroll message received:", {
          scrollTop,
          scrollHeight,
          clientHeight,
          messageProgress,
          lastProgress
        });
        
        // Use progress from message if available, otherwise calculate
        let newProgress = messageProgress;
        
        if (newProgress === undefined) {
          if (scrollHeight > clientHeight && scrollHeight > 0) {
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll > 0) {
              newProgress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
              console.log("🧮 [handleMessage] Calculated progress from scroll data:", newProgress);
            }
          } else if (scrollHeight > 0 && scrollHeight <= clientHeight) {
            newProgress = 100;
            console.log("🧮 [handleMessage] PDF fully visible, setting to 100%");
          }
        }
        
        if (newProgress !== undefined && Math.abs(newProgress - lastProgress) >= 0.5) {
          lastProgress = newProgress;
          setProgress(newProgress);
          updateProgressInBackend(newProgress);
          
          // Save scroll position to localStorage
          if (bookId && scrollTop !== undefined) {
            localStorage.setItem(`reading_position_${bookId}`, scrollTop.toString());
            console.log("💾 Saved scroll position from message:", scrollTop);
          }
          
          console.log("✅ [handleMessage] Progress updated from message:", newProgress, "%", "Scroll:", { scrollTop, scrollHeight, clientHeight });
        } else if (newProgress !== undefined) {
          console.log("⏸️ [handleMessage] Progress change too small, skipping update", {
            newProgress,
            lastProgress,
            difference: Math.abs(newProgress - lastProgress)
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    console.log("👂 [Progress Tracking] Message listener attached to window");

    // Try to attach scroll listener to iframe
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        console.log("✅ [Progress Tracking] Successfully accessed iframe document, attaching listeners");
        iframeDoc.addEventListener('scroll', checkProgress, { passive: true });
        iframeDoc.addEventListener('wheel', checkProgress, { passive: true });
        iframeDoc.addEventListener('touchmove', checkProgress, { passive: true });
        console.log("👂 [Progress Tracking] Scroll/wheel/touch listeners attached to iframe document");
        
        // Try to inject scroll tracker
        setTimeout(() => {
          console.log("⏰ [Progress Tracking] Timeout 1s: Attempting to inject scroll tracker");
          injectScrollTracker();
        }, 1000);
      } else {
        console.log("⚠️ [Progress Tracking] Cannot access iframe document for attaching listeners");
      }
    } catch (err) {
      console.error("🚫 [Progress Tracking] Cannot attach scroll listener to iframe (CORS):", {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err)
      });
    }

    // Track user activity (mouse movement, keyboard, scroll on window)
    const trackActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', trackActivity, { passive: true });
    window.addEventListener('keydown', trackActivity, { passive: true });
    window.addEventListener('wheel', trackActivity, { passive: true });
    window.addEventListener('touchmove', trackActivity, { passive: true });

    // Periodic check as fallback (every 1 second)
    console.log("⏰ [Progress Tracking] Setting up periodic check interval (1s)");
    scrollCheckInterval = setInterval(() => {
      console.log("🔄 [Progress Tracking] Periodic check running...", {
        canAccessIframe,
        currentProgress: lastProgress
      });
      checkProgress();
      
      // Fallback: Estimate progress based on reading time if we can't access iframe
      if (!canAccessIframe) {
        const timeSinceStart = Date.now() - startTimeRef.current;
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        console.log("⏱️ [Progress Tracking] Fallback estimation check:", {
          timeSinceStart: Math.round(timeSinceStart / 1000) + "s",
          timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000) + "s",
          isActive: timeSinceLastActivity < 30000,
          hasEnoughTime: timeSinceStart > 5000
        });
        
        // Only estimate if user is active (activity within last 30 seconds)
        if (timeSinceLastActivity < 30000 && timeSinceStart > 5000) {
          // Estimate: assume average reading speed of 1 page per 2 minutes
          // This is just a fallback estimate
          const estimatedPagesRead = Math.min(8, (timeSinceStart / 120000)); // 8 pages max
          const estimatedProgress = Math.min(95, (estimatedPagesRead / 8) * 100); // Cap at 95% until we confirm
          
          if (estimatedProgress > estimatedProgressRef.current) {
            estimatedProgressRef.current = estimatedProgress;
            // Don't auto-update, just log for debugging
            console.log("📈 [Progress Tracking] Estimated progress (time-based):", estimatedProgress, "%");
          }
        }
      }
    }, 1000);

    // Initial check after iframe loads
    setTimeout(() => {
      console.log("⏰ [Progress Tracking] Timeout 2s: Initial check and script injection");
      checkProgress();
      injectScrollTracker();
    }, 2000);

    // Check again after 5 seconds (PDF might load slowly)
    setTimeout(() => {
      console.log("⏰ [Progress Tracking] Timeout 5s: Delayed check (PDF might load slowly)");
      checkProgress();
    }, 5000);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('mousemove', trackActivity);
      window.removeEventListener('keydown', trackActivity);
      window.removeEventListener('wheel', trackActivity);
      window.removeEventListener('touchmove', trackActivity);
      if (scrollCheckInterval) {
        clearInterval(scrollCheckInterval);
      }
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.removeEventListener('scroll', checkProgress);
          iframeDoc.removeEventListener('wheel', checkProgress);
          iframeDoc.removeEventListener('touchmove', checkProgress);
        }
      } catch (err) {
        // Ignore CORS errors
      }
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, [book?.fileUrl, userBookId, updateProgressInBackend]);

  const getThemeBackground = () => {
    switch (theme) {
      case "white": return "#ffffff";
      case "sepia": return "#f5f1e6";
      case "dark": return "#111618";
      case "black": return "#000000";
      default: return "#111618";
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case "white": return "#111618";
      case "sepia": return "#3d3526";
      case "dark": return "#cbd5e1";
      case "black": return "#ffffff";
      default: return "#cbd5e1";
    }
  };

  // Function to save current reading position
  const saveCurrentPosition = () => {
    if (!containerRef.current || !bookId) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
      return;
    }

    setSaveStatus("saving");

    try {
      const scrollTop = containerRef.current.scrollTop;
      
      // Calculate current page based on scroll position
      if (containerRef.current && pdfPages.size > 0) {
        const pageHeight = containerRef.current.scrollHeight / totalPages;
        const currentPageNum = Math.floor(scrollTop / pageHeight) + 1;
        setCurrentPage(Math.min(currentPageNum, totalPages));
      }

      // Save to localStorage
      if (bookId && scrollTop >= 0) {
        localStorage.setItem(`reading_position_${bookId}`, scrollTop.toString());
        localStorage.setItem(`reading_page_${bookId}`, currentPage.toString());
        localStorage.setItem(`reading_progress_${bookId}`, progress.toString());
        savedScrollPositionRef.current = scrollTop;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
        console.log("💾 Saved scroll position:", scrollTop, "Page:", currentPage, "Progress:", progress);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (err) {
      console.error("Error saving position:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  // Track scroll to update progress and current page
  useEffect(() => {
    if (!containerRef.current || totalPages === 0) return;

    const container = containerRef.current;
    let lastProgress = progress;

    const handleScroll = () => {
      if (!container) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Calculate progress
      if (scrollHeight > clientHeight) {
        const maxScroll = scrollHeight - clientHeight;
        if (maxScroll > 0) {
          const newProgress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
          
          if (Math.abs(newProgress - lastProgress) >= 0.5) {
            lastProgress = newProgress;
            setProgress(newProgress);
            updateProgressInBackend(newProgress);
          }
        }
      }

      // Calculate current page based on scroll position
      // Estimate: each page takes roughly the same height
      if (totalPages > 0 && container) {
        // Get all page elements
        const pageElements = container.querySelectorAll('[data-page-number]');
        if (pageElements.length > 0) {
          // Find which page is currently in viewport
          const viewportTop = scrollTop;
          const viewportBottom = scrollTop + clientHeight;
          
          let foundPage = 1;
          pageElements.forEach((el) => {
            const pageNum = parseInt(el.getAttribute('data-page-number') || '1');
            const rect = el.getBoundingClientRect();
            const elementTop = scrollTop + rect.top - container.offsetTop;
            const elementBottom = elementTop + rect.height;
            
            // If page is in viewport
            if (elementTop <= viewportBottom && elementBottom >= viewportTop) {
              foundPage = pageNum;
            }
          });
          
          setCurrentPage(Math.min(Math.max(1, foundPage), totalPages));
        } else {
          // Fallback: estimate based on scroll percentage
          const pageHeight = scrollHeight / totalPages;
          const currentPageNum = Math.floor(scrollTop / pageHeight) + 1;
          setCurrentPage(Math.min(Math.max(1, currentPageNum), totalPages));
        }
      }

      // Save scroll position for restore
      if (bookId) {
        savedScrollPositionRef.current = scrollTop;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [totalPages, bookId, updateProgressInBackend, progress]);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "#101c22",
        color: "#e2e8f0"
      }}>
        <div style={{ fontSize: "18px" }}>Đang tải...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#101c22",
        color: "#e2e8f0"
      }}>
        <h2 style={{ marginBottom: "16px" }}>Lỗi</h2>
        <p style={{ marginBottom: "24px", color: "#94a3b8" }}>{error || "Không tìm thấy sách"}</p>
        <button 
          className="primary-btn"
          onClick={() => navigate("/books")}
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!book.fileUrl) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#101c22",
        color: "#e2e8f0"
      }}>
        <h2 style={{ marginBottom: "16px" }}>Chưa có file PDF</h2>
        <p style={{ marginBottom: "24px", color: "#94a3b8" }}>Sách này chưa có file PDF để đọc. Vui lòng liên hệ admin để thêm file.</p>
        <button 
          className="primary-btn"
          onClick={() => navigate(`/review?bookId=${book.id}`)}
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Calculate header height for positioning
  const headerHeight = 80; // Approximate header height

  return (
    <div className="dark-page" style={{ 
      width: "100%",
      height: "100vh",
      minHeight: "100vh",
      position: "relative"
    }}>
      {/* Header - Fixed with backdrop blur */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "12px 24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "100%" }}>
          <div className="brand" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-icon">📘</div>
            <div>
              <div className="brand-title">BookClub</div>
            </div>
          </div>
          <div className="header-nav">
            <Navigation />
          </div>
          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
            onClick={saveCurrentPosition}
            disabled={saveStatus === "saving"}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: saveStatus === "saved" 
                ? "rgba(34, 197, 94, 0.1)" 
                : saveStatus === "error"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(148, 163, 184, 0.1)",
              color: saveStatus === "saved"
                ? "#22c55e"
                : saveStatus === "error"
                ? "#ef4444"
                : "#94a3b8",
              border: saveStatus === "saved"
                ? "1px solid rgba(34, 197, 94, 0.3)"
                : saveStatus === "error"
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(148, 163, 184, 0.3)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
              marginRight: "12px",
              opacity: saveStatus === "saving" ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {saveStatus === "saving" && "⏳"}
            {saveStatus === "saved" && "✓"}
            {saveStatus === "error" && "✗"}
            {saveStatus === "saving" ? "Đang lưu..." : saveStatus === "saved" ? "Đã lưu" : saveStatus === "error" ? "Lỗi" : "💾 Lưu trang đang đọc"}
            </button>
            {userBookId && (
            <button
              onClick={async () => {
                if (confirm("Bạn đã đọc xong cuốn sách này? (Sẽ cập nhật tiến độ lên 100%)")) {
                  setProgress(100);
                  try {
                    await updateBookProgress(userBookId, 100);
                    window.dispatchEvent(new CustomEvent('bookProgressUpdated', {
                      detail: { bookId: bookId, progress: 100 }
                    }));
                    alert("Đã cập nhật tiến độ lên 100%!");
                  } catch (err) {
                    console.error("Error updating progress:", err);
                    alert("Không thể cập nhật tiến độ");
                  }
                }
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(19, 164, 236, 0.1)",
                color: "#13a4ec",
                border: "1px solid rgba(19, 164, 236, 0.3)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                marginRight: "12px"
              }}
            >
              Đánh dấu đã đọc
            </button>
            )}
            <div 
              className="avatar" 
              aria-label="User avatar"
              onClick={() => navigate("/user")}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area - Fixed positioning */}
      <div style={{
        position: "fixed",
        top: `${headerHeight}px`,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme === "dark" || theme === "black" ? "#1a1f2e" : theme === "white" ? "#f8fafc" : theme === "sepia" ? "#f5f1e6" : "#1a1f2e",
        overflow: "hidden"
      }}>
        {/* Settings Sidebar */}
        {showSettings && (
          <div style={{
            position: "absolute",
            top: "16px",
            right: "24px",
            width: "288px",
            backgroundColor: "#1e2830",
            borderRadius: "12px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "16px",
            zIndex: 40,
            animation: "fadeIn 0.2s ease-in"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#64748b"
              }}>
                Appearance
              </span>
              <button
                onClick={() => {
                  setFontSize(40);
                  setFontFamily("serif");
                  setTheme("dark");
                }}
                style={{
                  color: "#13a4ec",
                  fontSize: "12px",
                  fontWeight: 700,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Reset
              </button>
            </div>

            {/* Font Family */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {[
                { key: "sans", label: "Sans" },
                { key: "serif", label: "Serif" },
                { key: "mono", label: "Mono" }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFontFamily(f.key as any)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: fontFamily === f.key ? "rgba(19, 164, 236, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    color: fontFamily === f.key ? "#13a4ec" : "#e2e8f0",
                    border: fontFamily === f.key ? "2px solid #13a4ec" : "2px solid transparent",
                    fontSize: "14px",
                    fontWeight: fontFamily === f.key ? 700 : 400,
                    cursor: "pointer"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Font Size */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>A-</span>
              <input
                type="range"
                min="0"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: "4px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  outline: "none",
                  accentColor: "#13a4ec"
                }}
              />
              <span style={{ color: "#64748b", fontSize: "18px" }}>A+</span>
            </div>

            {/* Theme Colors */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
              {[
                { key: "white", color: "#ffffff" },
                { key: "sepia", color: "#f5f1e6" },
                { key: "dark", color: "#111618" },
                { key: "black", color: "#000000" }
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key as any)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: t.color,
                    border: theme === t.key ? "2px solid #13a4ec" : "1px solid rgba(255, 255, 255, 0.2)",
                    cursor: "pointer",
                    position: "relative",
                    boxShadow: theme === t.key ? "0 0 0 2px rgba(19, 164, 236, 0.3)" : "none"
                  }}
                >
                  {theme === t.key && (
                    <span style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: t.key === "dark" || t.key === "black" ? "#fff" : "#000",
                      fontSize: "16px"
                    }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable PDF Container */}
        <div 
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px",
            paddingTop: "24px",
            paddingBottom: "24px",
            gap: "24px",
            backgroundColor: theme === "dark" || theme === "black" ? "#1a1f2e" : theme === "white" ? "#f8fafc" : theme === "sepia" ? "#f5f1e6" : "#1a1f2e",
            scrollBehavior: "smooth"
          }}
        >
          {book.fileUrl.endsWith('.pdf') || book.fileUrl.includes('pdf') ? (
            <>
              {useIframeFallback ? (
                // Fallback to iframe if PDF.js fails
                <iframe
                  ref={iframeRef}
                  src={book.fileUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none"
                  }}
                  title={`Đọc sách: ${book.title}`}
                />
              ) : (
                <>
                  {pdfLoading && (
                    <div style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      color: "#cbd5e1"
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", marginBottom: "12px" }}>Đang tải PDF...</div>
                        <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                          {totalPages > 0 ? `Đã tải ${pdfPages.size}/${totalPages} trang` : "Đang khởi tạo..."}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!pdfLoading && totalPages > 0 && (
                    <>
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNum = index + 1;
                        const canvas = pdfPages.get(pageNum);
                        const isLoading = loadingPages.has(pageNum);

                        return (
                          <div
                            key={pageNum}
                            id={`page-${pageNum}`}
                            data-page-id={pageNum}
                            style={{
                              width: "100%",
                              maxWidth: "900px",
                              margin: "0 auto"
                            }}
                          >
                            <div style={{
                              borderRadius: "8px",
                              flexShrink: 0,
                              position: "relative",
                              display: "block",
                              backgroundColor: "#ffffff",
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)",
                              overflow: "hidden",
                              transition: "box-shadow 0.3s ease",
                              // CSS variable for scale factor
                              "--scale-factor": "1"
                            } as React.CSSProperties & { "--scale-factor": string }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = "0 15px 35px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -2px rgba(0, 0, 0, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)";
                            }}
                          >
                              {canvas ? (
                                <img
                                  src={canvas.toDataURL()}
                                  alt={`Trang ${pageNum}`}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    display: "block",
                                    margin: "0 auto"
                                  }}
                                />
                              ) : isLoading ? (
                                <div style={{
                                  padding: "40px",
                                  color: "#94a3b8",
                                  textAlign: "center",
                                  minHeight: "800px",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(255, 255, 255, 0.02)"
                                }}>
                                  <div style={{ marginBottom: "8px" }}>Đang tải trang {pageNum}...</div>
                                  <div style={{ fontSize: "12px" }}>Vui lòng đợi</div>
                                </div>
                              ) : (
                                <div style={{
                                  padding: "40px",
                                  color: "#64748b",
                                  textAlign: "center",
                                  fontSize: "14px",
                                  minHeight: "400px",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(255, 255, 255, 0.02)"
                                }}>
                                  Trang {pageNum} - Scroll để tải
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {!pdfLoading && totalPages === 0 && !error && !useIframeFallback && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      color: "#cbd5e1",
                      gap: "12px"
                    }}>
                      <div>Không thể tải PDF với PDF.js.</div>
                      {pdfError && (
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{pdfError}</div>
                      )}
                      <button
                        onClick={() => setUseIframeFallback(true)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          background: "rgba(19, 164, 236, 0.1)",
                          color: "#13a4ec",
                          border: "1px solid rgba(19, 164, 236, 0.3)",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          marginTop: "8px"
                        }}
                      >
                        Sử dụng iframe (fallback)
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              padding: "20px"
            }}>
              <p style={{ marginBottom: "16px", fontSize: "18px" }}>
                File không phải PDF. Vui lòng tải xuống để xem.
              </p>
              <a
                href={book.fileUrl}
                download
                className="primary-btn"
                style={{ textDecoration: "none" }}
              >
                Tải xuống file
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <footer style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#152028",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "12px 24px",
        zIndex: 30
      }}>
        {totalPages > 0 && (
          <div style={{
            textAlign: "center",
            marginBottom: "8px",
            fontSize: "14px",
            color: "#94a3b8"
          }}>
            Trang {currentPage} / {totalPages}
          </div>
        )}
        <div style={{
          maxWidth: "960px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            fontSize: "12px",
            fontWeight: 500,
            color: "#64748b",
            marginBottom: "4px"
          }}>
            <span>{progress}%</span>
          </div>
          <div 
            style={{
              height: "6px",
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "9999px",
              overflow: "hidden",
              cursor: "pointer",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              const dot = e.currentTarget.querySelector('.progress-dot') as HTMLElement;
              if (dot) dot.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              const dot = e.currentTarget.querySelector('.progress-dot') as HTMLElement;
              if (dot) dot.style.opacity = "0";
            }}
          >
            <div style={{
              height: "100%",
              backgroundColor: "#13a4ec",
              borderRadius: "9999px",
              width: `${progress}%`,
              position: "relative"
            }}>
              <div 
                className="progress-dot"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  opacity: 0,
                  transition: "opacity 0.2s"
                }} 
              />
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ReadingPage;
