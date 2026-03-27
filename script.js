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


/* ─── CANVAS ANIMATIONS ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

     // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

        /* ─── AURA CANVAS ANIMATION ─────────────────── */
        const canvas  = document.getElementById('aura-canvas');

        if (canvas) {
            const ctx = canvas.getContext('2d');
            const W   = 32;
            const H   = 32;

            // Palette derived from site colour variables
            // Each entry is [R, G, B]
            const palette = [
                [253, 249, 244],  // --color-bg
                [208, 155, 114],  // --color-brown-lt
                [253, 249, 244],  // --color-bg
                [221, 239, 247],  // --color-bg-blue
                [140, 202, 227],  // --color-blue
                [253, 249, 244],  // --color-bg
            ];

            // Blend between two palette colours by a 0–1 factor
            function lerpColor(a, b, t) {
                return [
                    Math.round(a[0] + (b[0] - a[0]) * t),
                    Math.round(a[1] + (b[1] - a[1]) * t),
                    Math.round(a[2] + (b[2] - a[2]) * t),
                ];
            }

            // Map a -1..1 sine value to a palette blend
            function plasmaColor(v, t) {
                // Shift v into 0..1
                const n = (v + 1) * 0.5;
                // Slowly rotate which palette pair we blend between
                const shift  = (Math.sin(t * 0.07) + 1) * 0.5;
                const idxA   = Math.floor((n + shift) * (palette.length - 1)) % palette.length;
                const idxB   = (idxA + 1) % palette.length;
                const blend  = ((n + shift) * (palette.length - 1)) % 1;
                return lerpColor(palette[idxA], palette[idxB], blend);
            }

            let animTime   = 0;
            let rafId      = null;
            const imgData  = ctx.createImageData(W, H);
            const pixels   = imgData.data;

            function drawFrame() {
                animTime += 0.003;
                const t = animTime;

                for (let y = 0; y < H; y++) {
                    for (let x = 0; x < W; x++) {

                        // Plasma formula — layered sine waves across x, y, and time
                        const cx  = x + 0.5 * Math.sin(t * 0.3);
                        const cy  = y + 0.5 * Math.cos(t * 0.2);
                        const v1  = Math.sin(cx * 0.3 + t);
                        const v2  = Math.sin(0.3 * (cx * Math.sin(t * 0.5) + cy * Math.cos(t * 0.33)) + t);
                        const r   = Math.sqrt((cx - W * 0.5) ** 2 + (cy - H * 0.5) ** 2);
                        const v3  = Math.sin(Math.sqrt(r + 1) + t);
                        const val = (v1 + v2 + v3) / 3;

                        const [R, G, B] = plasmaColor(val, t);
                        const i = (y * W + x) * 4;
                        pixels[i]     = R;
                        pixels[i + 1] = G;
                        pixels[i + 2] = B;
                        pixels[i + 3] = 255;
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                rafId = requestAnimationFrame(drawFrame);
            }



            if (prefersReduced.matches) {
                // Draw a single static frame and stop
                drawFrame();
                cancelAnimationFrame(rafId);
            } else {
                drawFrame();
            }

            // Pause animation when tab is not visible (saves CPU)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(rafId);
                } else {
                    drawFrame();
                }
            });
        }

        /* ─── CONTACT RIPPLE ANIMATION ───────────────── */
        const contactCanvas = document.getElementById('contact-canvas');

        if (contactCanvas) {
            const cCtx      = contactCanvas.getContext('2d');
            const cW        = 32;
            const cH        = 32;
            const cImgData  = cCtx.createImageData(cW, cH);
            const cPixels   = cImgData.data;

            // Just two colours — base background and a warm cream
            // blending gently into one another
            const colorA = [253, 249, 244];  // --color-bg        #FDF9F4
            const colorB = [228, 179, 120];  // --color-bg-tan     #E4B378

            let cTime = 0;
            let cRafId = null;

            function drawContactFrame() {
                cTime += 0.008; // Much slower than the hero
                const t = cTime;

                for (let y = 0; y < cH; y++) {
                    for (let x = 0; x < cW; x++) {

                        // Simple, smooth ripple — just two layered sine waves
                        const v1 = Math.sin(x * 0.4 + t);
                        const v2 = Math.sin(y * 0.3 + t * 0.7);
                        const v3 = Math.sin((x + y) * 0.2 + t * 0.5);
                        const val = (v1 + v2 + v3) / 3; // -1 to 1
                        const blend = (val + 1) * 0.5;  // 0 to 1

                        const R = Math.round(colorA[0] + (colorB[0] - colorA[0]) * blend);
                        const G = Math.round(colorA[1] + (colorB[1] - colorA[1]) * blend);
                        const B = Math.round(colorA[2] + (colorB[2] - colorA[2]) * blend);

                        const i = (y * cW + x) * 4;
                        cPixels[i]     = R;
                        cPixels[i + 1] = G;
                        cPixels[i + 2] = B;
                        cPixels[i + 3] = 255;
                    }
                }

                cCtx.putImageData(cImgData, 0, 0);
                cRafId = requestAnimationFrame(drawContactFrame);
            }

            // Respect prefers-reduced-motion
            if (prefersReduced.matches) {
                drawContactFrame();
                cancelAnimationFrame(cRafId);
            } else {
                drawContactFrame();
            }

            // Pause when tab is hidden
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(cRafId);
                } else {
                    drawContactFrame();
                }
            });
        }

        /* ─── SCROLL-IN ANIMATIONS ───────────────── */
        // Sections fade up into view as the user scrolls
        // down to them. Staggers nicely on card grids.

        // General section headings (excluding pitch which has its own animation)
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

/* ─── CONTENT SECTION ANIMATIONS ───────────────── */
    // Elevator pitch section
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

    // Introduction text and image
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
            y: 40,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.card-grid',
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

    // Contact section fade in
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




/* ─── REDUCED MOTION: DISABLE ANIMATIONS ─────── */
// Respects the user's system-level preference to
// reduce motion by killing all ScrollTrigger animations

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        }
    });
}
