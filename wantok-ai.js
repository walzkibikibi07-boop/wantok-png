(function () {
  "use strict";
  if (window.__WANTOK_AI_WIDGET__) return;
  window.__WANTOK_AI_WIDGET__ = true;

  var SB_URL = "https://rpcekiqhvsmzjmjimnsj.supabase.co";
  var SB_KEY = "sb_publishable_bmR_OLpVkON13vH-uTCkRg_GGH8jllW";
  var client = null;
  var history = [];
  var busy = false;
  var mode = "general";
  var language = "tpi";

  function el(tag, attrs, content) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") node.className = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    if (content != null) node.textContent = content;
    return node;
  }
  function addStyles() {
    var css = [
      "#wantok-ai-launch{position:fixed;right:14px;bottom:104px;z-index:99980;background:#0d1b2e;color:#f5b800;border:2px solid #f5b800;border-radius:28px;padding:12px 16px;font-weight:900;font-size:14px;box-shadow:0 5px 18px #0004}",
      "#wantok-ai-panel{position:fixed;right:10px;bottom:164px;z-index:99990;width:min(390px,calc(100vw - 20px));height:min(590px,calc(100dvh - 190px));min-height:350px;background:#fff;border-radius:18px;box-shadow:0 12px 45px #0005;display:none;overflow:hidden;font:14px Arial,sans-serif;color:#172033}",
      "#wantok-ai-panel.open{display:flex;flex-direction:column}",
      "#wantok-ai-head{background:#0d1b2e;color:#fff;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px}",
      "#wantok-ai-head strong{font-size:16px;color:#f5b800}",
      "#wantok-ai-close{color:#fff;font-size:23px;padding:0 5px}",
      "#wantok-ai-controls{display:flex;gap:7px;padding:9px 10px;background:#f3f6fa}",
      "#wantok-ai-controls select{min-width:0;flex:1;border:1px solid #d5dce5;border-radius:9px;padding:8px;background:#fff;color:#172033;font-size:13px}",
      "#wantok-ai-messages{flex:1;overflow:auto;padding:12px;background:#f8fafc;display:flex;flex-direction:column;gap:9px}",
      ".wantok-ai-msg{max-width:88%;padding:10px 12px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.45}",
      ".wantok-ai-msg.user{align-self:flex-end;background:#0d1b2e;color:#fff;border-bottom-right-radius:4px}",
      ".wantok-ai-msg.assistant{align-self:flex-start;background:#e9eff6;color:#172033;border-bottom-left-radius:4px}",
      "#wantok-ai-compose{display:flex;gap:7px;padding:10px;border-top:1px solid #e4e8ee;background:#fff}",
      "#wantok-ai-input{flex:1;min-width:0;resize:none;border:1px solid #d5dce5;border-radius:12px;padding:10px;font:14px Arial,sans-serif;max-height:100px}",
      "#wantok-ai-send{background:#1f9d4a;color:#fff;border-radius:12px;padding:0 15px;font-weight:800}",
      "#wantok-ai-send:disabled{opacity:.55}",
      "#wantok-ai-foot{font-size:10px;color:#697586;padding:0 12px 8px;background:#fff}",
      "@media(max-width:480px){#wantok-ai-panel{right:7px;bottom:155px;width:calc(100vw - 14px);height:calc(100dvh - 180px);max-height:620px}#wantok-ai-launch{bottom:94px}}"
    ].join("");
    var style = el("style", { id: "wantok-ai-style" }, css);
    document.head.appendChild(style);
  }
  function appendMessage(role, text) {
    var area = document.getElementById("wantok-ai-messages");
    var bubble = el("div", { className: "wantok-ai-msg " + role }, text);
    area.appendChild(bubble);
    area.scrollTop = area.scrollHeight;
  }
  function setBusy(value) {
    busy = value;
    var button = document.getElementById("wantok-ai-send");
    var input = document.getElementById("wantok-ai-input");
    if (button) { button.disabled = value; button.textContent = value ? "..." : "Send"; }
    if (input) input.disabled = value;
  }
  function show() {
    document.getElementById("wantok-ai-panel").classList.add("open");
    document.getElementById("wantok-ai-input").focus();
  }
  function hide() {
    document.getElementById("wantok-ai-panel").classList.remove("open");
  }
  async function send() {
    var input = document.getElementById("wantok-ai-input");
    var text = input.value.trim();
    if (!text || busy) return;
    if (!client) {
      appendMessage("assistant", "AI service could not start. Please refresh WANTOK PNG and try again.");
      return;
    }
    var sessionResult = await client.auth.getSession();
    if (!sessionResult.data || !sessionResult.data.session) {
      appendMessage("assistant", "Please sign in to your WANTOK PNG account before using WANTOK AI.");
      return;
    }
    input.value = "";
    history.push({ role: "user", content: text });
    appendMessage("user", text);
    setBusy(true);
    var wait = el("div", { className: "wantok-ai-msg assistant", id: "wantok-ai-wait" }, "WANTOK AI is thinking...");
    document.getElementById("wantok-ai-messages").appendChild(wait);
    try {
      var result = await client.functions.invoke("wantok-chat", {
        body: { mode: mode, language: language, messages: history.slice(-12) }
      });
      var waitNode = document.getElementById("wantok-ai-wait");
      if (waitNode) waitNode.remove();
      if (result.error) {
        var message = result.data && result.data.error ? result.data.error : "AI connection failed. Please try again.";
        if (result.error.context && result.error.context.json) {
          try { var detail = await result.error.context.json(); if (detail.error) message = detail.error; } catch (_) {}
        }
        appendMessage("assistant", message);
      } else {
        var answer = result.data && result.data.reply ? result.data.reply : "No answer received. Please try again.";
        history.push({ role: "assistant", content: answer });
        appendMessage("assistant", answer);
      }
    } catch (error) {
      var pending = document.getElementById("wantok-ai-wait");
      if (pending) pending.remove();
      appendMessage("assistant", "Connection problem. Check your internet and try again.");
    } finally {
      setBusy(false);
      input.focus();
    }
  }
  function mount() {
    if (!document.body || document.getElementById("wantok-ai-launch")) return;
    addStyles();
    var launch = el("button", { id: "wantok-ai-launch", type: "button" }, "✨ WANTOK AI");
    launch.addEventListener("click", show);
    document.body.appendChild(launch);

    var panel = el("section", { id: "wantok-ai-panel", "aria-label": "WANTOK AI assistant" });
    var head = el("div", { id: "wantok-ai-head" });
    var heading = el("div");
    heading.appendChild(el("strong", {}, "🇵🇬 WANTOK AI"));
    heading.appendChild(el("div", {}, "Your PNG digital assistant"));
    head.appendChild(heading);
    var close = el("button", { id: "wantok-ai-close", type: "button", "aria-label": "Close" }, "×");
    close.addEventListener("click", hide);
    head.appendChild(close);
    panel.appendChild(head);

    var controls = el("div", { id: "wantok-ai-controls" });
    var modeSelect = el("select", { "aria-label": "AI topic" });
    [
      ["general", "All WANTOK PNG"],
      ["community", "Community"],
      ["business", "Business Connect"],
      ["market", "Market"],
      ["jobs", "Work & Jobs"],
      ["talent", "Talent"],
      ["government", "Government Connect"],
      ["safety", "Community Safety"],
      ["media", "Media Studio"]
    ].forEach(function (item) {
      var option = el("option", { value: item[0] }, item[1]);
      modeSelect.appendChild(option);
    });
    modeSelect.value = mode;
    modeSelect.addEventListener("change", function () { mode = modeSelect.value; });
    var langSelect = el("select", { "aria-label": "Reply language" });
    [["tpi", "Tok Pisin"], ["en", "English"], ["auto", "Auto language"]].forEach(function (item) {
      langSelect.appendChild(el("option", { value: item[0] }, item[1]));
    });
    langSelect.value = language;
    langSelect.addEventListener("change", function () { language = langSelect.value; });
    controls.appendChild(modeSelect);
    controls.appendChild(langSelect);
    panel.appendChild(controls);

    var messages = el("div", { id: "wantok-ai-messages" });
    messages.appendChild(el("div", { className: "wantok-ai-msg assistant" }, "Halo wantok! Mi stap hia bilong helpim yu long Market, Work, Business, Talent, Wantok na Government Connect. Askim mi long Tok Pisin o English."));
    panel.appendChild(messages);

    var compose = el("div", { id: "wantok-ai-compose" });
    var input = el("textarea", { id: "wantok-ai-input", rows: "1", placeholder: "Ask WANTOK AI..." });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); }
    });
    var sendButton = el("button", { id: "wantok-ai-send", type: "button" }, "Send");
    sendButton.addEventListener("click", send);
    compose.appendChild(input);
    compose.appendChild(sendButton);
    panel.appendChild(compose);
    panel.appendChild(el("div", { id: "wantok-ai-foot" }, "AI answers can be wrong. Confirm official information with the responsible office."));
    document.body.appendChild(panel);

    if (window.supabase && window.supabase.createClient) {
      client = window.supabase.createClient(SB_URL, SB_KEY);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();