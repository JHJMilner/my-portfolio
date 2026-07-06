/* =============================================
   JULIA MILNER — PORTFOLIO JAVASCRIPT
   ============================================= */


/* ─── NAV: ADD SCROLLED CLASS ────────────────── */
// Adds a 'scrolled' class to the nav once the user
// scrolls past the hero, triggering the solid background

const nav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}, { passive: true });


/* ─── SMOOTH SCROLL FOR NAV LINKS ────────────── */
// Handles smooth scrolling while accounting for the
// fixed nav bar height so sections aren't obscured

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();

        const navHeight = nav.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
    });
});


/* ─── HAMBURGER MENU ─────────────────────────── */
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.nav-mobile-menu');
const mobileLinks = document.querySelectorAll('.nav-mobile-links a');

if (hamburger && mobileMenu) {

    // Toggle menu open/closed
    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('is-open');
        mobileMenu.classList.toggle('is-open');
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileMenu.setAttribute('aria-hidden', !isOpen);
    });

    // Close menu when a link is tapped
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('is-open');
            mobileMenu.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', false);
            mobileMenu.setAttribute('aria-hidden', true);
        });
    });

    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
            hamburger.classList.remove('is-open');
            mobileMenu.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', false);
            mobileMenu.setAttribute('aria-hidden', true);
        }
    });
}


/* ─── ALL GSAP / SCROLLTRIGGER ANIMATIONS ────── */
// Everything that relies on GSAP lives inside this
// single DOMContentLoaded block so that:
//   1. The DOM is fully built before we query elements
//   2. gsap.registerPlugin() runs before any ScrollTrigger
//      animation is created
// The script tag uses `defer`, which also guarantees
// DOM readiness, but wrapping in DOMContentLoaded makes
// the intent explicit and protects against future changes.

