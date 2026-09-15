/* ==========================================================================
   hk.js - behaviour for hkborah.com (shared by every page)
   Loaded as an ES module. No globals are leaked; everything lives in
   init functions called once at the bottom.

   Contents
   -------
   01 Motion bootstrap & toggle      05 9-Blocker matrix accordions
   02 Scroll reveals & exhibits      06 Digital Twin chat (sanitised)
   03 Mobile navigation              07 Chat transcript save
   04 SVG packets (motion paths)     08 Testimonial carousel
   ========================================================================== */

'use strict';

/* ------------------------------------------------------------------ */
/* Tiny DOM helpers                                                    */
/* ------------------------------------------------------------------ */

const $  = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * The Digital Twin backend (Cloud Run). Kept as a constant so the CSP
 * and this file never disagree about where requests may go.
 */
const TWIN_ENDPOINT = 'https://chatwithhk-6toeltovya-uc.a.run.app';

/** Cap on a single chat message - protects the twin and the payload size. */
const MAX_MESSAGE_LENGTH = 2000;

/** How many past messages travel with each request (context window). */
const MAX_HISTORY_SENT = 20;


/* ------------------------------------------------------------------ */
/* 01 Motion bootstrap & toggle                                        */
/* ------------------------------------------------------------------ */

/**
 * Decide the initial motion mode:
 *   1. a saved choice wins,
 *   2. otherwise follow the operating system's reduced-motion setting.
 * The <html data-motion="..."> attribute is the single CSS gate - every
 * animation on the site runs only under data-motion="standard".
 */
function bootMotion() {
    const root = document.documentElement;
    root.classList.add('js');

    let mode;
    try {
        mode = localStorage.getItem('hk-motion');
    } catch {
        mode = null; // private browsing etc. - fall through to OS setting
    }
    if (mode !== 'standard' && mode !== 'reduced') {
        const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)');
        mode = prefersStill.matches ? 'reduced' : 'standard';
    }
    root.dataset.motion = mode;
}

/** Header button that flips between full and reduced motion. */
function initMotionToggle() {
    const button = $('.motion-toggle');
    if (!button) return;

    const sync = () => {
        const reduced = document.documentElement.dataset.motion === 'reduced';
        button.setAttribute('aria-pressed', String(!reduced));
        button.title = reduced ? 'Reduced motion - click for full motion' : 'Full motion - click to reduce';
    };

    button.addEventListener('click', () => {
        const root = document.documentElement;
        const next = root.dataset.motion === 'reduced' ? 'standard' : 'reduced';
        root.dataset.motion = next;
        try {
            localStorage.setItem('hk-motion', next);
        } catch {
            /* storage unavailable - the choice simply won't persist */
        }
        sync();
    });
    sync();
}


/* ------------------------------------------------------------------ */
/* 02 Scroll reveals & exhibit cascades                                */
/* ------------------------------------------------------------------ */

/**
 * One IntersectionObserver drives two effects:
 *   - .reveal elements fade/rise once when they enter the viewport,
 *   - .exhibit figures flip data-visible="true", which fires the
 *     draw/fade/march/packet animation cascade defined in hk.css.
 */
function initReveals() {
    const targets = $$('.reveal, .exhibit');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.setAttribute('data-visible', 'true'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.setAttribute('data-visible', 'true');
            observer.unobserve(entry.target); // each element animates once
        }
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((el) => observer.observe(el));
}

/** "Read" buttons expand the plain-English "How to read this" panels. */
function initExhibits() {
    $$('.exhibit__read').forEach((button) => {
        const panel = document.getElementById(button.getAttribute('aria-controls') || '');
        if (!panel) return;

        button.addEventListener('click', () => {
            const opening = panel.dataset.open !== 'true';
            panel.dataset.open = String(opening);
            panel.setAttribute('aria-hidden', String(!opening));
            button.setAttribute('aria-expanded', String(opening));
        });
    });
}


/* ------------------------------------------------------------------ */
/* 03 Mobile navigation                                                */
/* ------------------------------------------------------------------ */

