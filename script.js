document.addEventListener("DOMContentLoaded", () => {

    /* ============================================================
       GLOBAL STATE
    ============================================================ */
    let soundEnabled = false;

    /* ============================================================
       VIDEO AUTOPLAY
    ============================================================ */
    const autoplayVideos = Array.from(document.querySelectorAll(".autoplay-video"));
    const autoplayVideosLower = Array.from(document.querySelectorAll(".autoplay-video-lower-threshhold"));

    function setupVideoDefaults(videos) {
        videos.forEach(video => {
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.preload = "auto";
        });
    }

    setupVideoDefaults(autoplayVideos);
    setupVideoDefaults(autoplayVideosLower);

    function processVideoGroup(videos, threshold = 400) {
        const screenCenter = window.innerHeight / 2;
        videos.forEach(video => {
            const rect = video.getBoundingClientRect();
            const videoCenter = rect.top + rect.height / 2;
            const isActive = Math.abs(videoCenter - screenCenter) < threshold;

            if (isActive) {
                video.classList.add("active");
                video.play().catch(() => { });
                if (soundEnabled && video.classList.contains("autoplay-video")) {
                    video.muted = false;
                    video.volume = 1.0;
                }
            } else {
                video.classList.remove("active");
                video.pause();
                video.muted = true;
            }
        });
    }

    processVideoGroup(autoplayVideos);
    processVideoGroup(autoplayVideosLower);

    window.addEventListener("scroll", () => {
        processVideoGroup(autoplayVideos);
        processVideoGroup(autoplayVideosLower);
    }, { passive: true });

    window.addEventListener("resize", () => {
        processVideoGroup(autoplayVideos);
        processVideoGroup(autoplayVideosLower);
    });

    /* ============================================================
       SIDEBAR SCROLL + ACTIVE LINK
    ============================================================ */
    const sections = Array.from(document.querySelectorAll("section"));
    const sidebarLinks = Array.from(document.querySelectorAll(".sidebar a"));

    function updateActiveLink(link) {
        sidebarLinks.forEach(l => l.classList.remove("active"));
        if (link) link.classList.add("active");
    }

    sidebarLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            updateActiveLink(link);
        });
    });

    window.addEventListener("scroll", () => {
        let currentSection = null;
        sections.forEach(section => {
            if (pageYOffset >= section.offsetTop - 100) {
                currentSection = section.getAttribute("id");
            }
        });
        sidebarLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
        });
    }, { passive: true });

    /* ============================================================
       SOUND TOGGLE
    ============================================================ */
    const soundBtn = document.getElementById("unmuteBtn");
    const btnText = soundBtn?.querySelector(".Button-content");

    soundBtn?.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        if (btnText) btnText.textContent = soundEnabled ? "Disable Sound" : "Enable Sound";

        const activeVideo = document.querySelector(".autoplay-video.active, .autoplay-video-lower-threshhold.active");
        if (activeVideo) {
            activeVideo.muted = !soundEnabled;
            if (soundEnabled) activeVideo.volume = 1.0;
        }
    });

    /* ============================================================
   CAROUSELS
============================================================ */
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

        function updateTrack() {
            const slideWidth = container.querySelector(".image-container").getBoundingClientRect().width;
            track.style.transform = `translateX(-${current * slideWidth}px)`;
            updateCode();
        }

        function updateCode() {
            if (!codeParagraphs.length) return;
            codeParagraphs.forEach(p => p.classList.remove("active"));
            const activePara = codeParagraphs.find(p => parseInt(p.dataset.slide) === current);
            if (activePara) activePara.classList.add("active");
        }

        function goTo(index) {
            current = (index + slides.length) % slides.length;
            updateTrack();
        }

        [prevBtn, nextBtn].forEach((btn, i) => {
            if (!btn) return;
            btn.addEventListener("click", e => {
                e.preventDefault();
                if (i === 0) goTo(current - 1);
                else goTo(current + 1);

                // subtle button press effect
                btn.style.transform = "translateY(1.2px) scale(0.985)";
                btn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.25)";
                setTimeout(() => {
                    btn.style.transform = "";
                    btn.style.boxShadow = "";
                }, 120);
            });
        });

        window.addEventListener("resize", updateTrack);
        updateTrack();
        updateCode();
    });








    /* ============================================================
       ITCH.IO EMBED
    ============================================================ */
    const playBtn = document.getElementById("playBtn");
    const iframeCover = document.getElementById("iframeCover");
    const restartBtn = document.getElementById('restartBtn');
    const iframeContainer = document.getElementById('iframeContainer');

    playBtn?.addEventListener("click", () => {
        if (iframeCover) iframeCover.style.display = "none";
    });

    restartBtn?.addEventListener("click", () => {
        const oldIframe = document.getElementById('gameIframe');
        if (oldIframe) oldIframe.remove();

        const newIframe = document.createElement('iframe');
        newIframe.id = 'gameIframe';
        newIframe.src = "https://itch.io/embed-upload/10516719?color=000000";
        newIframe.width = "100%";
        newIframe.height = "600px";
        newIframe.frameBorder = "0";
        newIframe.allowFullscreen = true;

        iframeContainer?.appendChild(newIframe);
        if (iframeCover) iframeCover.style.display = 'flex';
    });

    /* ============================================================
       BUTTON TYPE-2 CLICK ANIMATION
    ============================================================ */
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const origTransform = btn.style.transform || "";
            const origBoxShadow = btn.style.boxShadow || "";

            btn.style.transition = "transform 0.12s cubic-bezier(0.4,0,0.2,1), box-shadow 0.12s ease";
            btn.style.transform = "translateY(1.2px) scale(0.985)";
            btn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.25)";

            setTimeout(() => {
                btn.style.transform = origTransform;
                btn.style.boxShadow = origBoxShadow;
            }, 120); // matches the transition duration
        });
    });

});
