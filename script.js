"use strict";

/* ------------------------------------------------------------
   ظˆط¶ط¹غŒطھ ط¨ط±ظ†ط§ظ…ظ‡ (ظ‡ظ…ظ‡ ع†غŒط² ظپظ‚ط· ط¯ط± ط­ط§ظپط¸ظ‡ط› ع†غŒط²غŒ ط°ط®غŒط±ظ‡ ط¯ط§ط¦ظ…غŒ ظ†ظ…غŒâ€Œط´ظˆط¯)
------------------------------------------------------------- */
let apiKey = null;
let messages = [];      // { role, content(ظ†ظ…ط§غŒط´غŒ), apiContent, attachmentSummary, isError }
let attachments = [];   // { id, kind, name, previewUrl, base64:[...], mediaType, frameCount }
let loading = false;
let processingFiles = false;

const FRAMES_PER_VIDEO = 4;
const MODEL = "claude-sonnet-4-6";
const MAX_FILE_MB = 20;

/* ------------------------------------------------------------
   ط¹ظ†ط§طµط± DOM
------------------------------------------------------------- */
const el = (id) => document.getElementById(id);

const keyModalOverlay = el("keyModalOverlay");
const apiKeyInput = el("apiKeyInput");
const saveKeyBtn = el("saveKeyBtn");
const settingsBtn = el("settingsBtn");

const messagesEl = el("messages");
const emptyStateEl = el("emptyState");
const suggestionsEl = el("suggestions");
const textInput = el("textInput");
const sendBtn = el("sendBtn");
const attachBtn = el("attachBtn");
const fileInput = el("fileInput");
const attachmentsRow = el("attachmentsRow");
const menuBtn = el("menuBtn");
const sidebar = el("sidebar");
const newChatBtn = el("newChatBtn");
const sidebarList = el("sidebarList");
const statusLine = el("statusLine");

const SUGGESTIONS = [
  "غŒع© ط§غŒط¯ظ‡ ط¨ط±ط§غŒ ظ¾ط±ظˆعکظ‡ ظ¾ط§غŒطھظˆظ† ظ¾غŒط´ظ†ظ‡ط§ط¯ ط¨ط¯ظ‡",
  "ظ…طھظ† غŒع© ط§غŒظ…غŒظ„ ط±ط³ظ…غŒ ط¨ظ†ظˆغŒط³",
  "غŒع© ط´ط¹ط± ع©ظˆطھط§ظ‡ ط¯ط±ط¨ط§ط±ظ‡â€ŒغŒ ط´ط¨ ط¨ظ†ظˆغŒط³",
  "غŒع© ط¨ط±ظ†ط§ظ…ظ‡â€ŒغŒ ظ‡ظپطھع¯غŒ ظ…ط·ط§ظ„ط¹ظ‡ ط·ط±ط§ط­غŒ ع©ظ†",
];

SUGGESTIONS.forEach((s) => {
  const btn = document.createElement("button");
  btn.className = "suggestion-btn";
  btn.textContent = s;
  btn.onclick = () => {
    textInput.value = s;
    updateSendState();
    textInput.focus();
  };
  suggestionsEl.appendChild(btn);
});

/* ------------------------------------------------------------
   ظ…ط¯غŒط±غŒطھ ع©ظ„غŒط¯ API (ظپظ‚ط· ط¯ط± ط­ط§ظپط¸ظ‡â€ŒغŒ ط¬ط§ظˆط§ط§ط³ع©ط±غŒظ¾طھ)
------------------------------------------------------------- */
function openKeyModal() {
  keyModalOverlay.classList.remove("hidden");
  apiKeyInput.value = "";
  apiKeyInput.focus();
}
function closeKeyModal() {
  keyModalOverlay.classList.add("hidden");
}

