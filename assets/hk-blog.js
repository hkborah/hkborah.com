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
        button.querySelector('[data-count]').textContent = data.likes;
        button.classList.add('like--done');
        rememberLike(id);
    } catch (error) {
        console.error('Like failed:', error);
        button.disabled = false;   // let them try again
    }
}

function cardHtml(post) {
    const image = resolveImage(post.image);
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

    const image = resolveImage(post.image);

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
            <div class="post-head__like" data-like-host="${post.id}">${likeHtml(post)}</div>
        </header>
        ${image ? `<figure class="post-figure"><img src="${esc(image)}" alt=""></figure>` : ''}
        <div class="post-body">${safeContent}</div>
        <div class="post-foot">
            <div class="post-cta">
                <p class="post-cta__note">If this raised a question about your own business, ask the Twin. It is free, and it answers in your language.</p>
                <div class="section-cta__actions">
                    <a class="btn btn--ghost" href="/advice">Talk to My Digital Twin</a>
                    <a class="btn btn--solid" href="/execution#book">Book a Call</a>
                </div>
            </div>
            <a class="link-arrow" href="/blog">Back to the journal</a>
        </div>`;
}

/* ------------------------------------------------------------------ */

/** Wires up whichever like controls are on the page. */
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
    initLikes();
    if ($('#blog-grid')) await renderIndex();
    else if ($('#blog-post')) await renderPost();
}

document.addEventListener('DOMContentLoaded', init);
