const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const stylesDir = path.join(srcDir, 'styles');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 样式文件合并列表（保持优先级顺序）
const styleFiles = [
  'variables.css',
  'global.css',
  'header.css',
  'sidebar.css',
  'topic-list.css',
  'topic-detail.css',
  'composer.css',
  'modal-menu.css'
];

let combinedCSS = '';
for (const file of styleFiles) {
  const filePath = path.join(stylesDir, file);
  if (fs.existsSync(filePath)) {
    combinedCSS += `\n/* --- ${file} --- */\n` + fs.readFileSync(filePath, 'utf8');
  }
}

// 读取 JS 逻辑
const disguiseJS = fs.readFileSync(path.join(srcDir, 'core', 'disguise.js'), 'utf8');

// 油猴脚本元数据头
const userscriptHeader = `// ==UserScript==
// @name         LINUX DO 伪装腾讯文档 (Docs QQ Theme)
// @namespace    https://linux.do/
// @version      1.0.0
// @description  将 LINUX DO 论坛界面深度伪装为腾讯文档工作台与在线文档风格，支持 Favicon/Title 劫持、文档列表转换、Word 视图与 Alt+Q 快速切换
// @author       Antigravity
// @match        https://linux.do/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // 注入 CSS 样式
  const css = ${JSON.stringify(combinedCSS)};
  let styleEl = null;

  if (typeof GM_addStyle !== 'undefined') {
    styleEl = GM_addStyle(css);
  } else {
    styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    styleEl.innerHTML = css;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  // 核心逻辑执行
  ${disguiseJS}

  // DOM 就绪时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DisguiseEngine.init(styleEl));
  } else {
    DisguiseEngine.init(styleEl);
  }
})();
`;

// 输出到 dist/docs.qq.theme.user.js 和本主题根目录 docs.qq.theme.user.js
const outputFileName = 'docs.qq.theme.user.js';
fs.writeFileSync(path.join(distDir, outputFileName), userscriptHeader, 'utf8');
fs.writeFileSync(path.join(__dirname, outputFileName), userscriptHeader, 'utf8');

console.log('✅ 构建成功！已生成:');
console.log(' - ' + path.join(distDir, outputFileName));
console.log(' - ' + path.join(__dirname, outputFileName));