saveKeyBtn.onclick = () => {
  const val = apiKeyInput.value.trim();
  if (!val) return;
  apiKey = val;
  closeKeyModal();
  statusLine.textContent = "ظ…طھطµظ„ ط´ط¯. ط¹ع©ط³طŒ PDF ظˆ ظˆغŒط¯غŒظˆ ظ¾ط´طھغŒط¨ط§ظ†غŒ ظ…غŒâ€Œط´ظˆظ†ط¯ط› ظپط§غŒظ„ طµظˆطھغŒ ظپط¹ظ„ط§ظ‹ ظ¾ط´طھغŒط¨ط§ظ†غŒ ظ†ظ…غŒâ€Œط´ظˆط¯.";
  statusLine.classList.remove("error-text");
};

apiKeyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveKeyBtn.click();
});

settingsBtn.onclick = openKeyModal;

// ط¯ط± ط¨ط§ط± ط§ظˆظ„ ط¨ط§ط² ط´ط¯ظ† طµظپط­ظ‡طŒ ع©ظ„غŒط¯ ظ†ط¯ط§ط±غŒظ… -> ظ…ظˆط¯ط§ظ„ ط¨ط§ط² ط´ظˆط¯
openKeyModal();

/* ------------------------------------------------------------
   ع©ظ…ع©â€Œطھط§ط¨ط¹â€Œظ‡ط§
------------------------------------------------------------- */
function uuid() {
  return "id-" + Math.random().toString(36).slice(2) + Date.now();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("ط®ظˆط§ظ†ط¯ظ† ظپط§غŒظ„ ط¨ط§ ط®ط·ط§ ظ…ظˆط§ط¬ظ‡ ط´ط¯"));
    reader.readAsDataURL(file);
  });
}

function extractVideoFrames(file, frameCount = FRAMES_PER_VIDEO) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const frames = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // ط§ع¯ط± ظˆغŒط¯غŒظˆ ط¯ط± ط¨ط§ط²ظ‡â€ŒغŒ ظ…ط¹ظ‚ظˆظ„ ظ„ظˆط¯ ظ†ط´ط¯طŒ ط®ط·ط§ ط¨ط¯ظ‡ طھط§ ط±ط§ط¨ط· ع©ط§ط±ط¨ط±غŒ ع¯غŒط± ظ†ع©ظ†ط¯
    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("ط²ظ…ط§ظ† ظ¾ط±ط¯ط§ط²ط´ ظˆغŒط¯غŒظˆ ط¨ظ‡ ظ¾ط§غŒط§ظ† ط±ط³غŒط¯"));
    }, 20000);

    video.onloadedmetadata = () => {
      if (!isFinite(video.duration) || video.duration <= 0) {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(objectUrl);
        reject(new Error("ظ…ط¯طھâ€Œط²ظ…ط§ظ† ظˆغŒط¯غŒظˆ ظ‚ط§ط¨ظ„ ط®ظˆط§ظ†ط¯ظ† ظ†غŒط³طھ"));
        return;
      }
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const duration = video.duration;
      const timestamps = Array.from(
        { length: frameCount },
        (_, i) => (duration * (i + 1)) / (frameCount + 1)
      );
      let idx = 0;

      const captureNext = () => {
        if (idx >= timestamps.length) {
          clearTimeout(timeoutId);
          URL.revokeObjectURL(objectUrl);
          resolve(frames);
          return;
        }
        video.currentTime = timestamps[idx];
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          frames.push(dataUrl.split(",")[1]);
        } catch (err) {
          // ط§ع¯ط± غŒع© ظپط±غŒظ… ط®ط§طµ ع¯غŒط± ع©ط±ط¯طŒ ط§ط² ط¢ظ† طµط±ظپâ€Œظ†ط¸ط± ع©ظ† ظˆ ط§ط¯ط§ظ…ظ‡ ط¨ط¯ظ‡
        }
        idx += 1;
        captureNext();
      };

      captureNext();
    };

    video.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      reject(new Error("ط®ط·ط§ ط¯ط± ط®ظˆط§ظ†ط¯ظ† ظپط§غŒظ„ ظˆغŒط¯غŒظˆ"));
    };
  });
}

