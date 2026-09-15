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

    const safe = window.DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li',
                       'blockquote', 'a', 'code', 'pre', 'hr'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
    });

    // The browser produces <b> and <i> for the bold and italic buttons, but
    // the stylesheet targets <strong> and <em>. Normalise here so what is
    // published matches what the editor showed.
    const holder = document.createElement('div');
    holder.innerHTML = safe;
    for (const [from, to] of [['b', 'strong'], ['i', 'em']]) {
        holder.querySelectorAll(from).forEach((el) => {
            const replacement = document.createElement(to);
            replacement.innerHTML = el.innerHTML;
            el.replaceWith(replacement);
        });
    }
    return holder.innerHTML;
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
    loadTranscripts();
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

/** Renders Google's button, or explains why it cannot. */
/**
 * Loads Google Identity Services and resolves once it is ready.
 *
 * It is fetched on demand rather than with a static tag, because a tag loaded
 * with `async defer` races this module: the readiness check used to run first,
 * find nothing, and return without ever rendering the button.
 */
function loadGoogleScript() {
    if (window.google?.accounts?.id) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => {
            // The script can finish before the library is ready, so wait a beat
            let tries = 0;
            const wait = window.setInterval(() => {
                if (window.google?.accounts?.id) {
                    window.clearInterval(wait);
                    resolve();
                } else if ((tries += 1) > 40) {
                    window.clearInterval(wait);
                    reject(new Error('Google sign-in did not become ready.'));
                }
            }, 100);
        });
        script.addEventListener('error', () => reject(new Error('Google sign-in could not be loaded.')));
        document.head.appendChild(script);
    });
}

/** Reports why the button is not showing, rather than failing silently. */
function googleNote(message) {
    const note = $('#google-note');
    if (!note) return;
    note.textContent = message;
    note.hidden = !message;
}

async function initGoogleButton() {
    const holder = $('#google-button');
    if (!holder) return;

    let clientId = '';
    try {
        const config = await api('/config');
        clientId = config?.googleClientId || '';
    } catch { /* the password fallback below still works */ }

    if (!clientId) {
        googleNote('Google sign-in is not configured yet. Set VITE_GOOGLE_CLIENT_ID, or use a password below.');
        return;
    }

    try {
        await loadGoogleScript();
    } catch (error) {
        googleNote(`${error.message} Use a password below instead.`);
        return;
    }

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

    // Google reports an unregistered origin only to the browser console, and
    // then renders nothing. Without this check the page shows a blank space
    // where the button should be, with no clue why.
    window.setTimeout(() => {
        const frame = holder.querySelector('iframe');
        const drawn = frame && frame.getBoundingClientRect().width > 1;
        if (!drawn) {
            googleNote('Google sign-in is not available for this web address. The origin '
                + 'must be listed for this client ID in Google Cloud Console, or use a password below.');
        }
    }, 1800);
}

/* ------------------------------------------------------------------ */
/* Saved conversations                                                 */
/*                                                                     */
/* Filter by date, page through them, select several, download them as */
/* text, and delete. Mirrors the transcript browser on the previous    */
/* editor, rebuilt in this site's own components.                      */
/* ------------------------------------------------------------------ */

const tr = {
    all: [],
    from: '',
    to: '',
    pageSize: 50,     // 0 means every row on one page
    page: 1,
    selected: new Set(),
};

function transcriptStatus(message, isError = false) {
    const el = $('#transcripts-status');
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('is-error', isError);
}

/** Milliseconds or a date string to a readable label. */
function when(value) {
    if (!value) return 'unknown date';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'unknown date';
    return d.toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

/** yyyy-mm-dd for a stored timestamp, so date inputs can compare against it. */
function dayKey(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
    ));
}

const visible = () => tr.all.filter((s) => {
    const day = dayKey(s.createdAt);
    if (tr.from && day && day < tr.from) return false;
    if (tr.to && day && day > tr.to) return false;
    return true;
});

const pageCount = () => (tr.pageSize === 0 ? 1 : Math.max(1, Math.ceil(visible().length / tr.pageSize)));

function currentPageRows() {
    const rows = visible();
    if (tr.pageSize === 0) return rows;
    const start = (tr.page - 1) * tr.pageSize;
    return rows.slice(start, start + tr.pageSize);
}

/** A conversation as readable text, for the download. */
function transcriptAsText(session) {
    const lines = (session.messages || []).map((m) => (
        `[${m.role === 'user' ? 'VISITOR' : 'HK BORAH'}]:\n${m.content}`
    ));
    return lines.join('\n\n---\n\n');
}

