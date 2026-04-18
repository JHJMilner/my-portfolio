
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 
        // Hero text elements — staggered fade up on load
        const heroElements = [
            document.querySelector('.cs-breadcrumb'),
            document.querySelector('.cs-hero .label-eyebrow'),
            document.querySelector('.cs-title'),
            document.querySelector('.cs-subtitle'),
        ].filter(Boolean);
 
        if (heroElements.length) {
            gsap.from(heroElements, {
                opacity: 0,
                y: 24,
                duration: 0.8,
                ease: 'power2.out',
                stagger: 0.12,
                delay: 0.2
            });
        }
 
        // Hero thumbnail — fades in alongside the cover image
        const heroThumb = document.querySelector('.cs-hero-thumb');
        const cover     = document.querySelector('.cs-cover');
        const fadeTargets = [heroThumb, cover].filter(Boolean);
 
        if (fadeTargets.length) {
            gsap.from(fadeTargets, {
                opacity: 0,
                y: 24,
                duration: 1,
                ease: 'power2.out',
                stagger: 0.1,
                delay: 0.5
            });
        }
 
        // Snapshot items — stagger in on scroll
        const snapshotItems = gsap.utils.toArray('.cs-snapshot-item');
        if (snapshotItems.length) {
            gsap.from(snapshotItems, {
                opacity: 0,
                y: 16,
                duration: 0.55,
                ease: 'power2.out',
                stagger: 0.07,
                scrollTrigger: {
                    trigger: '.cs-snapshot',
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
        }
 
        // Body sections — fade up on scroll
        gsap.utils.toArray('.cs-section').forEach(section => {
            gsap.from(section, {
                opacity: 0,
                y: 28,
                duration: 0.75,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
        });
 
        // Approach trio images — staggered in on scroll
        const trioFigures = gsap.utils.toArray('.cs-trio-figure');
        if (trioFigures.length) {
            gsap.from(trioFigures, {
                opacity: 0,
                y: 20,
                duration: 0.65,
                ease: 'power2.out',
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.cs-trio-images',
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
        }
 
        // Closing statement
        const closing = document.querySelector('.cs-closing-text');
        if (closing) {
            gsap.from(closing, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.cs-closing',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        }
    });