/* ==========================================================================
   hk-blog.js — blog reader for hkborah.com
   Talks to the same API contract as HkBorahRedesign (/api/blog/...), so it
   works against whichever backend is deployed (Express or Pages Functions).

   Two page modes, detected from the DOM:
     - listing: an element with id="blog-grid"
     - single post: an element with id="blog-post"

   Post content is authored HTML, so it is ALWAYS sanitised with DOMPurify
   before it touches the page. The original app injected it raw.
   ========================================================================== */

'use strict';

const API = '/api/blog';
const POSTS_PER_PAGE = 6;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Escapes text for safe insertion into HTML. */
function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[ch]);
}

/**
 * Resolves a stored image value to something an <img> can load.
 * Mirrors the original app's rules: data URIs and absolute URLs pass
 * through, anything else is treated as a site-relative path.
 */
function resolveImage(image) {
    if (!image) return null;
    if (image.startsWith('data:') || /^https?:\/\//.test(image)) return image;
    return image.startsWith('/') ? image : `/${image}`;
}

/**
 * The picture for a card or a page.
 *
 * The list sends a URL, but a single entry still sends what is stored, which
 * may be a base64 data URI. `imageUrl` is the API's own fetchable URL for the
 * same picture, so it is preferred whenever it is there: it caches, and it
 * keeps a wall of pictures out of the page source.
 */
function postImage(post) {
    return resolveImage(post.imageUrl || post.image);
}

/** Formats the stored date string; falls back to the raw value. */
function formatDate(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Fetches JSON, throwing a readable error on failure. */
async function getJson(path) {
    const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`${path} responded ${response.status}`);
    return response.json();
}

/** Sorts newest first, tolerating both the text date and createdAt. */
function sortNewestFirst(posts) {
    return [...posts].sort((a, b) => {
        const aKey = Number(a.createdAt) || Date.parse(a.date) || 0;
        const bKey = Number(b.createdAt) || Date.parse(b.date) || 0;
        return bKey - aKey;
    });
}

/** One listing card. */
/**
 * Remembers, in this browser only, which posts have been liked. It keeps an
 * accidental double tap from counting twice; the count itself always comes
 * from the server.
 */
const LIKED_KEY = 'hk-liked';

function likedPosts() {
    try {
        return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]'));
    } catch {
        return new Set();
    }
}

function rememberLike(id) {
    try {
        const all = likedPosts();
        all.add(id);
        localStorage.setItem(LIKED_KEY, JSON.stringify([...all]));
    } catch {
        /* storage unavailable: the count still works, it just may add twice */
    }
}

/**
 * Sharing, the same at the top and the bottom of an entry.
 *
 * Plain links, no embedded SDKs, so nothing from another company loads on the
 * site unless a reader actually presses one. The addresses are prefilled for
 * WhatsApp, which is how most Indian readers pass an article on, and LinkedIn.
 * Copy link and the device's own share sheet cover the rest.
 */
function shareHtml(post) {
    const url = `${location.origin}/blog-post?slug=${encodeURIComponent(post.slug || post.id)}`;
    const message = encodeURIComponent(`${post.title} ${url}`);
    const encoded = encodeURIComponent(url);
    return `
        <div class="share" data-share-url="${esc(url)}" data-share-title="${esc(post.title)}">
            <span class="mono-label">Share</span>
            <a class="share__btn" href="https://wa.me/?text=${message}"
               target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.4-.2-3 .8.8-2.9-.2-.4A8 8 0 0 1 12 4zm-2.6 4c-.2 0-.5.1-.7.4-.2.3-.7.8-.7 1.7 0 1 .7 1.9.8 2 .1.2 1.4 2.3 3.5 3.1 1.7.7 2.1.6 2.5.5.4 0 1.2-.5 1.4-1 .2-.5.2-.9.1-1l-.5-.3-1.2-.6c-.2-.1-.4-.1-.5.1l-.5.7c-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1a6 6 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4l-.6-1.3c-.1-.3-.3-.3-.4-.3h-.4z"></path></svg>
                WhatsApp
            </a>
            <a class="share__btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encoded}"
               target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"></path></svg>
                LinkedIn
            </a>
            <button class="share__btn" type="button" data-copy-link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"></path><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"></path></svg>
                Copy link
            </button>
            <button class="share__btn" type="button" data-native-share hidden>Share</button>
        </div>`;
}

/** The like and the share controls together, used at top and bottom. */
function engagementHtml(post) {
    return `<div class="post-actions">${likeHtml(post)}${shareHtml(post)}</div>`;
}