function initNav() {
    const toggle = $('.nav-toggle');
    const nav = $('.nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const opening = nav.dataset.open !== 'true';
        nav.dataset.open = String(opening);
        toggle.setAttribute('aria-expanded', String(opening));
    });

    // Close the panel after choosing a destination.
    nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) nav.dataset.open = 'false';
    });
}


/* ------------------------------------------------------------------ */
/* 04 SVG packets - throughput dots that ride a drawn path             */
/* ------------------------------------------------------------------ */

/**
 * CSP forbids inline style attributes, so each packet declares its route
 * as data-path="M x y L x y …" and we install it through the CSSOM here.
 */
function initPackets() {
    $$('svg .packet[data-path]').forEach((packet) => {
        packet.style.offsetPath = `path('${packet.dataset.path}')`;
    });
}


/* ------------------------------------------------------------------ */
/* 05 9-Blocker matrix - accordions on mobile, flat grid on desktop    */
/* ------------------------------------------------------------------ */

/**
 * On desktop (≥64rem) every <details class="matrix__row"> is forced open
 * and its summary is disabled, so the 3×3 grid is always visible.
 * On mobile the rows behave as normal accordions.
 */
function initMatrixAccordions() {
    const rows = $$('.matrix__row');
    if (!rows.length) return;

    const isDesktop = () => window.matchMedia('(min-width: 64rem)').matches;

    const sync = () => {
        rows.forEach((row) => {
            const summary = $('summary', row);
            if (!summary) return;
            if (isDesktop()) {
                row.open = true;
                summary.style.pointerEvents = 'none';
                summary.setAttribute('aria-hidden', 'true');
            } else {
                row.open = false;
                summary.style.pointerEvents = '';
                summary.removeAttribute('aria-hidden');
            }
        });
    };

    sync();
    window.addEventListener('resize', sync, { passive: true });
}


/* ------------------------------------------------------------------ */
/* 06 Digital Twin chat                                                */
/* ------------------------------------------------------------------ */

/**
 * Renders one message into the log.
 * Twin replies arrive as markdown → marked parses → DOMPurify sanitises.
 * User text is inserted as plain text only (never parsed as HTML), so a
 * crafted message can never inject markup into the page.
 */
function appendMessage(log, { role, content }) {
    const wrap = document.createElement('div');
    wrap.className = `chat__msg ${role === 'user' ? 'chat__msg--user' : 'chat__msg--assistant'}`;

    const avatar = document.createElement('span');
    avatar.className = `avatar ${role === 'user' ? 'avatar--you' : 'avatar--hk'}`;
    avatar.textContent = role === 'user' ? 'YOU' : 'HK';
    avatar.setAttribute('aria-hidden', 'true');

    const bubble = document.createElement('div');
    bubble.className = 'chat__bubble';

    if (role === 'assistant') {
        const raw = window.marked ? window.marked.parse(content, { breaks: true }) : content;
        bubble.innerHTML = window.DOMPurify
            ? window.DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
            : ''; // refuse to render unsanitised HTML
        bubble.classList.add('md');
    } else {
        bubble.textContent = content; // user text is never HTML
    }

    wrap.append(avatar, bubble);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
}

/** Typing indicator while the twin thinks. */
function setTyping(log, isTyping) {
    let indicator = $('#typing-indicator');
    if (isTyping) {
        if (indicator) return;
        indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'chat__msg chat__msg--assistant';

        const avatar = document.createElement('span');
        avatar.className = 'avatar avatar--hk';
        avatar.textContent = 'HK';

        const bubble = document.createElement('div');
        bubble.className = 'chat__bubble chat__typing';
        bubble.textContent = 'Analyzing your challenge';

        indicator.append(avatar, bubble);
        log.appendChild(indicator);
        log.scrollTop = log.scrollHeight;
    } else if (indicator) {
        indicator.remove();
    }
}