function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function renderTranscripts() {
    const list = $('#transcript-list');
    const pager = $('#transcript-pager');
    const head = $('#transcript-head');
    const rows = currentPageRows();

    if (!tr.all.length) {
        list.innerHTML = '';
        if (head) head.hidden = true;
        if (pager) pager.hidden = true;
        transcriptStatus('Nothing saved yet. A conversation appears here when a visitor presses Save.');
        return;
    }
    if (!rows.length) {
        list.innerHTML = '';
        if (head) head.hidden = true;
        if (pager) pager.hidden = true;
        transcriptStatus('No conversations between those dates.');
        return;
    }

    transcriptStatus(`${visible().length} conversation${visible().length === 1 ? '' : 's'}` +
        (tr.from || tr.to ? ' in this range' : ' saved'));

    list.innerHTML = rows.map((s) => `
        <details class="transcript" data-id="${s.id}">
            <summary>
                <input type="checkbox" data-select="${s.id}" ${tr.selected.has(s.id) ? 'checked' : ''}
                       aria-label="Select the conversation from ${when(s.createdAt)}">
                <span class="mono-label transcript__date">${when(s.createdAt)}</span>
                <span class="transcript__preview">${escapeHtml(s.preview)}</span>
                <span class="mono-label transcript__count">${s.messageCount} messages</span>
            </summary>
            <div class="transcript__body">
                <p class="editor-hint">Opening\u2026</p>
                <button class="tr-btn" type="button" data-download="${s.id}">Download this conversation</button>
            </div>
        </details>`).join('');

    if (head) {
        head.hidden = false;
        const allTicked = rows.every((s) => tr.selected.has(s.id));
        const box = $('#tr-select-page');
        if (box) box.checked = allTicked;
        const count = $('#tr-selected-count');
        if (count) count.textContent = tr.selected.size ? `${tr.selected.size} selected` : '';
    }

    const deleteSelected = $('#tr-delete-selected');
    if (deleteSelected) {
        deleteSelected.disabled = tr.selected.size === 0;
        deleteSelected.textContent = tr.selected.size ? `Delete selected (${tr.selected.size})` : 'Delete selected';
    }

    if (pager) {
        const pages = pageCount();
        pager.hidden = pages <= 1;
        pager.innerHTML = `
            <button class="pager__btn" type="button" data-page="${tr.page - 1}" ${tr.page === 1 ? 'disabled' : ''}>Previous</button>
            <span class="mono-label pager__count">Page ${tr.page} of ${pages}</span>
            <button class="pager__btn" type="button" data-page="${tr.page + 1}" ${tr.page === pages ? 'disabled' : ''}>Next</button>`;
    }
}

async function loadTranscripts() {
    if (!$('#transcript-list')) return;
    transcriptStatus('Loading\u2026');
    try {
        tr.all = await api('/chat/sessions');
        tr.page = 1;
        renderTranscripts();
    } catch (error) {
        tr.all = [];
        transcriptStatus(error.message, true);
    }
}

/** Loads one conversation the first time it is opened. */
async function openTranscript(details) {
    const body = details.querySelector('.transcript__body');
    if (!body || details.dataset.loaded === 'true') return;
    try {
        const session = await api(`/chat/sessions/${encodeURIComponent(details.dataset.id)}`);
        details.dataset.messages = JSON.stringify(session.messages || []);
        const messages = Array.isArray(session.messages) ? session.messages : [];
        body.innerHTML = messages.map((m) => `
            <div class="transcript__msg transcript__msg--${m.role === 'user' ? 'user' : 'twin'}">
                <span class="mono-label">${m.role === 'user' ? 'Visitor' : 'Twin'}</span>
                <p>${escapeHtml(m.content)}</p>
            </div>`).join('')
            + `<button class="tr-btn" type="button" data-download="${details.dataset.id}">Download this conversation</button>
               <button class="tr-btn tr-btn--danger" type="button" data-delete-transcript="${details.dataset.id}">Delete this conversation</button>`;
        details.dataset.loaded = 'true';
    } catch (error) {
        body.innerHTML = `<p class="editor-hint">${escapeHtml(error.message)}</p>`;
    }
}