/** The like control. The number shown is the one the server stored. */
function likeHtml(post) {
    const id = post.id;
    const count = Number(post.likes ?? 0);
    const already = likedPosts().has(id);
    return `
        <button class="like${already ? ' like--done' : ''}" type="button"
                data-like="${id}" ${already ? 'disabled' : ''}
                aria-label="Like this entry. ${count} so far.">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21s-7.5-4.6-9.5-9A5.4 5.4 0 0 1 12 6.6a5.4 5.4 0 0 1 9.5 5.4c-2 4.4-9.5 9-9.5 9z"></path>
            </svg>
            <span data-count>${count}</span>
        </button>`;
}

/**
 * Sends the like and shows what the server returns, rather than guessing the
 * next number locally: the starting value is the server's business, not ours.
 */
async function sendLike(button) {
    const id = button.dataset.like;
    button.disabled = true;
    try {
        const response = await fetch(`${API}/posts/${encodeURIComponent(id)}/like`, { method: 'POST' });
        if (!response.ok) throw new Error(String(response.status));
        const data = await response.json();

        // The controls appear twice on an entry, so keep both in step
        document.querySelectorAll(`[data-like="${CSS.escape(id)}"]`).forEach((other) => {
            const count = other.querySelector('[data-count]');
            if (count) count.textContent = data.likes;
            other.classList.add('like--done');
            other.disabled = true;
        });
        rememberLike(id);
    } catch (error) {
        console.error('Like failed:', error);
        button.disabled = false;   // let them try again
    }
}

function cardHtml(post) {
    const image = postImage(post);
    const href = `/blog-post?slug=${encodeURIComponent(post.slug || post.id)}`;
    // The date and the like sit outside the link: a button inside an anchor is
    // invalid, and would make the whole card try to navigate when liked.
    return `
        <article class="post-card reveal" data-visible="true">
            <a class="post-card__link" href="${esc(href)}">
                ${image ? `<span class="post-card__media"><img src="${esc(image)}" alt="" loading="lazy"></span>` : ''}
                <span class="post-card__body">
                    ${post.category ? `<span class="mono-label post-card__cat">${esc(post.category)}</span>` : ''}
                    <h2 class="post-card__title">${esc(post.title)}</h2>
                    ${post.excerpt ? `<p class="post-card__excerpt">${esc(post.excerpt)}</p>` : ''}
                </span>
            </a>
            <div class="post-card__foot">
                <span class="mono-label post-card__date">${esc(formatDate(post.date))}</span>
                ${likeHtml(post)}
            </div>
        </article>`;
}

/* ------------------------------------------------------------------ */
/* Listing page                                                        */
/* ------------------------------------------------------------------ */

async function renderIndex() {
    const grid = $('#blog-grid');
    const status = $('#blog-status');
    const pager = $('#blog-pager');
    const filterBar = $('#blog-filters');

    let posts = [];
    let category = 'All';
    let page = 1;

    try {
        posts = sortNewestFirst(await getJson('/posts'));
    } catch (error) {
        console.error('Blog feed unavailable:', error);
        if (status) {
            status.textContent = 'The journal is not reachable right now. Please try again shortly.';
        }
        return;
    }

    if (!posts.length) {
        if (status) status.textContent = 'No entries yet. The first one is being written.';
        return;
    }
    if (status) status.textContent = '';

    // Category chips, built from whatever the posts actually use
    const categories = ['All', ...new Set(posts.map((p) => p.category).filter(Boolean))];
    if (filterBar && categories.length > 2) {
        filterBar.innerHTML = categories.map((name, i) => `
            <button class="chip" type="button" data-category="${esc(name)}" aria-pressed="${i === 0}">${esc(name)}</button>
        `).join('');
        filterBar.hidden = false;
        filterBar.addEventListener('click', (event) => {
            const button = event.target.closest('[data-category]');
            if (!button) return;
            category = button.dataset.category;
            page = 1;
            $$('[data-category]', filterBar).forEach((b) => {
                b.setAttribute('aria-pressed', String(b === button));
            });
            draw();
        });
    }

    function draw() {
        const filtered = category === 'All' ? posts : posts.filter((p) => p.category === category);
        const pageCount = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
        page = Math.min(page, pageCount);
        const slice = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

        grid.innerHTML = slice.map(cardHtml).join('');

        if (pager) {
            pager.hidden = pageCount <= 1;
            pager.innerHTML = `
                <button class="pager__btn" type="button" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>Previous</button>
                <span class="mono-label pager__count">Page ${page} of ${pageCount}</span>
                <button class="pager__btn" type="button" data-page="${page + 1}" ${page === pageCount ? 'disabled' : ''}>Next</button>`;
            pager.onclick = (event) => {
                const button = event.target.closest('[data-page]');
                if (!button || button.disabled) return;
                page = Number(button.dataset.page);
                draw();
                grid.scrollIntoView({ block: 'start', behavior: 'smooth' });
            };
        }
    }

    draw();
}