function initChat() {
    const form = $('#chat-form');
    if (!form) return;

    const input = $('#chat-input');
    const log = $('#chat-messages');
    const submit = $('#chat-submit');
    const chips = $('#quick-options');
    const saveButton = $('#chat-save');
    const status = $('#chat-status');

    /* CTAs that jump to the chat also put the cursor in the box, so the
       visitor can start typing without a second click. */
    $$('[data-focus-chat]').forEach((link) => {
        link.addEventListener('click', () => {
            window.setTimeout(() => input.focus({ preventScroll: true }), 400);
        });
    });

    /** Full transcript, kept for context and for the save button. */
    const history = [{
        role: 'assistant',
        content: 'Welcome. I am HK Borah\u2019s digital twin. I can help you validate ideas, ' +
                 'fix broken processes, or scale your startup using the Architectural Scaling ' +
                 'Framework. What challenge are you facing today?',
    }];

    const setStatus = (text) => { if (status) status.textContent = text; };

    /** Greeting is rendered once, statically styled like other replies. */
    if (!log.querySelector('.chat__msg')) {
        appendMessage(log, history[0]);
    }

    async function sendMessage(text) {
        history.push({ role: 'user', content: text });
        appendMessage(log, { role: 'user', content: text });

        submit.disabled = true;
        input.disabled = true;
        setTyping(log, true);

        try {
            const response = await fetch(TWIN_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: history.slice(-MAX_HISTORY_SENT, -1),
                }),
            });
            if (!response.ok) throw new Error(`twin responded ${response.status}`);

            const data = await response.json();
            const reply = typeof data.reply === 'string' ? data.reply : '';
            if (!reply) throw new Error('twin returned an empty reply');

            history.push({ role: 'assistant', content: reply });
            setTyping(log, false);
            appendMessage(log, { role: 'assistant', content: reply });
        } catch (error) {
            console.error('Chat error:', error);
            setTyping(log, false);
            appendMessage(log, {
                role: 'assistant',
                content: 'I could not reach the twin just now. Please try again in a minute \u2014 ' +
                         'or write to email@hkborah.com and HK will answer you himself.',
            });
        } finally {
            submit.disabled = false;
            input.disabled = false;
            input.focus();
        }
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = input.value.trim().slice(0, MAX_MESSAGE_LENGTH);
        if (!text) return;

        if (chips) chips.remove(); // quick prompts disappear after first use
        input.value = '';
        setStatus('');
        sendMessage(text);
    });

    // Quick-prompt chips pre-fill and send the shown question.
    $$('.chip', chips || document).forEach((chip) => {
        chip.addEventListener('click', () => {
            input.value = chip.dataset.prompt || chip.textContent.trim();
            form.requestSubmit();
        });
    });

    if (saveButton) initChatSave(saveButton, history, setStatus);
}


/* ------------------------------------------------------------------ */
/* 07 Chat transcript save                                             */
/* ------------------------------------------------------------------ */

/**
 * Save = (best effort) archive on the server + a branded PDF on the
 * visitor's device. The server endpoint may be absent on static hosting,
 * so its failure is logged quietly and the download still happens.
 * The PDF module is imported on demand to keep first paint light.
 */
function initChatSave(button, history, setStatus) {
    button.addEventListener('click', async () => {
        if (history.length <= 1) {
            setStatus('Start a conversation first, then save.');
            return;
        }

        button.disabled = true;
        setStatus('Preparing your PDF\u2026');

        try {
            await fetch('/api/chat/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history }),
            }).catch(() => {}); // archiving is optional; never block the download
        } catch {
            /* network refusal is fine - the PDF below is the guarantee */
        }

        try {
            const { generateChatPdf } = await import('./hk-pdf.js?v=26');
            await generateChatPdf(history);
            setStatus('PDF saved to your device, and a copy is kept for HK Borah.');
        } catch (error) {
            console.error('PDF generation failed:', error);
            setStatus('Could not build the PDF. Please try again.');
        } finally {
            button.disabled = false;
        }
    });
}


/* ------------------------------------------------------------------ */
/* 08 Testimonial carousel                                             */
/* ------------------------------------------------------------------ */

