/* ScamCall Shield - output sanitization helpers.
 * Security rule (Dev Guide 12.1): never render untrusted text via innerHTML.
 * All user-derived content goes through textContent. el() builds DOM nodes
 * programmatically; string children become text nodes, never markup.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /** el("div", {class:"x", onClick:fn, dataset:{k:v}, attrs...}, child1, "text", [more]) */
  function el(tag, props) {
    var node = document.createElement(tag);
    props = props || {};
    for (var k in props) {
      var v = props[k];
      if (v == null) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;            // ONLY for trusted i18n strings
      else if (k === "dataset") { for (var d in v) node.dataset[d] = v[d]; }
      else if (k === "style" && typeof v === "object") { for (var s in v) node.style[s] = v[s]; }
      else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) appendChild(node, arguments[i]);
    return node;
  }

  function appendChild(node, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) { for (var i = 0; i < child.length; i++) appendChild(node, child[i]); return; }
    if (typeof child === "string" || typeof child === "number") {
      node.appendChild(document.createTextNode(String(child)));
    } else { node.appendChild(child); }
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  g.SCS.dom = { esc: esc, el: el, clear: clear };
})(typeof window !== "undefined" ? window : globalThis);
