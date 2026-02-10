document.addEventListener("DOMContentLoaded", () => {

    /* ============================================================
   GLOBAL STATE
============================================================ */
    let soundEnabled = false

    /* ============================================================
   VIDEO AUTOPLAY
============================================================ */
    const autoplayVideos = Array.from(document.querySelectorAll(".autoplay-video"))
    const autoplayVideosLower = Array.from(document.querySelectorAll(".autoplay-video-lower-threshhold"))

    function setupVideoDefaults(videos) {
        videos.forEach(video => {
            video.loop = true
            video.muted = true
            video.playsInline = true
            video.preload = "auto"
        })
    }

    setupVideoDefaults(autoplayVideos)
    setupVideoDefaults(autoplayVideosLower)

    function processVideoGroup(videos, threshold = 400) {
        const screenCenter = window.innerHeight / 2
        videos.forEach(video => {
            const rect = video.getBoundingClientRect()
            const videoCenter = rect.top + rect.height / 2
            const isActive = Math.abs(videoCenter - screenCenter) < threshold

            if (isActive) {
                video.classList.add("active")
                video.play().catch(() => { })
                if (soundEnabled && video.classList.contains("autoplay-video")) {
                    video.muted = false
                    video.volume = 1.0
                }
            } else {
                video.classList.remove("active")
                video.pause()
                video.muted = true
            }
        })
    }

    processVideoGroup(autoplayVideos)
    processVideoGroup(autoplayVideosLower)

    window.addEventListener("scroll", () => {
        processVideoGroup(autoplayVideos)
        processVideoGroup(autoplayVideosLower)
    }, { passive: true })

    window.addEventListener("resize", () => {
        processVideoGroup(autoplayVideos)
        processVideoGroup(autoplayVideosLower)
    })

    /* ============================================================
   SIDEBAR SCROLL + ACTIVE LINK
============================================================ */
    const sections = Array.from(document.querySelectorAll("section"))
    const sidebarLinks = Array.from(document.querySelectorAll(".sidebar a"))

    function updateActiveLink(link) {
        sidebarLinks.forEach(l => l.classList.remove("active"))
        if (link) link.classList.add("active")
    }

    sidebarLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault()
            const target = document.querySelector(link.getAttribute("href"))
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" })
            updateActiveLink(link)
        })
    })

    window.addEventListener("scroll", () => {
        let currentSection = null
        sections.forEach(section => {
            if (pageYOffset >= section.offsetTop - 100) {
                currentSection = section.getAttribute("id")
            }
        })
        sidebarLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`)
        })
    }, { passive: true })

    /* ============================================================
   SOUND TOGGLE
============================================================ */
    const soundBtn = document.getElementById("unmuteBtn")
    const btnText = soundBtn?.querySelector(".Button-content")

    soundBtn?.addEventListener("click", () => {
        soundEnabled = !soundEnabled
        if (btnText) btnText.textContent = soundEnabled ? "Disable Sound" : "Enable Sound"

        const activeVideo = document.querySelector(".autoplay-video.active, .autoplay-video-lower-threshhold.active")
        if (activeVideo) {
            activeVideo.muted = !soundEnabled
            if (soundEnabled) activeVideo.volume = 1.0
        }
    })

    /* ============================================================
  CAROUSELS
  ============================================================ */
    window.addEventListener("load", () => {
        const carousels = document.querySelectorAll(".media-container");

        carousels.forEach(container => {
            const track = container.querySelector(".carousel-track");
            const slides = Array.from(track.querySelectorAll(".carousel-slide"));
            if (!slides.length) return;

            const prevBtn = container.querySelector(".prev.btn-type-2");
            const nextBtn = container.querySelector(".next.btn-type-2");

            const codeContainer = container.querySelector(".codeDescription-container");
            const codeParagraphs = codeContainer ? Array.from(codeContainer.querySelectorAll("p")) : [];

            let current = 0;
            let slideWidth = 0;
            let queue = [];
            let isTransitioning = false;

            function updateSlideWidth() {
                const slideEl = container.querySelector(".image-container");
                if (!slideEl) return;
                slideWidth = Math.round(slideEl.offsetWidth);
            }

            function updateTrack() {
                track.style.transition = "transform 0.3s ease";
                requestAnimationFrame(() => {
                    track.style.transform = `translateX(-${current * slideWidth}px)`;
                });

                if (codeParagraphs.length) {
                    codeParagraphs.forEach(p => p.classList.remove("active"));
                    const activePara = codeParagraphs.find(p => parseInt(p.dataset.slide) === current);
                    if (activePara) activePara.classList.add("active");
                }
            }

            function processQueue() {
                if (queue.length === 0 || isTransitioning) return;

                isTransitioning = true;
                current = (queue.shift() + slides.length) % slides.length;
                updateTrack();
            }

            track.addEventListener("transitionend", () => {
                isTransitioning = false;
                processQueue();
            });

            function handleClick(isPrev) {
                queue.push(isPrev ? current - 1 : current + 1);
                processQueue();
            }

            function setupButton(btn, isPrev) {
                if (!btn) return;
                btn.addEventListener("click", () => {
                    btn.style.transform = "translateY(1.2px) scale(0.985)";
                    btn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.25)";
                    setTimeout(() => {
                        btn.style.transform = "";
                        btn.style.boxShadow = "";
                    }, 120);

                    handleClick(isPrev);
                });
            }

            const images = Array.from(container.querySelectorAll("img"));
            let loaded = 0;
            if (images.length) {
                images.forEach(img => {
                    if (img.complete) loaded++;
                    else img.addEventListener("load", () => {
                        loaded++;
                        if (loaded === images.length) {
                            updateSlideWidth();
                            updateTrack();
                        }
                    });
                });
                if (loaded === images.length) {
                    updateSlideWidth();
                    updateTrack();
                }
            } else {
                updateSlideWidth();
                updateTrack();
            }

            setupButton(prevBtn, true);
            setupButton(nextBtn, false);

            window.addEventListener("resize", () => {
                updateSlideWidth();
                updateTrack();
            });
        });
    });










    /* ============================================================
   ITCH EMBED
============================================================ */
    const playBtn = document.getElementById("playBtn")
    const iframeCover = document.getElementById("iframeCover")
    const restartBtn = document.getElementById("restartBtn")
    const iframeContainer = document.getElementById("iframeContainer")

    playBtn?.addEventListener("click", () => {
        if (iframeCover) iframeCover.style.display = "none"
    })

    restartBtn?.addEventListener("click", () => {
        const oldIframe = document.getElementById("gameIframe")
        if (oldIframe) oldIframe.remove()

        const newIframe = document.createElement("iframe")
        newIframe.id = "gameIframe"
        newIframe.src = "https://itch.io/embed-upload/10516719?color=000000"
        newIframe.width = "100%"
        newIframe.height = "600px"
        newIframe.frameBorder = "0"
        newIframe.allowFullscreen = true

        iframeContainer?.appendChild(newIframe)
        if (iframeCover) iframeCover.style.display = "flex"
    })

    /* ============================================================
   BUTTON TYPE 2 CLICK ANIMATION
============================================================ */
    const buttons = document.querySelectorAll(".btn-type-2:not(.prev):not(.next)");
    buttons.forEach(btn => {
        btn.addEventListener("pointerdown", () => {
            btn.style.transform = "translateY(1.2px) scale(0.985)"
            btn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.25)"
        })

        const reset = () => {
            btn.style.transform = ""
            btn.style.boxShadow = ""
        }

        btn.addEventListener("pointerup", reset)
        btn.addEventListener("pointerleave", reset)
        btn.addEventListener("pointercancel", reset)
    })

    /* ============================================================
   EMAIL COPY FALLBACK
============================================================ */
    const emailLink = document.getElementById("emailLink")
    const emailAddress = "pg27reid@vfs.com"

    emailLink?.addEventListener("click", async e => {
        e.preventDefault()
        try {
            await navigator.clipboard.writeText(emailAddress)
            emailLink.classList.add("copied")
            setTimeout(() => emailLink.classList.remove("copied"), 1200)
        } catch {
            window.location.href = `mailto:${emailAddress}`
        }
    })
})