function initTestimonials() {
    const slides = $$('.tst__slide');
    if (slides.length < 2) {
        if (slides.length === 1) slides[0].dataset.active = 'true';
        return;
    }

    const dots = $$('.tst__dot');
    const prev = $('.tst__arrow--prev');
    const next = $('.tst__arrow--next');
    const stage = $('.tst'); // hover/focus here pauses auto-advance
    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            const active = i === current;
            slide.dataset.active = String(active);
            slide.setAttribute('aria-hidden', String(!active));
        });
        dots.forEach((dot, i) => dot.dataset.active = String(i === current));
    };

    const play = () => {
        stop();
        // Auto-advance only when the visitor has full motion switched on.
        if (document.documentElement.dataset.motion === 'standard') {
            timer = setInterval(() => show(current + 1), 8000);
        }
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

    if (prev) prev.addEventListener('click', () => { show(current - 1); play(); });
    if (next) next.addEventListener('click', () => { show(current + 1); play(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); play(); }));

    if (stage) {
        stage.addEventListener('mouseenter', stop);
        stage.addEventListener('mouseleave', play);
        stage.addEventListener('focusin', stop);
        stage.addEventListener('focusout', play);
    }

    show(0);
    play();
}


/* ------------------------------------------------------------------ */
/* 09 Diagnose tabs (execution page)                                   */
/* ------------------------------------------------------------------ */

/**
 * Accessible tab set: click or arrow-key to switch. Panels are hidden with
 * the `hidden` attribute so the page still reads sensibly without JS.
 */
function initTabs() {
    const root = $('.tabs');
    if (!root) return;

    const tabs = $$('.tab', root);
    const panels = $$('.tab-panel', root);
    if (!tabs.length) return;

    const select = (index) => {
        tabs.forEach((tab, i) => {
            const active = i === index;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            if (panels[i]) panels[i].hidden = !active;
        });
    };

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(i));
        tab.addEventListener('keydown', (event) => {
            const step = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }[event.key];
            if (step === undefined) return;
            event.preventDefault();
            const next = step === Infinity ? tabs.length - 1
                : step === -Infinity ? 0
                : (i + step + tabs.length) % tabs.length;
            select(next);
            tabs[next].focus();
        });
    });

    select(0);
}


/* ------------------------------------------------------------------ */
/* 10 Self-check tally (execution page)                                */
/* ------------------------------------------------------------------ */

/**
 * Counts ticked warning signs and surfaces the call to action once three
 * or more apply. The checkboxes work without JS; only the tally needs it.
 */
function initSelfCheck() {
    const root = $('#signs');
    if (!root) return;

    const boxes = $$('input[data-sign]', root);
    const tally = $('#check-tally');
    const message = $('#check-message');
    const actions = $('#check-actions');

    const update = () => {
        const count = boxes.filter((box) => box.checked).length;
        if (tally) tally.textContent = String(count);

        // Three or more is the threshold described in the copy
        const enough = count >= 3;
        if (actions) actions.hidden = !enough;
        if (message) {
            message.textContent = enough
                ? 'That is three or more. It is time for a conversation, not another quarter of waiting.'
                : 'If three or more sound familiar, it is time for a conversation.';
        }
    };

    boxes.forEach((box) => box.addEventListener('change', update));
    update();
}


/* ------------------------------------------------------------------ */
/* 11 Mind pulse (execution Exhibit 05)                                */
/* ------------------------------------------------------------------ */

/**
 * On each beat, a lighter hexagon swells outward from the centre and a
 * random number of dots (1 to 6) travel along the spokes, some outward and
 * some inward, so the diagram reads as a mind under load.
 *
 * It runs only while full motion is on and the exhibit is on screen, so it
 * costs nothing for reduced-motion visitors or when scrolled away.
 */
