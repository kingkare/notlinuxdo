const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const stylesDir = path.join(srcDir, 'styles');
const distDir = path.join(__dirname, 'dist');
const styleFiles = ['variables.css', 'global.css', 'header.css', 'topic-list.css', 'topic-detail.css'];
const OCTICON_NAMES = [
  'mark-github', 'three-bars', 'search', 'copilot', 'plus', 'issue-opened',
  'git-pull-request', 'repo', 'code', 'comment-discussion', 'people',
  'chevron-down', 'bookmark', 'kebab-horizontal', 'star', 'git-branch',
  'eye', 'play', 'table', 'shield', 'graph', 'file', 'history',
  'link', 'book', 'law', 'pulse', 'gear', 'bell', 'inbox', 'package', 'file-directory',
  'arrow-right', 'x', 'image', 'smiley'
];

fs.mkdirSync(distDir, { recursive: true });

const css = styleFiles.map((file) => {
  const filePath = path.join(stylesDir, file);
  if (!fs.existsSync(filePath)) throw new Error(`Missing stylesheet: ${filePath}`);
  return `\n/* --- ${file} --- */\n${fs.readFileSync(filePath, 'utf8')}`;
}).join('');
const core = fs.readFileSync(path.join(srcDir, 'core', 'disguise.js'), 'utf8');
const octicons = require('@primer/octicons');
const iconData = Object.fromEntries(OCTICON_NAMES.map((name) => {
  const source = octicons[name];
  if (!source) throw new Error(`Missing official Octicon: ${name}`);
  const size = name === 'mark-github' && source.heights['24'] ? 24 : (source.heights['16'] ? 16 : Number(Object.keys(source.heights)[0]));
  const variant = source.heights[String(size)];
  return [name, { viewBox: `0 0 ${variant.width} ${size}`, path: variant.path }];
}));
const officialAssets = `const GITHUB_OCTICONS = Object.freeze(${JSON.stringify(iconData)});`;

const output = `// ==UserScript==
// @name         LINUX DO 伪装 GitHub (GitHub Theme)
// @namespace    https://linux.do/
// @version      1.0.0
// @description  将 LINUX DO 首页伪装为 GitHub 仓库搜索页，将帖子伪装为仓库 README 页面
// @author       Antigravity
// @match        https://linux.do/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  const css = ${JSON.stringify(css)};
  if (typeof GM_addStyle === 'function') GM_addStyle(css);
  else {
    const style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // Official GitHub Octicons v${require('@primer/octicons/package.json').version} (MIT), embedded at build time.
  ${officialAssets}

  ${core}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GitHubDisguise.init(), { once: true });
  } else GitHubDisguise.init();
})();
`;

const fileName = 'github.theme.user.js';
fs.writeFileSync(path.join(distDir, fileName), output, 'utf8');
fs.writeFileSync(path.join(__dirname, fileName), output, 'utf8');
console.log('GitHub theme built:');
console.log(` - ${path.join(distDir, fileName)}`);
console.log(` - ${path.join(__dirname, fileName)}`);
