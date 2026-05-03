document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Detect mobile once — used to simplify animations on small screens
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // ── Hero: breadcrumb, eyebrow, title, subtitle ──────────────
    // On mobile: opacity only, no y movement (avoids layout recalc)
    const heroElements = [
        document.querySelector('.cs-breadcrumb'),
        document.querySelector('.cs-hero .label-eyebrow'),
        document.querySelector('.cs-title'),
        document.querySelector('.cs-subtitle'),
    ].filter(Boolean);

    if (heroElements.length) {
        gsap.from(heroElements, {
            opacity: 0,
            y: isMobile ? 0 : 20,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.1,
            delay: 0.15,
            // Clean up will-change after animation — reduces GPU memory use
            onComplete: () => {
                heroElements.forEach(el => el.style.willChange = 'auto');
            }
        });
    }

    // ── Cover image: opacity fade only, no y ───────────────────
    const cover = document.querySelector('.cs-cover');
    if (cover) {
        gsap.from(cover, {
            opacity: 0,
            duration: 0.8,
            ease: 'power1.out',
            delay: 0.3,
            onComplete: () => { cover.style.willChange = 'auto'; }
        });
    }

    // ── Snapshot items ─────────────────────────────────────────
    // On mobile: fade only.
    const snapshotItems = gsap.utils.toArray('.cs-snapshot-item');
    if (snapshotItems.length) {
        gsap.from(snapshotItems, {
            opacity: 0,
            y: isMobile ? 0 : 14,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.06,
            onComplete: () => {
                snapshotItems.forEach(el => el.style.willChange = 'auto');
            },
            scrollTrigger: {
                trigger: '.cs-snapshot',
                start: 'top 90%',
                once: true   // destroys listener after firing — fewer active watchers
            }
        });
    }

    // ── Body sections ──────────────────────────────────────────
    // On desktop: gentle y fade-up per section.
    // On mobile: opacity only — no y at all. 
    const sections = gsap.utils.toArray('.cs-section');
    sections.forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: isMobile ? 0 : 20,
            duration: 0.65,
            ease: 'power1.out',
            onComplete: () => { section.style.willChange = 'auto'; },
            scrollTrigger: {
                trigger: section,
                start: 'top 92%',  
                once: true          
            }
        });
    });

    // ── Closing statement ──────────────────────────────────────
    const closing = document.querySelector('.cs-closing-text');
    if (closing) {
        gsap.from(closing, {
            opacity: 0,
            y: isMobile ? 0 : 16,
            duration: 0.7,
            ease: 'power2.out',
            onComplete: () => { closing.style.willChange = 'auto'; },
            scrollTrigger: {
                trigger: '.cs-closing',
                start: 'top 88%',
                once: true
            }
        });
    }
   
    // Prevent smooth-scroll CSS from interfering with ScrollTrigger's internal scroll probing on mobile.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // ── Refresh after all images load ─────────────────────────
    // Images change layout height after load. 
    window.addEventListener('load', () => {
        if (window.scrollY < 100) {
            ScrollTrigger.refresh();
        }
    });
});