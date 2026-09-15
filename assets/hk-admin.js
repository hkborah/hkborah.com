/* ==========================================================================
   hk-admin.js — journal editor for hkborah.com
   Handles sign in (Google or email + password) and create / edit / delete
   of blog entries, against the same API contract as HkBorahRedesign.

   Security notes (these fix holes in the original app):
     - The token is stored in localStorage and sent as a Bearer header. The
       server must VERIFY it. The original Pages Function issued an unsigned
       base64 blob, which anyone could forge, and its write endpoints checked
       nothing at all.
     - Entry HTML is sanitised with DOMPurify before it is shown in the
       editor and again before it is sent, so a bad paste cannot be stored.
     - Uploaded images are downscaled and re-encoded on the device, so a
       multi-megabyte photo never reaches the database.
   ========================================================================== */

'use strict';

const API = '/api';
const TOKEN_KEY = 'hk-auth-token';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Sanitises authored HTML, keeping only formatting the editor produces. */
function clean(html) {
    if (!window.DOMPurify) return '';
    return window.DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li',
                       'blockquote', 'a', 'code', 'pre', 'hr'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
    });
}

const getToken = () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
const setToken = (token) => {
    try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
};

/** Signed API call. Throws on non-2xx so callers can show one message. */
async function api(path, { method = 'GET', body } = {}) {
    const headers = { Accept: 'application/json' };
    if (body) headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API}${path}`, {
        method, headers, body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 || response.status === 403) {
        setToken(null);
        throw new Error('Your session has expired. Please sign in again.');
    }
    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(detail.slice(0, 200) || `Request failed (${response.status})`);
    }
    return response.status === 204 ? null : response.json();
}

/* ------------------------------------------------------------------ */
/* Editor state                                                        */
/* ------------------------------------------------------------------ */

const state = {
    id: null,          // null = creating
    image: '',         // data URI or URL
    date: '',          // preserved when editing, set on create
    busy: false,
};

function status(message, isError = false) {
    const el = $('#editor-status');
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('is-error', isError);
}

/** Local date string in the same shape the database already stores. */
function todayLabel() {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function slugify(title) {
    return title.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

/* ------------------------------------------------------------------ */
/* Image handling                                                      */
/* ------------------------------------------------------------------ */

/**
 * Downscales and re-encodes an image on the device.
 * Keeps entries small enough for a database text column; the original app
 * required exactly 1920x1080 and stored whatever it was given.
 */
function compressImage(file, maxWidth = 1600, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read that file.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('That file is not a readable image.'));
            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function showImagePreview() {
    const box = $('#image-preview-box');
    const img = $('#image-preview');
    if (!box || !img) return;
    box.hidden = !state.image;
    if (state.image) img.src = state.image;
}

/* ------------------------------------------------------------------ */
/* Saving                                                              */
/* ------------------------------------------------------------------ */

async function save() {
    if (state.busy) return;

    const title = $('#field-title').value.trim();
    const category = $('#field-category').value.trim();
    const content = clean($('#field-content').innerHTML);

    if (!title) { status('Add a headline first.', true); $('#field-title').focus(); return; }
    if (!content || $('#field-content').textContent.trim().length < 20) {
        status('Write a little more before publishing.', true); return;
    }

    // Excerpt and slug are derived, exactly as the original editor did.
    const plain = $('#field-content').textContent.trim();
    const payload = {
        title,
        category,
        content,
        excerpt: plain.slice(0, 100).trim() + (plain.length > 100 ? '...' : ''),
        slug: slugify(title),
        date: state.date || todayLabel(),
        image: state.image || '',
    };

    state.busy = true;
    status('Saving...');
    try {
        if (state.id) {
            await api(`/blog/posts/${encodeURIComponent(state.id)}`, { method: 'PUT', body: payload });
            status('Entry updated.');
        } else {
            const created = await api('/blog/create', { method: 'POST', body: payload });
            state.id = created?.id ?? null;
            $('#editor-heading').textContent = 'Editing entry';
            status('Entry published.');
        }
        await loadPostList();
    } catch (error) {
        console.error(error);
        status(error.message || 'Could not save. Please try again.', true);
    } finally {
        state.busy = false;
    }
}

/* ------------------------------------------------------------------ */
/* List, load, delete                                                  */
/* ------------------------------------------------------------------ */

async function loadPostList() {
    const list = $('#post-list');
    if (!list) return;
    try {
        const posts = await api('/blog/posts');
        if (!posts.length) {
            list.innerHTML = '<p class="editor-hint">Nothing published yet.</p>';
            return;
        }
        list.innerHTML = posts.map((post) => `
            <div class="editor-list__row">
                <button class="editor-list__title" type="button" data-load="${post.id}">
                    <span>${post.title.replace(/[<>&"]/g, '')}</span>
                    <span class="mono-label">${post.date || ''}</span>
                </button>
                <button class="editor-list__delete" type="button" data-delete="${post.id}"
                        aria-label="Delete this entry">Delete</button>
            </div>`).join('');
    } catch (error) {
        list.innerHTML = `<p class="editor-hint">${error.message}</p>`;
    }
}

async function loadPost(id) {
    try {
        const post = await api(`/blog/posts/${encodeURIComponent(id)}`);
        state.id = post.id;
        state.image = post.image || '';
        state.date = post.date || '';
        $('#field-title').value = post.title || '';
        $('#field-category').value = post.category || '';
        $('#field-content').innerHTML = clean(post.content || '');
        showImagePreview();
        $('#editor-heading').textContent = 'Editing entry';
        status('');
        $('#field-title').focus();
    } catch (error) {
        status(error.message, true);
    }
}

async function remove(id) {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    try {
        await api(`/blog/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (state.id === id) resetForm();
        await loadPostList();
        status('Entry deleted.');
    } catch (error) {
        status(error.message, true);
    }
}

function resetForm() {
    state.id = null;
    state.image = '';
    state.date = '';
    $('#field-title').value = '';
    $('#field-category').value = '';
    $('#field-content').innerHTML = '';
    $('#field-image').value = '';
    $('#field-image-url').value = '';
    showImagePreview();
    $('#editor-heading').textContent = 'New entry';
    status('');
}

/* ------------------------------------------------------------------ */
/* Views                                                               */
/* ------------------------------------------------------------------ */

function showEditor() {
    $('#login-view').hidden = true;
    $('#editor-view').hidden = false;
    $('#sign-out').hidden = false;
    loadPostList();
}

function showLogin(message) {
    $('#login-view').hidden = false;
    $('#editor-view').hidden = true;
    $('#sign-out').hidden = true;
    if (message) $('#login-status').textContent = message;
}

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

async function signInWithGoogle(credential) {
    const result = await api('/auth/login', { method: 'POST', body: { credential } });
    if (!result?.token) throw new Error('Sign in failed.');
    setToken(result.token);
    showEditor();
}

async function signInWithPassword(email, password) {
    const result = await api('/auth/login', { method: 'POST', body: { email, password } });
    if (!result?.token) throw new Error('Sign in failed.');
    setToken(result.token);
    showEditor();
}

/** Renders Google's button when a client ID is available, else password only. */
async function initGoogleButton() {
    const holder = $('#google-button');
    if (!holder || !window.google?.accounts?.id) return;

    let clientId = '';
    try {
        const config = await api('/config');
        clientId = config?.googleClientId || '';
    } catch { /* password sign in still works */ }

    if (!clientId) return;

    window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
            try {
                await signInWithGoogle(response.credential);
            } catch (error) {
                $('#login-status').textContent = error.message;
            }
        },
    });
    window.google.accounts.id.renderButton(holder, {
        theme: 'filled_black', size: 'large', text: 'signin_with', shape: 'rectangular',
    });
}

