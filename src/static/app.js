const API = "/api";

let currentUser = null;
let currentSessionId = null;

/* ====== UTILS ====== */
function $(sel) { return document.querySelector(sel); }
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "<")
        .replaceAll(">", ">")
        .replaceAll('"', '&' + 'quot;')
        .replaceAll("'", "&#039;");
}

async function api(path, opts = {}) {
    const url = API + path;
    const options = {
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...(opts.headers || {}),
        },
        ...opts,
    };
    if (opts.body && typeof opts.body !== "string") {
        options.body = JSON.stringify(opts.body);
    }
    const res = await fetch(url, options);
    if (res.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
        logout();
    }
    return res;
}

/* ====== AUTH ====== */
async function loadUser() {
    const res = await api("/auth/me");
    if (res.ok) {
        currentUser = await res.json();
        updateAuthUI();
        loadHistory();
    } else {
        currentUser = null;
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (currentUser) {
        $("#auth-section").classList.add("header__auth--hidden");
        $("#user-section").classList.remove("header__auth--hidden");
        $("#user-name").textContent = currentUser.login;
    } else {
        $("#auth-section").classList.remove("header__auth--hidden");
        $("#user-section").classList.add("header__auth--hidden");
    }
}

async function logout() {
    await api("/auth/logout", { method: "POST" });
    currentUser = null;
    updateAuthUI();
    $("#history-list").innerHTML = "";
}

async function login(loginVal, passwordVal) {
    const res = await api("/auth/login", {
        method: "POST",
        body: { login: loginVal, password: passwordVal },
    });
    if (res.ok) {
        await loadUser();
        hideModal("auth-modal");
    } else {
        const err = await res.json();
        $("#auth-error").textContent = err.detail || "Ошибка входа";
    }
}

async function register(loginVal, passwordVal) {
    const res = await api("/auth/register", {
        method: "POST",
        body: { login: loginVal, password: passwordVal },
    });
    if (res.ok) {
        await login(loginVal, passwordVal);
    } else {
        const err = await res.json();
        $("#auth-error").textContent = err.detail || "Ошибка регистрации";
    }
}

/* ====== TOPICS ====== */
async function loadTopics() {
    const res = await api("/topics");
    if (!res.ok) return;
    const data = await res.json();
    const grid = $("#topics-grid");
    if (!data.items || data.items.length === 0) {
        grid.innerHTML = '<div class="topics__empty">Пока нет тем</div>';
        return;
    }
    grid.innerHTML = data.items.map(t => `
        <div class="topic-card" data-id="${t.id}">
            <h3>${escapeHtml(t.title)}</h3>
            <p>${escapeHtml(t.description)}</p>
        </div>
    `).join("");
}

/* ====== CHAT ====== */
const chatMessages = $("#chat-messages");

function addMessage(role, html, msgId = null) {
    const div = document.createElement("div");
    div.className = `msg msg--${role}`;
    div.dataset.id = msgId || "";
    div.innerHTML = String(html).trim();
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function addTyping() {
    return addMessage("assistant", `<span class="typing">Поиск…</span>`);
}

async function sendChat(text) {
    if (!text.trim()) return;
    addMessage("user", escapeHtml(text));
    $("#chat-input").value = "";
    const typingEl = addTyping();

    const res = await api("/chat/send", {
        method: "POST",
        body: { text: text.trim() },
    });

    typingEl.remove();

    if (res.ok) {
        const data = await res.json();
        const html = `
            <div>${escapeHtml(data.answer)}</div>
            <div class="msg__actions">
                <button class="btn btn--small btn--like" data-id="${data.message_id}" data-like="true">👍</button>
                <button class="btn btn--small btn--dislike" data-id="${data.message_id}" data-like="false">👎</button>
                <button class="btn btn--small btn--copy" data-text="${escapeHtml(data.answer)}">📋</button>
            </div>
            <div class="msg__meta">Найдено документов: ${data.documents_found}</div>
        `;
        addMessage("assistant", html, data.message_id);
        if (currentUser) loadHistory();
    } else {
        const err = await res.json();
        addMessage("assistant", `<div class="msg__error">Ошибка: ${escapeHtml(err.detail || "Неизвестная ошибка")}</div>`);
    }
}

async function rateMessage(msgId, liked) {
    await api(`/chat/${msgId}/rate`, {
        method: "POST",
        body: { liked },
    });
}

async function newChat() {
    await api("/chat/new", { method: "POST" });
    chatMessages.innerHTML = "";
    currentSessionId = null;
    if (currentUser) loadHistory();
}

async function loadHistory() {
    if (!currentUser) {
        $("#history-list").innerHTML = '<div class="chat-history__empty">Войдите, чтобы сохранять историю</div>';
        return;
    }
    const res = await api("/chat/history");
    if (!res.ok) return;
    const sessions = await res.json();
    const list = $("#history-list");
    if (!sessions || sessions.length === 0) {
        list.innerHTML = '<div class="chat-history__empty">Нет истории</div>';
        return;
    }
    list.innerHTML = sessions.map(s => `
        <div class="chat-history__item" data-id="${s.id}" title="${escapeHtml(s.first_message || '')}">
            <span class="chat-history__label">${escapeHtml((s.first_message || "Новый чат").slice(0, 30))}</span>
            <span class="chat-history__date">${new Date(s.created_at).toLocaleDateString()}</span>
        </div>
    `).join("");
}

async function loadSessionMessages(sessionId) {
    const res = await api(`/chat/history/${sessionId}`);
    if (!res.ok) return;
    const messages = await res.json();
    chatMessages.innerHTML = "";
    messages.forEach(m => {
        if (m.role === "user") {
            addMessage("user", escapeHtml(m.content));
        } else {
            const html = `
                <div>${escapeHtml(m.content)}</div>
                <div class="msg__actions">
                    <button class="btn btn--small btn--like" data-id="${m.id}" data-like="true">👍</button>
                    <button class="btn btn--small btn--dislike" data-id="${m.id}" data-like="false">👎</button>
                    <button class="btn btn--small btn--copy" data-text="${escapeHtml(m.content)}">📋</button>
                </div>
            `;
            addMessage("assistant", html, m.id);
        }
    });
}

/* ====== FEEDBACK ====== */
async function sendFeedback(text) {
    const res = await api("/feedback", {
        method: "POST",
        body: { text },
    });
    return res.ok;
}

/* ====== MODALS ====== */
function showModal(id) { $(`#${id}`).classList.remove("modal--hidden"); }
function hideModal(id) { $(`#${id}`).classList.add("modal--hidden"); }

/* ====== EVENTS ====== */
document.addEventListener("DOMContentLoaded", () => {
    loadUser();
    loadTopics();

    // Auth buttons
    $("#btn-login").addEventListener("click", () => {
        $("#auth-title").textContent = "Вход";
        $("#auth-submit").textContent = "Войти";
        $("#auth-modal").dataset.mode = "login";
        showModal("auth-modal");
    });
    $("#btn-register").addEventListener("click", () => {
        $("#auth-title").textContent = "Регистрация";
        $("#auth-submit").textContent = "Зарегистрироваться";
        $("#auth-modal").dataset.mode = "register";
        showModal("auth-modal");
    });
    $("#btn-logout").addEventListener("click", logout);
    $("#auth-cancel").addEventListener("click", () => hideModal("auth-modal"));
    $("#auth-submit").addEventListener("click", async () => {
        const loginVal = $("#auth-login").value.trim();
        const passVal = $("#auth-password").value.trim();
        if (!loginVal || !passVal) {
            $("#auth-error").textContent = "Заполните все поля";
            return;
        }
        const mode = $("#auth-modal").dataset.mode;
        if (mode === "login") await login(loginVal, passVal);
        else await register(loginVal, passVal);
    });

    // Chat panel
    $("#chat-toggle").addEventListener("click", () => {
        $("#chat-body").classList.toggle("chat-panel__body--open");
    });
    $("#btn-close-chat").addEventListener("click", () => {
        $("#chat-body").classList.remove("chat-panel__body--open");
    });
    $("#btn-new-chat").addEventListener("click", newChat);
    $("#btn-history-toggle").addEventListener("click", () => {
        $("#chat-history-sidebar").classList.toggle("chat-history--open");
    });
    $("#chat-form").addEventListener("submit", (e) => {
        e.preventDefault();
        sendChat($("#chat-input").value);
    });

    // Chat actions (like, copy)
    chatMessages.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        if (btn.classList.contains("btn--like") || btn.classList.contains("btn--dislike")) {
            const msgId = btn.dataset.id;
            const liked = btn.dataset.like === "true";
            rateMessage(msgId, liked);
            btn.closest(".msg").querySelectorAll(".btn--like, .btn--dislike").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        }
        if (btn.classList.contains("btn--copy")) {
            navigator.clipboard.writeText(btn.dataset.text);
            btn.textContent = "✅";
            setTimeout(() => btn.textContent = "📋", 1500);
        }
    });

    // History item click
    $("#history-list").addEventListener("click", (e) => {
        const item = e.target.closest(".chat-history__item");
        if (!item) return;
        loadSessionMessages(item.dataset.id);
    });

    // Feedback
    $("#feedback-btn").addEventListener("click", () => showModal("feedback-modal"));
    $("#feedback-cancel").addEventListener("click", () => hideModal("feedback-modal"));
    $("#feedback-send").addEventListener("click", async () => {
        const text = $("#feedback-text").value.trim();
        if (!text) return;
        if (await sendFeedback(text)) {
            $("#feedback-text").value = "";
            hideModal("feedback-modal");
            alert("Спасибо за обратную связь!");
        }
    });

    // Close modals on backdrop click
    document.querySelectorAll(".modal__backdrop").forEach(b => {
        b.addEventListener("click", () => {
            b.closest(".modal").classList.add("modal--hidden");
        });
    });
});