function showTransientStatus(text, isError = false) {
  statusLine.textContent = text;
  statusLine.classList.toggle("error-text", isError);
}

/* ------------------------------------------------------------
   ط¢ظ¾ظ„ظˆط¯ ظپط§غŒظ„
------------------------------------------------------------- */
attachBtn.onclick = () => fileInput.click();

fileInput.onchange = async (e) => {
  const files = Array.from(e.target.files || []);
  e.target.value = ""; // ط§ظ…ع©ط§ظ† ط§ظ†طھط®ط§ط¨ ط¯ظˆط¨ط§ط±ظ‡â€ŒغŒ ظ‡ظ…ط§ظ† ظپط§غŒظ„ ط±ط§ ظ…غŒâ€Œط¯ظ‡ط¯
  if (files.length === 0) return;

  processingFiles = true;
  renderAttachments();

  for (const file of files) {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      showTransientStatus(`ظپط§غŒظ„ آ«${file.name}آ» ط¨ط²ط±ع¯â€Œطھط± ط§ط² ${MAX_FILE_MB} ظ…ع¯ط§ط¨ط§غŒطھ ط§ط³طھ ظˆ ط±ط¯ ط´ط¯.`, true);
      continue;
    }
    try {
      if (file.type.startsWith("image/")) {
        const b64 = await fileToBase64(file);
        attachments.push({
          id: uuid(), kind: "image", name: file.name,
          previewUrl: URL.createObjectURL(file), base64: [b64], mediaType: file.type,
        });
      } else if (file.type === "application/pdf") {
        const b64 = await fileToBase64(file);
        attachments.push({ id: uuid(), kind: "pdf", name: file.name, base64: [b64], mediaType: "application/pdf" });
      } else if (file.type.startsWith("video/")) {
        const frames = await extractVideoFrames(file);
        if (frames.length === 0) throw new Error("ظ‡غŒع† ظپط±غŒظ…غŒ ط§ط² ظˆغŒط¯غŒظˆ ط§ط³طھط®ط±ط§ط¬ ظ†ط´ط¯");
        attachments.push({
          id: uuid(), kind: "video", name: file.name,
          base64: frames, mediaType: "image/jpeg", frameCount: frames.length,
        });
      } else if (file.type.startsWith("audio/")) {
        attachments.push({ id: uuid(), kind: "audio-unsupported", name: file.name });
      } else {
        showTransientStatus(`ظ†ظˆط¹ ظپط§غŒظ„ آ«${file.name}آ» ظ¾ط´طھغŒط¨ط§ظ†غŒ ظ†ظ…غŒâ€Œط´ظˆط¯.`, true);
      }
    } catch (err) {
      console.error("ط®ط·ط§ ط¯ط± ظ¾ط±ط¯ط§ط²ط´ ظپط§غŒظ„:", err);
      showTransientStatus(`ط®ط·ط§ ط¯ط± ظ¾ط±ط¯ط§ط²ط´ آ«${file.name}آ»: ${err.message}`, true);
    }
  }

  processingFiles = false;
  renderAttachments();
  updateSendState();
};

function removeAttachment(id) {
  const att = attachments.find((a) => a.id === id);
  if (att && att.previewUrl) URL.revokeObjectURL(att.previewUrl);
  attachments = attachments.filter((a) => a.id !== id);
  renderAttachments();
  updateSendState();
}