async function removeTranscript(id, details) {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    try {
        await api(`/chat/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
        tr.selected.delete(id);
        if (details) details.remove();
        tr.all = tr.all.filter((s) => s.id !== id);
        renderTranscripts();
        transcriptStatus('Conversation deleted.');
    } catch (error) {
        transcriptStatus(error.message, true);
    }
}

async function deleteSelectedTranscripts() {
    const ids = [...tr.selected];
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} conversation${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    try {
        await api('/chat/sessions/delete-multiple', { method: 'POST', body: { ids } });
        tr.selected.clear();
        await loadTranscripts();
        transcriptStatus(`${ids.length} conversation${ids.length === 1 ? '' : 's'} deleted.`);
    } catch (error) {
        transcriptStatus(error.message, true);
    }
}

async function deleteAllTranscripts() {
    if (!tr.all.length) return;
    if (!confirm(`Delete all ${tr.all.length} conversations? This cannot be undone.`)) return;
    try {
        const result = await api('/chat/sessions/delete-multiple', { method: 'POST', body: { all: true } });
        tr.selected.clear();
        await loadTranscripts();
        transcriptStatus(`${result.deleted} conversation${result.deleted === 1 ? '' : 's'} deleted.`);
    } catch (error) {
        transcriptStatus(error.message, true);
    }
}

/** Downloads the conversations currently in view as one text file. */
async function downloadTranscripts() {
    const rows = visible();
    if (!rows.length) {
        transcriptStatus('Nothing to download in this range.', true);
        return;
    }
    transcriptStatus('Preparing the download\u2026');
    try {
        const parts = [];
        for (const row of rows) {
            const session = await api(`/chat/sessions/${encodeURIComponent(row.id)}`);
            parts.push(`========================================\n`
                + `Session: ${when(session.createdAt)}\n`
                + `========================================\n\n`
                + transcriptAsText(session));
        }
        const range = tr.from && tr.to ? `${tr.from}_to_${tr.to}`
            : tr.from ? `from_${tr.from}`
            : tr.to ? `until_${tr.to}` : 'all';
        downloadText(`HK_Borah_Transcripts_${range}.txt`, parts.join('\n\n\n'));
        transcriptStatus(`${rows.length} conversation${rows.length === 1 ? '' : 's'} downloaded.`);
    } catch (error) {
        transcriptStatus(error.message, true);
    }
}

/** Downloads one already-opened conversation. */
function downloadOne(details) {
    if (!details || !details.dataset.messages) return;
    const messages = JSON.parse(details.dataset.messages);
    const stamp = when(tr.all.find((s) => s.id === details.dataset.id)?.createdAt).replace(/[^0-9a-zA-Z]/g, '-');
    downloadText(`HK_Borah_Conversation_${stamp}.txt`,
        `Session: ${stamp}\n\n${transcriptToText(messages)}`);
}

function transcriptToText(messages) {
    return messages.map((m) => `[${m.role === 'user' ? 'VISITOR' : 'HK BORAH'}]:\n${m.content}`).join('\n\n---\n\n');
}

function initTranscripts() {
    if (!$('#transcript-list')) return;

    $('#tr-from')?.addEventListener('change', (e) => { tr.from = e.target.value; tr.page = 1; renderTranscripts(); });
    $('#tr-to')?.addEventListener('change', (e) => { tr.to = e.target.value; tr.page = 1; renderTranscripts(); });
    $('#tr-clear')?.addEventListener('click', () => {
        tr.from = ''; tr.to = ''; tr.page = 1;
        const from = $('#tr-from'); const to = $('#tr-to');
        if (from) from.value = ''; if (to) to.value = '';
        renderTranscripts();
    });

    document.querySelectorAll('.tr-btn--size').forEach((button) => {
        button.addEventListener('click', () => {
            tr.pageSize = Number(button.dataset.size);
            tr.page = 1;
            document.querySelectorAll('.tr-btn--size').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
            renderTranscripts();
        });
    });
    document.querySelector('.tr-btn--size')?.setAttribute('aria-pressed', 'true');

    $('#tr-download')?.addEventListener('click', downloadTranscripts);
    $('#tr-delete-selected')?.addEventListener('click', deleteSelectedTranscripts);
    $('#tr-delete-all')?.addEventListener('click', deleteAllTranscripts);

    $('#tr-select-page')?.addEventListener('change', (event) => {
        currentPageRows().forEach((s) => {
            if (event.target.checked) tr.selected.add(s.id); else tr.selected.delete(s.id);
        });
        renderTranscripts();
    });

    $('#transcript-pager')?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-page]');
        if (!button || button.disabled) return;
        tr.page = Number(button.dataset.page);
        renderTranscripts();
        $('#apanel-transcripts')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });

    // Opening a row, ticking it, or acting on it
    $('#transcript-list')?.addEventListener('toggle', (event) => {
        const details = event.target.closest('details.transcript');
        if (details && details.open) openTranscript(details);
    }, true);

    $('#transcript-list')?.addEventListener('change', (event) => {
        const box = event.target.closest('[data-select]');
        if (!box) return;
        event.stopPropagation();
        if (box.checked) tr.selected.add(box.dataset.select); else tr.selected.delete(box.dataset.select);
        renderTranscripts();
    });

    $('#transcript-list')?.addEventListener('click', (event) => {
        const details = event.target.closest('details.transcript');
        // A click on the checkbox or a button must not fold the row
        if (event.target.closest('input, button')) event.stopPropagation();

        const download = event.target.closest('[data-download]');
        if (download) { downloadOne(details); return; }

        const del = event.target.closest('[data-delete-transcript]');
        if (del) { removeTranscript(del.dataset.deleteTranscript, details); return; }
    });
}


/* ------------------------------------------------------------------ */
/* Editor commands                                                     */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* List nesting                                                        */
/*                                                                     */
/* The browser's own indent and outdent are inconsistent: outdent in   */
/* particular often does nothing, or leaves stray spans carrying the   */
/* page's own styles. These do the two operations directly on the list */
/* structure instead, and say so when an operation cannot apply.       */
/* ------------------------------------------------------------------ */

/** The list item containing the caret, if there is one. */
function currentListItem(surface) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;
    const node = selection.getRangeAt(0).startContainer;
    const element = node.nodeType === 1 ? node : node.parentElement;
    if (!element || !surface.contains(element)) return null;
    return element.closest('li');
}

/** Sends the item under the caret one level deeper. */
function indentListItem(surface) {
    const item = currentListItem(surface);
    if (!item) {
        editorHint('Indent works inside a list. Turn this line into a bullet or number list first.');
        return;
    }
    const previous = item.previousElementSibling;
    if (!previous) {
        editorHint('This is the first item, so there is nothing to indent it under.');
        return;
    }

    // Nest inside the previous item, matching the parent list type
    const parentList = item.parentElement;
    const tag = parentList.tagName.toLowerCase() === 'ol' ? 'ol' : 'ul';
    let sublist = previous.querySelector(`:scope > ${tag}`);
    if (!sublist) {
        sublist = document.createElement(tag);
        previous.appendChild(sublist);
    }
    sublist.appendChild(item);
    editorHint('');
}

/** Brings the item under the caret back up one level. */
function outdentListItem(surface) {
    const item = currentListItem(surface);
    if (!item) {
        editorHint('Outdent works inside a list.');
        return;
    }
    const sublist = item.parentElement;
    const parentItem = sublist.parentElement && sublist.parentElement.closest('li');
    if (!parentItem) {
        editorHint('This item is already at the top level of the list.');
        return;
    }

    // The item and everything after it move up, which is what outdenting
    // an item in the middle of a sublist should do.
    const moving = [item];
    for (let next = item.nextElementSibling; next; next = next.nextElementSibling) {
        moving.push(next);
    }
    parentItem.after(...moving);
    if (!sublist.children.length) sublist.remove();
    editorHint('');
}

function editorHint(message) {
    const hint = $('#editor-hint');
    if (hint) hint.textContent = message;
}

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

        if (button.dataset.action === 'indent') {
            indentListItem(surface);
        } else if (button.dataset.action === 'outdent') {
            outdentListItem(surface);
        } else if (button.dataset.cmd) {
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
    $('#sign-out')?.addEventListener('click', () => {
        setToken(null);
        resetForm();
        showLogin('');
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

    $('#transcript-list')?.addEventListener('toggle', (event) => {
        const details = event.target.closest('details.transcript');
        if (details && details.open) openTranscript(details);
    }, true);

    $('#transcript-list')?.addEventListener('click', (event) => {
        const del = event.target.closest('[data-delete-transcript]');
        if (!del) return;
        event.preventDefault();
        removeTranscript(del.dataset.deleteTranscript, del.closest('details.transcript'));
    });

    // Reload transcripts whenever that tab is opened
    document.querySelectorAll('.tab[aria-controls="apanel-transcripts"]').forEach((tab) => {
        tab.addEventListener('click', () => { tr.page = 1; loadTranscripts(); });
    });

    initToolbar();
    initTranscripts();
    showImagePreview();
    initGoogleButton();

    // Already signed in?
    if (getToken()) showEditor();
    else showLogin('');
}

document.addEventListener('DOMContentLoaded', init);