/* ------------------------------------------------------------------ */
/* Editor commands                                                     */
/* ------------------------------------------------------------------ */

function initToolbar() {
    const toolbar = $('#editor-toolbar');
    const surface = $('#field-content');
    if (!toolbar || !surface) return;

    // Keep the caret in place while a toolbar button is pressed
    toolbar.addEventListener('mousedown', (event) => event.preventDefault());

    toolbar.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        surface.focus();

        if (button.dataset.cmd) {
            document.execCommand(button.dataset.cmd, false, null);
        } else if (button.dataset.block) {
            document.execCommand('formatBlock', false, button.dataset.block);
        } else if (button.dataset.link) {
            const url = prompt('Link address (https://...)');
            if (url) document.execCommand('createLink', false, url);
        }
    });

    // Plain-text paste: stops stray markup and scripts entering an entry
    surface.addEventListener('paste', (event) => {
        event.preventDefault();
        const text = (event.clipboardData || window.clipboardData).getData('text/plain');
        const chunks = text.split(/\n{2,}/).map((chunk) => `<p>${chunk.replace(/\n/g, '<br>')}</p>`);
        document.execCommand('insertHTML', false, clean(chunks.join('')));
    });
}

/* ------------------------------------------------------------------ */
/* Boot                                                               */
/* ------------------------------------------------------------------ */

function init() {
    const passwordForm = $('#password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            $('#login-status').textContent = 'Signing in...';
            try {
                await signInWithPassword($('#login-email').value, $('#login-password').value);
            } catch (error) {
                $('#login-status').textContent = error.message;
            }
        });
    }

    $('#sign-out')?.addEventListener('click', () => {
        setToken(null);
        resetForm();
        showLogin('Signed out.');
    });

    $('#save-post')?.addEventListener('click', save);
    $('#new-post')?.addEventListener('click', resetForm);

    $('#field-image')?.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        status('Preparing image...');
        try {
            state.image = await compressImage(file);
            $('#field-image-url').value = '';
            showImagePreview();
            status('');
        } catch (error) {
            status(error.message, true);
        }
    });

    $('#field-image-url')?.addEventListener('input', (event) => {
        const url = event.target.value.trim();
        if (!url) return;
        state.image = url;
        showImagePreview();
    });

    $('#clear-image')?.addEventListener('click', () => {
        state.image = '';
        $('#field-image').value = '';
        $('#field-image-url').value = '';
        showImagePreview();
    });

    $('#post-list')?.addEventListener('click', (event) => {
        const load = event.target.closest('[data-load]');
        const del = event.target.closest('[data-delete]');
        if (load) loadPost(load.dataset.load);
        if (del) remove(del.dataset.delete);
    });

    initToolbar();
    showImagePreview();
    initGoogleButton();

    // Already signed in?
    if (getToken()) showEditor();
    else showLogin('');
}

document.addEventListener('DOMContentLoaded', init);