/* ------------------------------------------------------------------ */
/* Single post                                                         */
/* ------------------------------------------------------------------ */

async function renderPost() {
    const container = $('#blog-post');
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug') || params.get('id');

    if (!slug) {
        container.innerHTML = '<p class="prose-center">No post was requested. <a class="link-inline" href="/blog">Back to the journal</a>.</p>';
        return;
    }

    let post;
    try {
        post = await getJson(`/posts/${encodeURIComponent(slug)}`);
    } catch (error) {
        console.error('Post unavailable:', error);
        container.innerHTML = '<p class="prose-center">That entry could not be found. <a class="link-inline" href="/blog">Back to the journal</a>.</p>';
        return;
    }

    const image = postImage(post);

    // Authored HTML is untrusted input: sanitise before it enters the DOM.
    const safeContent = window.DOMPurify
        ? window.DOMPurify.sanitize(post.content || '', {
            USE_PROFILES: { html: true },
            FORBID_TAGS: ['style', 'form', 'input', 'iframe', 'script'],
        })
        : esc(post.content || '').replace(/\n/g, '<br>');

    document.title = `${post.title} | HK Borah`;

    container.innerHTML = `
        <header class="post-head">
            ${post.category ? `<span class="mono-label kicker">${esc(post.category)}</span>` : ''}
            <h1 class="display-lg">${esc(post.title)}</h1>
            <p class="mono-label post-head__date">${esc(formatDate(post.date))}</p>
            ${engagementHtml(post)}
            <div class="post-head__cta">
                <a class="btn btn--ghost" href="/advice">Talk to My Digital Twin</a>
                <a class="btn btn--solid" href="/book">Book a Call</a>
            </div>
        </header>
        ${image ? `<figure class="post-figure"><img src="${esc(image)}" alt=""></figure>` : ''}
        <div class="post-body">${safeContent}</div>
        <div class="post-foot">
            <div class="post-cta">
                <p class="post-cta__note">If this raised a question about your own business, ask the Twin. It is free, and it answers in your language.</p>
                <div class="section-cta__actions">
                    <a class="btn btn--ghost" href="/advice">Talk to My Digital Twin</a>
                    <a class="btn btn--solid" href="/book">Book a Call</a>
                </div>
            </div>
            ${engagementHtml(post)}
            <a class="link-arrow" href="/blog">Back to the journal</a>
        </div>`;
}

/* ------------------------------------------------------------------ */

/** Wires up whichever like controls are on the page. */
/**
 * Copy link and the native share sheet, for whichever share rows are on the
 * page. Copy falls back to a prompt on browsers that will not grant clipboard
 * access, rather than failing silently.
 */
function initSharing() {
    document.addEventListener('click', async (event) => {
        const copy = event.target.closest('[data-copy-link]');
        if (copy) {
            const row = copy.closest('[data-share-url]');
            const url = row ? row.dataset.shareUrl : location.href;
            try {
                await navigator.clipboard.writeText(url);
                copy.textContent = 'Copied';
                window.setTimeout(() => { copy.textContent = 'Copy link'; }, 2000);
            } catch {
                window.prompt('Copy this link:', url);
            }
            return;
        }

        const native = event.target.closest('[data-native-share]');
        if (native && navigator.share) {
            const row = native.closest('[data-share-url]');
            try {
                await navigator.share({
                    title: row?.dataset.shareTitle || document.title,
                    url: row?.dataset.shareUrl || location.href,
                });
            } catch { /* the reader dismissed the sheet */ }
        }
    });

    // Offer the device's own share sheet where it exists
    if (navigator.share) {
        document.querySelectorAll('[data-native-share]').forEach((b) => { b.hidden = false; });
    }
}

function initLikes() {
    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-like]');
        if (!button || button.disabled) return;
        // On a listing the whole card is a link, so stop it navigating
        event.preventDefault();
        event.stopPropagation();
        sendLike(button);
    }, true);
}

async function init() {
    initSharing();
    initLikes();
    if ($('#blog-grid')) await renderIndex();
    else if ($('#blog-post')) await renderPost();
}

document.addEventListener('DOMContentLoaded', init);
