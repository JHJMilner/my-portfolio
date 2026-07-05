/* =============================================
   JULIA MILNER — PLAY PAGE JAVASCRIPT
   Playful behaviour for the Play page only.
   Vanilla JS, no framework. Every motion effect is gated behind
   prefers-reduced-motion. Shared nav / smooth-scroll / contact
   ripple come from script.js — this file only adds the fun.
   ============================================= */

(function () {
    'use strict';

    /* Honour the user's motion preference. We read it live so that
       toggling the OS setting takes effect on the next interaction. */
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var prefersReduced = function () { return motionQuery.matches; };

    /* Only enable pointer-driven effects on real mouse/trackpad devices —
       not touchscreens, where hover/tilt feels broken. */
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;


    /* ─── 1. SCROLL REVEAL FOR CARDS ──────────────
       Cards fade/rise in as they enter the viewport. With reduced motion
       (or no IntersectionObserver support) they're simply shown at once. */
    (function scrollReveal() {
        var cards = document.querySelectorAll('.play-card');
        if (!cards.length) return;

        if (prefersReduced() || !('IntersectionObserver' in window)) {
            cards.forEach(function (card) { card.classList.add('is-visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);   // reveal once, then stop watching
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        cards.forEach(function (card) { observer.observe(card); });
    })();


    /* ─── 2. DOODLE DRIFT (parallax) ──────────────
       The whole doodle layer shifts slightly with the cursor for depth,
       while each doodle keeps its own CSS "bob" animation. Translating the
       PARENT avoids fighting the keyframe transform on the children.
       Skipped under reduced motion or on touch devices. */
    (function doodleDrift() {
        if (prefersReduced() || !finePointer) return;

        var layer = document.querySelector('.play-doodles');
        if (!layer) return;

        var ticking = false;
        window.addEventListener('mousemove', function (e) {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                // -1..1 offset from the centre of the screen, scaled small
                var dx = (e.clientX / window.innerWidth  - 0.5) * 2 * 14;
                var dy = (e.clientY / window.innerHeight - 0.5) * 2 * 14;
                layer.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
                ticking = false;
            });
        }, { passive: true });
    })();


    /* ─── 3. CARD TILT ────────────────────────────
       A subtle 3D tilt that follows the cursor across each card.
       Desktop + motion-OK only. Resets cleanly on mouse-leave. */
    (function cardTilt() {
        if (prefersReduced() || !finePointer) return;

        var cards = document.querySelectorAll('.play-card:not(.play-card--coming-soon)');
        var MAX = 6;   // max tilt in degrees — kept small so it stays tasteful

        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width;    // 0..1
                var py = (e.clientY - r.top)  / r.height;   // 0..1
                var rotY = (px - 0.5) * 2 * MAX;
                var rotX = (0.5 - py) * 2 * MAX;
                card.style.transform =
                    'perspective(700px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' +
                    rotY.toFixed(2) + 'deg) translateY(-8px) scale(1.02)';
            });

            // Hand control back to the CSS hover/resting state
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    })();


    /* ─── 4. HERO EASTER EGG ──────────────────────
       Clicking the star badge spins it and sends the doodles into a
       happy celebration. With motion OK it also drops a little confetti.
       Reduced motion → the doodles just flash their colours, no movement. */
    (function easterEgg() {
        var trigger = document.querySelector('.play-egg-trigger');
        var star    = document.querySelector('.play-egg-star');
        var doodles = document.querySelector('.play-doodles');
        if (!trigger) return;

        trigger.addEventListener('click', function () {
            // Spin the star (CSS handles the keyframe; we just toggle the class)
            if (star && !prefersReduced()) {
                star.classList.remove('is-spinning');
                void star.offsetWidth;            // force reflow to restart the anim
                star.classList.add('is-spinning');
            }

            // Celebrate the doodles
            if (doodles) {
                doodles.classList.add('is-celebrating');
                window.setTimeout(function () {
                    doodles.classList.remove('is-celebrating');
                }, 900);
            }

            if (!prefersReduced()) dropConfetti(trigger);
        });

        /* Tiny self-contained confetti burst — a handful of coloured
           squares that fall and fade, then remove themselves. No library. */
        function dropConfetti(origin) {
            var colours = ['#E8645A', '#F2B33C', '#2FA39B', '#79774D', '#4B6573'];
            var rect = origin.getBoundingClientRect();
            var startX = rect.left + rect.width  / 2;
            var startY = rect.top  + rect.height / 2;

            for (var i = 0; i < 14; i++) {
                makeBit(i, startX, startY, colours);
            }
        }

        function makeBit(i, startX, startY, colours) {
            var bit = document.createElement('span');
            bit.className = 'play-confetti-bit';
            bit.style.cssText =
                'position:fixed;z-index:9999;width:9px;height:9px;border-radius:2px;' +
                'pointer-events:none;left:' + startX + 'px;top:' + startY + 'px;' +
                'background:' + colours[i % colours.length] + ';';
            document.body.appendChild(bit);

            // Random trajectory, biased downward (gravity)
            var angle = Math.random() * Math.PI * 2;
            var dist  = 60 + Math.random() * 90;
            var tx = Math.cos(angle) * dist;
            var ty = Math.sin(angle) * dist + 120;
            var rot = (Math.random() * 720 - 360);

            var anim = bit.animate(
                [
                    { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
                    { transform: 'translate(' + tx + 'px,' + ty + 'px) rotate(' + rot + 'deg)', opacity: 0 }
                ],
                { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
            );
            anim.onfinish = function () { bit.remove(); };
        }
    })();

})();