function initMindPulse() {
    const svg = $('#mind-svg');
    const layer = $('#mind-traffic');
    const ring = $('#mind-ring');
    if (!svg || !layer) return;

    const NS = 'http://www.w3.org/2000/svg';
    const CENTRE = { x: 480, y: 200 };

    // The six vertices of the regular hexagon, matching the markup
    const VERTICES = [
        { x: 620, y: 200 }, { x: 550, y: 321.2 }, { x: 410, y: 321.2 },
        { x: 340, y: 200 }, { x: 410, y: 78.8 }, { x: 550, y: 78.8 },
    ];

    const BEAT_MS = 2600;
    let timer = null;
    let visible = false;

    /** One beat: swell the ring, then send out between one and six dots. */
    const beat = () => {
        if (ring) {
            ring.classList.remove('is-firing');
            void ring.getBoundingClientRect(); // restart the one-shot animation
            ring.classList.add('is-firing');
        }

        const count = 1 + Math.floor(Math.random() * 6); // 1..6, as asked

        for (let i = 0; i < count; i += 1) {
            const vertex = VERTICES[Math.floor(Math.random() * VERTICES.length)];
            const outward = Math.random() < 0.6; // more leave than return

            const dot = document.createElementNS(NS, 'circle');
            dot.setAttribute('r', '3');
            dot.setAttribute('fill', 'var(--accent)');
            dot.setAttribute('class', 'mind-dot');

            // Route the dot from the centre out, or from a vertex back in
            const from = outward ? CENTRE : vertex;
            const to = outward ? vertex : CENTRE;
            dot.style.offsetPath = `path('M${from.x},${from.y} L${to.x},${to.y}')`;
            dot.style.setProperty('--travel', `${(1.9 + Math.random() * 1.1).toFixed(2)}s`);
            dot.style.animationDelay = `${(Math.random() * 0.45).toFixed(2)}s`;

            layer.appendChild(dot);
            dot.addEventListener('animationend', () => dot.remove());
        }
    };

    const motionOn = () => document.documentElement.dataset.motion === 'standard';
    const sync = () => {
        const shouldRun = motionOn() && visible;
        if (shouldRun && !timer) {
            beat();
            timer = window.setInterval(beat, BEAT_MS);
        } else if (!shouldRun && timer) {
            window.clearInterval(timer);
            timer = null;
            layer.replaceChildren(); // clear dots when pausing
            if (ring) ring.classList.remove('is-firing');
        }
    };

    // Pause when the exhibit scrolls out of view
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            sync();
        }, { threshold: 0.1 }).observe(svg);
    } else {
        visible = true;
        sync();
    }

    // Follow the site-wide motion switch
    new MutationObserver(sync).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-motion'],
    });
}


/* ------------------------------------------------------------------ */
/* 12 Contact form (about page)                                        */
/* ------------------------------------------------------------------ */

/**
 * Submits the enquiry by fetch so the visitor stays on the page.
 * Without JavaScript the form still posts to the same endpoint, which is
 * why the markup carries an action and method.
 */
function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const status = $('#contact-status');
    const button = $('#contact-submit');

    const say = (message, state) => {
        if (!status) return;
        status.textContent = message;
        status.classList.toggle('is-error', state === 'error');
        status.classList.toggle('is-ok', state === 'ok');
    };

    // A visitor without JavaScript posts the form normally and comes back
    // here with ?sent=1 or ?sent=0, so tell them what happened.
    const outcome = new URLSearchParams(location.search).get('sent');
    if (outcome === '1') {
        say('Thank you. Your message is with me, and I will reply personally.', 'ok');
    } else if (outcome === '0') {
        say('That did not send. Please try again, or write to email@hkborah.com.', 'error');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = Object.fromEntries(new FormData(form).entries());

        if (!String(data.name || '').trim() || !String(data.email || '').trim()) {
            say('Please add your name and email so I can reply.', 'error');
            return;
        }
        if (!String(data.message || '').trim()) {
            say('Please write a message.', 'error');
            return;
        }

        button.disabled = true;
        say('Sending\u2026');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const detail = await response.json().catch(() => ({}));
                throw new Error(detail.error || 'The message could not be sent.');
            }

            form.reset();
            say('Thank you. Your message is with me, and I will reply personally.', 'ok');
        } catch (error) {
            console.error('Contact form failed:', error);
            say(`${error.message} You can also write to email@hkborah.com.`, 'error');
        } finally {
            button.disabled = false;
        }
    });
}


/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

bootMotion();
document.addEventListener('DOMContentLoaded', () => {
    initMotionToggle();
    initReveals();
    initExhibits();
    initNav();
    initPackets();
    initMatrixAccordions();
    initChat();
    initTestimonials();
    initTabs();
    initSelfCheck();
    initMindPulse();
    initContactForm();
});