document.addEventListener('DOMContentLoaded', () => {

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded — animations skipped.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Respect prefers-reduced-motion ──────────
    // If the user has asked for reduced motion, we skip
    // all GSAP animations immediately after registering.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        // Canvas animations are handled separately below;
        // they each check prefersReduced before looping.
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');


    /* ─── AMBIENT AURA CANVASES ──────────────────────
    One reusable "plasma field" powers both the hero and the contact
    section. 
    ------------------------------------------------------------------ */

    // Reduced-motion users get a single static frame, never a loop.
    // (Reuses `prefersReduced`, already declared above.)
    const prefersReducedMotion = prefersReduced.matches;

    // Parse a CSS hex string ("#RRGGBB" or "#RGB") into [r, g, b].
    // NB: the tokens passed to createAuraField must resolve to hex values.
    function hexToRgb(hex) {
        hex = hex.trim().replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const int = parseInt(hex, 16);
        return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
    }

    // Read an array of custom-property names into an array of [r, g, b].
    function readPalette(tokenNames) {
        const styles = getComputedStyle(document.documentElement);
        return tokenNames.map(name => hexToRgb(styles.getPropertyValue(name)));
    }

    // Linear blend between two [r,g,b] colours by factor t (0–1).
    function lerpRgb(a, b, t) {
        return [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t,
        ];
    }

    /**
     * Soft animated plasma field on a small canvas that the browser
     * upscales into gentle, blurred "aura" blobs.
     *
     * @param {HTMLCanvasElement} canvas
     * @param {string[]} opts.tokens  custom-property names to blend between
     * @param {number}   opts.res     buffer resolution (higher = finer texture)
     * @param {number}   opts.speed   animation speed multiplier
     */
    function createAuraField(canvas, { tokens, res = 40, speed = 1 }) {
        const ctx = canvas.getContext('2d');
        canvas.width  = res;   // buffer size; CSS still scales it to 100%
        canvas.height = res;

        const imgData = ctx.createImageData(res, res);
        const pixels  = imgData.data;

        // `current` is what we draw; `target` is where we're easing toward.
        // A theme change only swaps `target`, so the palette cross-fades.
        let current = readPalette(tokens);
        let target  = current.map(c => c.slice());

        let time    = 0;
        let rafId   = null;
        let running = false;

        // Blend across the palette for a field value v (-1..1), offset by shift.
        function sample(v, shift, pal) {
            const pos = (((v + 1) * 0.5) + shift) % 1;   // wrapped 0..1
            const f   = pos * (pal.length - 1);
            const i   = Math.floor(f);
            const j   = (i + 1) % pal.length;
            return lerpRgb(pal[i], pal[j], f - i);
        }

        function renderOnce() {
            time += 0.004 * speed;
            const t = time;

            // Ease the live palette toward the target (smooth theme cross-fade).
            for (let k = 0; k < current.length; k++) {
                current[k] = lerpRgb(current[k], target[k], 0.06);
            }

            const shift = (Math.sin(t * 0.07) + 1) * 0.5;

            for (let y = 0; y < res; y++) {
                for (let x = 0; x < res; x++) {
                    const cx  = x + 0.5 * Math.sin(t * 0.3);
                    const cy  = y + 0.5 * Math.cos(t * 0.2);
                    const v1  = Math.sin(cx * 0.3 + t);
                    const v2  = Math.sin(0.3 * (cx * Math.sin(t * 0.5) + cy * Math.cos(t * 0.33)) + t);
                    const r   = Math.sqrt((cx - res * 0.5) ** 2 + (cy - res * 0.5) ** 2);
                    const v3  = Math.sin(Math.sqrt(r + 1) + t);
                    const val = (v1 + v2 + v3) / 3;

                    const [R, G, B] = sample(val, shift, current);
                    const idx = (y * res + x) * 4;
                    pixels[idx]     = R;
                    pixels[idx + 1] = G;
                    pixels[idx + 2] = B;
                    pixels[idx + 3] = 255;
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }

        function loop() {
            renderOnce();
            if (running) rafId = requestAnimationFrame(loop);
        }

        function start() {
            if (running) return;              // guard: never stack loops
            running = true;
            rafId = requestAnimationFrame(loop);
        }

        function stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        }

        // Recolour when the theme attribute flips.
        function refreshPalette() {
            target = readPalette(tokens);
            if (prefersReducedMotion) {       // no loop running — snap + redraw once
                current = target.map(c => c.slice());
                renderOnce();
            }
        }
        new MutationObserver(refreshPalette).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        if (prefersReducedMotion) {
            renderOnce();                     // single static frame, never animates
        } else {
            start();
            document.addEventListener('visibilitychange', () => {
                document.hidden ? stop() : start();   // pause off-screen, resume on return
            });
        }
    }

    /* ── Hero aura ──
    Neutrals dominate so the "Find clarity." headline keeps its contrast;
    --color-accent adds a warm toffee bloom. Every token here flips cleanly
    in dark mode, giving a moody warm glow on near-black. Want more colour?
    Add --color-green-lt / --color-berry — but note those two are
    "self-contained" fills that stay light in dark mode by design, so
    they'll read as bright wisps rather than dark tones. */
    const heroCanvas = document.getElementById('aura-canvas');
    if (heroCanvas) {
        createAuraField(heroCanvas, {
            tokens: ['--color-bg', '--color-bg-alt', '--color-bg-tan', '--color-accent', '--color-bg-alt'],
            res: 48,
            speed: 1.35,
        });
    }

    /* ── Contact ripple ── same field, calmer and warmer. */
    const contactCanvas = document.getElementById('contact-canvas');
    if (contactCanvas) {
        createAuraField(contactCanvas, {
            tokens: ['--color-bg', '--color-bg-tan'],
            res: 32,
            speed: 1,
        });
    }


    /* ─── SCROLL-IN ANIMATIONS ───────────────────── */
    // All ScrollTrigger animations are registered below.
    // They are safe here because:
    //   - gsap.registerPlugin() was called above
    //   - We are inside DOMContentLoaded so elements exist

    // Section headings — fade up on scroll
    // (The :not() selector excludes the pitch heading,
    //  which has its own staggered animation below.)
    gsap.utils.toArray('section h2:not(.pitch-inner h2)').forEach(heading => {
        gsap.from(heading, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: heading,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Elevator pitch section — heading then body paragraphs
    const pitchHeading = document.querySelector('.pitch-inner h2');
    const pitchBody    = document.querySelectorAll('.pitch-inner p');

    if (pitchHeading) {
        gsap.from(pitchHeading, {
            opacity: 0,
            y: 30,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: pitchHeading,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    }

    if (pitchBody.length) {
        gsap.from(pitchBody, {
            opacity: 0,
            y: 20,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.pitch-inner',
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    }

    // Introduction — text slides in from left, image from right
    const introText  = document.querySelector('.intro-text');
    const introImage = document.querySelector('.intro-image');

    if (introText) {
        gsap.from(introText, {
            opacity: 0,
            x: -30,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: introText,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    }

    if (introImage) {
        gsap.from(introImage, {
            opacity: 0,
            x: 30,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: introImage,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    }

    // Project cards — staggered fade up
    const projectCards = gsap.utils.toArray('.project-card');
    if (projectCards.length) {
        gsap.from(projectCards, {
            opacity: 0,
            y: 20,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.06,
            scrollTrigger: {
                trigger: '.projects-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    }

    // Service cards — staggered fade up
    const serviceCards = gsap.utils.toArray('.service-card');
    if (serviceCards.length) {
        gsap.from(serviceCards, {
            opacity: 0,
            y: 40,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    }

    // Contact section — fade up
    const contactInner = document.querySelector('.contact-inner');
    if (contactInner) {
        gsap.from(contactInner, {
            opacity: 0,
            y: 30,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: contactInner,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    }

}); // ← end of DOMContentLoaded