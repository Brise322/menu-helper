// bundle.js — 把 widget.css、widget-app.js 内联进 widget.html，得到单文件组件

const STYLE_TAG = '<link rel="stylesheet" href="widget.css">';
const SCRIPT_TAG = '<script type="module" src="widget-app.js"></script>';

/**
 * @param {string} html widget.html 内容
 * @param {string} css  widget.css 内容
 * @param {string} js   widget-app.js 内容
 * @returns {string} 内联后的 HTML
 */
export function bundleWidget(html, css, js) {
  if (!html.includes(STYLE_TAG) || !html.includes(SCRIPT_TAG)) {
    throw new Error("widget.html 缺少 widget.css 或 widget-app.js 的引用");
  }
  return html
    .replace(STYLE_TAG, () => `<style>\n${css}</style>`)
    .replace(SCRIPT_TAG, () => `<script type="module">\n${js}</script>`);
}