function renderAttachments() {
  attachmentsRow.innerHTML = "";
  attachments.forEach((att) => {
    const chip = document.createElement("div");
    chip.className = "attachment-chip";

    if (att.kind === "image") {
      const img = document.createElement("img");
      img.src = att.previewUrl;
      img.alt = att.name;
      chip.appendChild(img);
    }

    const label = document.createElement("span");
    let text = att.name;
    if (att.kind === "video") text += ` (${att.frameCount} ظپط±غŒظ…)`;
    if (att.kind === "audio-unsupported") text += " â€” طµط¯ط§ ظ¾ط´طھغŒط¨ط§ظ†غŒ ظ†ظ…غŒâ€Œط´ظˆط¯";
    label.textContent = text;
    chip.appendChild(label);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "âœ•";
    removeBtn.setAttribute("aria-label", "ط­ط°ظپ ظ¾غŒظˆط³طھ");
    removeBtn.onclick = () => removeAttachment(att.id);
    chip.appendChild(removeBtn);

    attachmentsRow.appendChild(chip);
  });

  if (processingFiles) {
    const chip = document.createElement("div");
    chip.className = "attachment-chip";
    chip.textContent = "ط¯ط± ط­ط§ظ„ ظ¾ط±ط¯ط§ط²ط´ ظپط§غŒظ„...";
    attachmentsRow.appendChild(chip);
  }
}

/* ------------------------------------------------------------
   ظˆط±ظˆط¯غŒ ظ…طھظ† ظˆ ط§ط±ط³ط§ظ„ ظ¾غŒط§ظ…
------------------------------------------------------------- */
textInput.addEventListener("input", () => {
  textInput.style.height = "auto";
  textInput.style.height = Math.min(textInput.scrollHeight, 160) + "px";
  updateSendState();
});

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.onclick = sendMessage;

function updateSendState() {
  const hasContent = textInput.value.trim().length > 0 || attachments.length > 0;
  sendBtn.disabled = !hasContent || loading;
  sendBtn.classList.toggle("active", hasContent && !loading);
}

