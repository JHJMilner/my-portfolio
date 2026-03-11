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

/* ─── HERO PARALLAX ──────────────────────────── */
// Uses GSAP ScrollTrigger to move each hero layer
// at a different speed as the user scrolls,
// creating a sense of depth.
//
// NOTE: This section will have full effect once
// all three illustration layers are in place.
// The background layer is active now using placeholder.png.

document.addEventListener('DOMContentLoaded', () => {

    // Check GSAP is loaded before running
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const heroBg  = document.querySelector('.hero-bg');
    const heroMid = document.querySelector('.hero-mid');
    const heroFg  = document.querySelector('.hero-fg');

    // Background layer — moves slowest
    if (heroBg) {
        gsap.to(heroBg, {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Midground layer — moves at medium speed
    if (heroMid) {
        gsap.to(heroMid, {
            yPercent: 55,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Foreground layer — moves fastest
    if (heroFg) {
        gsap.to(heroFg, {
            yPercent: 80,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }


    /* ─── SCROLL-IN ANIMATIONS ───────────────── */
    // Sections fade up into view as the user scrolls
    // down to them. Staggers nicely on card grids.

    // General section headings
    gsap.utils.toArray('section h2').forEach(heading => {
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

});


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