async function sendMessage() {
  if (!apiKey) {
    openKeyModal();
    return;
  }

  const text = textInput.value.trim();
  if ((!text && attachments.length === 0) || loading) return;

  const contentBlocks = [];
  attachments.forEach((att) => {
    if (att.kind === "image" || att.kind === "video") {
      att.base64.forEach((b64) => {
        contentBlocks.push({ type: "image", source: { type: "base64", media_type: att.mediaType, data: b64 } });
      });
    } else if (att.kind === "pdf") {
      contentBlocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: att.base64[0] } });
    }
  });
  if (text) contentBlocks.push({ type: "text", text });

  const summary = attachments
    .map((a) => {
      if (a.kind === "video") return `ًںژ¬ ${a.name} (${a.frameCount} ظپط±غŒظ… ط§ط³طھط®ط±ط§ط¬ ط´ط¯)`;
      if (a.kind === "audio-unsupported") return `ًں”‡ ${a.name} (طµط¯ط§ ظ¾ط´طھغŒط¨ط§ظ†غŒ ظ†ظ…غŒâ€Œط´ظˆط¯)`;
      if (a.kind === "pdf") return `ًں“„ ${a.name}`;
      return `ًں–¼ï¸ڈ ${a.name}`;
    })
    .join("\n");

  const apiContent = contentBlocks.length > 0 ? contentBlocks : text;

  messages.push({ role: "user", content: text, apiContent, attachmentSummary: summary || null });

  textInput.value = "";
  textInput.style.height = "auto";
  attachments.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
  attachments = [];
  renderAttachments();
  loading = true;
  updateSendState();
  renderMessages();

  try {
    const apiMessages = messages.map((m) => ({
      role: m.role,
      content: m.apiContent !== undefined ? m.apiContent : m.content,
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: apiMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `ط®ط·ط§غŒ HTTP ${response.status}`;
      if (response.status === 401) {
        messages.push({ role: "assistant", content: "ع©ظ„غŒط¯ API ظ†ط§ظ…ط¹طھط¨ط± ط§ط³طھ. ظ„ط·ظپط§ظ‹ ط§ط² ظ…ظ†ظˆغŒ طھظ†ط¸غŒظ…ط§طھطŒ ع©ظ„غŒط¯ طµط­غŒط­ ط±ط§ ظˆط§ط±ط¯ ع©ظ†.", isError: true });
        apiKey = null;
      } else {
        messages.push({ role: "assistant", content: `ط®ط·ط§: ${errMsg}`, isError: true });
      }
    } else {
      const reply = data?.content?.find((b) => b.type === "text")?.text || "ظ¾ط§ط³ط®غŒ ط¯ط±غŒط§ظپطھ ظ†ط´ط¯.";
      messages.push({ role: "assistant", content: reply });
    }
  } catch (err) {
    console.error(err);
    messages.push({ role: "assistant", content: "ط§طھطµط§ظ„ ط¨ط±ظ‚ط±ط§ط± ظ†ط´ط¯. ط§طھطµط§ظ„ ط§غŒظ†طھط±ظ†طھ ط±ط§ ط¨ط±ط±ط³غŒ ع©ظ† ظˆ ط¯ظˆط¨ط§ط±ظ‡ ط§ظ…طھط­ط§ظ† ع©ظ†.", isError: true });
  } finally {
    loading = false;
    updateSendState();
    renderMessages();
  }
}

/* ------------------------------------------------------------
   ط±ظ†ط¯ط± ظ¾غŒط§ظ…â€Œظ‡ط§
------------------------------------------------------------- */
function renderMessages() {
  if (messages.length === 0) {
    emptyStateEl.style.display = "flex";
    const list = messagesEl.querySelector(".msg-list");
    if (list) list.remove();
    updateSidebar();
    return;
  }

  emptyStateEl.style.display = "none";
  let list = messagesEl.querySelector(".msg-list");
  if (!list) {
    list = document.createElement("div");
    list.className = "msg-list";
    messagesEl.appendChild(list);
  }
  list.innerHTML = "";

  messages.forEach((m) => {
    const row = document.createElement("div");
    row.className = "msg-row " + m.role;

    const avatar = document.createElement("div");
    avatar.className = "avatar " + m.role;
    avatar.textContent = m.role === "user" ? "ط´ظ…ط§" : "ظ­";
    row.appendChild(avatar);

    const body = document.createElement("div");
    body.className = "msg-body";
    if (m.isError) body.classList.add("error-text");

    if (m.attachmentSummary) {
      const summary = document.createElement("div");
      summary.className = "attachment-summary";
      summary.textContent = m.attachmentSummary;
      body.appendChild(summary);
    }

    if (m.content) {
      const textDiv = document.createElement("div");
      textDiv.textContent = m.content;
      body.appendChild(textDiv);
    }

    row.appendChild(body);
    list.appendChild(row);
  });

  if (loading) {
    const row = document.createElement("div");
    row.className = "msg-row assistant";
    row.innerHTML = `
      <div class="avatar assistant">ظ­</div>
      <div class="typing"><span></span><span></span><span></span></div>
    `;
    list.appendChild(row);
  }

  updateSidebar();
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function updateSidebar() {
  sidebarList.innerHTML = "";
  const firstUserMsg = messages.find((m) => m.role === "user");
  if (firstUserMsg) {
    const item = document.createElement("div");
    item.className = "sidebar-item active";
    item.textContent = (firstUserMsg.content || firstUserMsg.attachmentSummary || "ظ¾غŒظˆط³طھ").slice(0, 30);
    sidebarList.appendChild(item);
  }
}

/* ------------------------------------------------------------
   ط³ط§غŒط¯ط¨ط§ط± / ع¯ظپطھع¯ظˆغŒ طھط§ط²ظ‡
------------------------------------------------------------- */
menuBtn.onclick = () => sidebar.classList.toggle("collapsed");

newChatBtn.onclick = () => {
  attachments.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
  messages = [];
  attachments = [];
  renderAttachments();
  renderMessages();
  updateSendState();
};

/* ------------------------------------------------------------
   ط´ط±ظˆط¹ ط§ظˆظ„غŒظ‡
------------------------------------------------------------- */
renderMessages();
updateSendState();