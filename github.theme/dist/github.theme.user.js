// ==UserScript==
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
  const css = "\n/* --- variables.css --- */\n:root {\n  --gh-canvas: #ffffff;\n  --gh-subtle: #f6f8fa;\n  --gh-inset: #f6f8fa;\n  --gh-border: #d1d9e0;\n  --gh-border-muted: #d8dee4;\n  --gh-fg: #1f2328;\n  --gh-muted: #59636e;\n  --gh-link: #0969da;\n  --gh-accent: #1f883d;\n  --gh-header: #f6f8fa;\n  --gh-danger: #cf222e;\n  --gh-radius: 6px;\n  --gh-shadow: 0 1px 0 rgba(31, 35, 40, .04);\n  --gh-font: \"Mona Sans\", \"Mona Sans VF\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Noto Sans\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\";\n}\n\n/* --- global.css --- */\nhtml, body { margin: 0 !important; color: var(--gh-fg) !important; background: var(--gh-canvas) !important; font-family: var(--gh-font) !important; font-size: 14px !important; line-height: 1.5 !important; }\nbody.github-disguise { padding-top: 64px !important; }\nbody.github-disguise.gh-page-topic { padding-top: 100px !important; }\nbody.github-disguise a { color: var(--gh-link); }\nbody.github-disguise .d-header,\nbody.github-disguise .sidebar-wrapper,\nbody.github-disguise .header-sidebar-toggle,\nbody.github-disguise .welcome-banner,\nbody.github-disguise .custom-search-banner-wrap,\nbody.github-disguise .global-notice,\nbody.github-disguise .top-notices,\nbody.github-disguise .alert.alert-info { display: none !important; }\n/* Hide pre-2.0 shells when upgrading while the old script is still enabled. */\nbody.github-disguise .gh-global-header,\nbody.github-disguise .gh-search-shell,\nbody.github-disguise .gh-repo-header,\nbody.github-disguise .gh-code-toolbar:not(.gh-repo-toolbar),\nbody.github-disguise .gh-file-table:not(.gh-official-file-table) { display: none !important; }\nbody.github-disguise #main-outlet-wrapper { display: block !important; width: 100% !important; max-width: none !important; padding: 0 !important; }\nbody.github-disguise #main-outlet { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; box-sizing: border-box !important; }\nbody.github-disguise button, body.github-disguise input, body.github-disguise textarea { font-family: var(--gh-font) !important; }\n.gh-octicon { display: inline-block; flex: 0 0 auto; overflow: visible; fill: currentColor; vertical-align: text-bottom; }\n.gh-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 32px; padding: 5px 12px; border: 1px solid var(--gh-border); border-radius: 6px; color: var(--gh-fg) !important; background: var(--gh-subtle); box-shadow: 0 1px 0 rgba(31,35,40,.04), inset 0 1px 0 rgba(255,255,255,.25); font-size: 14px; font-weight: 500; line-height: 20px; text-decoration: none !important; white-space: nowrap; box-sizing: border-box; cursor: pointer; }\n.gh-btn:hover { background: #eff2f5; }\n.gh-btn-primary { color: #fff !important; background: var(--gh-accent); border-color: rgba(31,35,40,.15); }\n.gh-btn-primary:hover { background: #1a7f37; }\n.gh-counter { display: inline-flex; min-width: 20px; height: 20px; align-items: center; justify-content: center; padding: 0 6px; border-radius: 2em; background: #e8eaed; color: var(--gh-fg); font-size: 12px; font-weight: 500; box-sizing: border-box; }\n.gh-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }\n@media (max-width: 767px) { body.github-disguise, body.github-disguise.gh-page-topic { padding-top: 56px !important; } }\n\n/* --- header.css --- */\n.gh-app-header { position: fixed; z-index: 1200; top: 0; right: 0; left: 0; color: var(--gh-fg); background: var(--gh-header); border-bottom: 1px solid var(--gh-border); box-sizing: border-box; }\n.gh-app-header-top { display: grid; grid-template-columns: auto minmax(180px, 1fr) auto; align-items: center; gap: 8px; height: 64px; padding: 12px 16px; box-sizing: border-box; }\nbody.gh-page-topic .gh-app-header-top { grid-template-columns: minmax(320px, 1fr) minmax(180px, 250px) auto; height: 52px; padding-top: 8px; padding-bottom: 8px; }\n.gh-header-left, .gh-header-right { display: flex; align-items: center; min-width: 0; gap: 8px; }\n.gh-header-right { justify-content: flex-end; }\n.gh-icon-button { display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; padding: 0; border: 1px solid var(--gh-border); border-radius: 6px; color: var(--gh-fg) !important; background: transparent; text-decoration: none !important; box-sizing: border-box; }\n.gh-icon-button:hover { background: rgba(208,215,222,.32); }\n.gh-home-link { border-color: transparent; }\n.gh-home-link .gh-octicon { width: 32px; height: 32px; }\n.gh-header-search { display: flex; align-items: center; justify-self: stretch; min-width: 0; height: 32px; border: 1px solid var(--gh-border); border-radius: 6px; color: var(--gh-muted); background: var(--gh-canvas); box-shadow: var(--gh-shadow); box-sizing: border-box; }\n.gh-header-search .gh-octicon { margin-left: 10px; }\n.gh-header-search input { flex: 1; min-width: 0; height: 30px; padding: 5px 8px !important; border: 0 !important; outline: 0 !important; color: var(--gh-fg) !important; background: transparent !important; box-shadow: none !important; font-size: 14px !important; }\n.gh-search-key { display: inline-grid; width: 18px; height: 20px; margin-right: 6px; place-items: center; border: 1px solid var(--gh-border); border-radius: 4px; color: var(--gh-muted); font-size: 12px; }\n.gh-header-separator { width: 1px; height: 20px; margin: 0 4px; background: var(--gh-border); }\n.gh-header-avatar { display: block; width: 32px; height: 32px; border-radius: 50%; }\n.gh-breadcrumbs { display: flex; min-width: 0; align-items: center; gap: 8px; margin-left: 4px; font-size: 14px; font-weight: 600; white-space: nowrap; }\n.gh-breadcrumbs a { overflow: hidden; color: var(--gh-fg) !important; text-decoration: none; text-overflow: ellipsis; }\n.gh-repo-nav { display: flex; height: 48px; align-items: flex-end; overflow-x: auto; padding: 8px 16px 0; box-sizing: border-box; }\n.gh-repo-nav-list { display: flex; height: 40px; align-items: stretch; gap: 4px; margin: 0; padding: 0; list-style: none; }\n.gh-repo-nav a { display: inline-flex; height: 40px; align-items: center; gap: 8px; padding: 0 8px; border-bottom: 2px solid transparent; color: var(--gh-fg) !important; font-size: 14px; text-decoration: none !important; white-space: nowrap; box-sizing: border-box; }\n.gh-repo-nav a:hover { background: rgba(208,215,222,.32); border-radius: 6px 6px 0 0; }\n.gh-repo-nav a.is-active { border-bottom-color: #fd8c73; font-weight: 600; }\n@media (max-width: 900px) { .gh-app-header-top, body.gh-page-topic .gh-app-header-top { grid-template-columns: auto minmax(120px, 1fr) auto; } .gh-header-right .gh-icon-button:nth-of-type(-n+3), .gh-header-separator { display: none; } .gh-breadcrumbs { max-width: 180px; } }\n@media (max-width: 767px) { .gh-app-header-top, body.gh-page-topic .gh-app-header-top { height: 56px; padding: 10px 12px; } body.gh-page-topic .gh-repo-nav { display: none; } .gh-header-search { margin-left: 4px; } .gh-home-link { display: none; } .gh-breadcrumbs { max-width: 140px; } }\n\n/* --- topic-list.css --- */\nbody.gh-page-list #main-outlet { min-height: calc(100vh - 64px) !important; }\n.gh-search-layout { display: grid; grid-template-columns: 296px minmax(520px, 804px) minmax(280px, 352px); gap: 16px 24px; width: 100%; align-items: start; }\n.gh-search-pane { position: sticky; top: 64px; height: calc(100vh - 64px); overflow: auto; border-right: 1px solid var(--gh-border); background: var(--gh-canvas); box-sizing: border-box; scrollbar-width: thin; }\n.gh-search-pane h2 { margin: 0; padding: 17px 16px 16px; font-size: 16px; font-weight: 400; line-height: 24px; }\n.gh-filter-section { padding: 0 16px 12px; border-bottom: 1px solid var(--gh-border-muted); }\n.gh-filter-section + .gh-filter-section { padding-top: 12px; }\n.gh-filter-section h3 { margin: 0 0 8px; padding: 0 8px; color: var(--gh-muted); font-size: 12px; font-weight: 600; }\n.gh-filter-list { margin: 0; padding: 0; list-style: none; }\n.gh-filter-list a { position: relative; display: flex; min-height: 32px; align-items: center; justify-content: flex-start !important; gap: 8px; padding: 5px 8px; border-radius: 6px; color: var(--gh-fg) !important; font-size: 14px; line-height: 21px; text-decoration: none !important; box-sizing: border-box; }\n.gh-filter-list a:hover { background: rgba(208,215,222,.32); }\n.gh-filter-list a.is-active { background: #e8eaed; }\n.gh-filter-list a.is-active::before { position: absolute; top: 6px; bottom: 6px; left: -8px; width: 4px; border-radius: 6px; background: #0969da; content: ''; }\n.gh-filter-count { margin-left: auto; padding: 0 6px; border-radius: 2em; background: #e8eaed; color: var(--gh-muted); font-size: 12px; }\n.gh-language-dot { display: inline-block; width: 10px; height: 10px; border: 1px solid rgba(31,35,40,.1); border-radius: 50%; box-sizing: border-box; }\n.gh-search-results { min-width: 0; padding-top: 0; }\n.gh-results-toolbar { display: flex; min-height: 44px; align-items: center; gap: 8px; padding: 0; }\n.gh-results-toolbar h1 { flex: 1; margin: 0; font-size: 20px; font-weight: 600; line-height: 30px; }\n.gh-results-time { margin-left: 3px; color: var(--gh-muted); font-size: 12px; font-weight: 400; }\n.gh-toolbar-kebab { width: 32px; padding: 0; }\nbody.gh-page-list .list-controls,\nbody.gh-page-list .navigation-container,\nbody.gh-page-list .category-breadcrumb,\nbody.gh-page-list .topic-list thead { display: none !important; }\nbody.gh-page-list .topic-list, body.gh-page-list .topic-list tbody { display: grid !important; width: 100% !important; gap: 16px !important; }\nbody.gh-page-list .gh-topic-list-clone { margin-top: 16px !important; }\nbody.gh-page-list .gh-topic-list-source { display: none !important; }\nbody.gh-page-list .topic-list-item { position: relative; display: block !important; min-height: 142px; padding: 16px !important; border: 1px solid var(--gh-border) !important; border-radius: 6px !important; background: var(--gh-canvas) !important; box-sizing: border-box; }\nbody.gh-page-list .topic-list-item:hover { background: var(--gh-canvas) !important; }\nbody.gh-page-list .topic-list-item > td { display: none !important; }\nbody.gh-page-list .topic-list-item > td.main-link, body.gh-page-list .topic-list-item > td:first-child { display: block !important; width: auto !important; padding: 0 !important; border: 0 !important; }\n.gh-result-heading { display: flex; min-width: 0; height: 24px; align-items: flex-start; gap: 10px; padding-right: 82px; }\n.gh-repo-avatar { position: static !important; top: auto !important; left: auto !important; display: block; flex: 0 0 20px; width: 20px !important; height: 20px !important; margin-top: 2px; border-radius: 4px; }\nbody.gh-page-list .topic-list-item > .gh-repo-avatar { display: none !important; }\nbody.gh-page-list .topic-list-item .main-link a.title, body.gh-page-list .topic-list-item .main-link a.raw-link { display: inline !important; min-width: 0; color: var(--gh-link) !important; font-size: 16px !important; font-weight: 500 !important; line-height: 24px !important; text-decoration: none !important; }\nbody.gh-page-list .topic-list-item .main-link a.title:hover, body.gh-page-list .topic-list-item .main-link a.raw-link:hover { text-decoration: underline !important; }\n.gh-repo-prefix { font-weight: 500; }\n.gh-real-title { display: none !important; }\nbody.gh-page-list .topic-list-item .topic-statuses, body.gh-page-list .topic-list-item .link-bottom-line, body.gh-page-list .topic-list-item .topic-excerpt { display: none !important; }\n.gh-result-star { position: absolute; top: 16px; right: 16px; min-width: 58px; }\n.gh-real-title-line { overflow: hidden; max-width: 650px; margin: 4px 0 0; color: var(--gh-fg); font-family: system-ui, sans-serif !important; font-size: 14px; font-weight: 400; line-height: 21px; text-overflow: ellipsis; white-space: nowrap; }\n.gh-real-title-line .topic-post-badges { position: static !important; display: inline-flex !important; align-items: center; margin: 0 0 0 4px !important; vertical-align: middle; white-space: nowrap; }\n.gh-real-title-line .topic-post-badges .badge { position: static !important; display: inline-block !important; float: none !important; margin: 0 !important; vertical-align: middle; }\n.gh-repo-description { overflow: hidden; max-width: 650px; margin: 4px 0 0; color: var(--gh-fg); font-size: 14px; line-height: 21px; text-overflow: ellipsis; white-space: nowrap; }\n.gh-topic-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; }\n.gh-topic-chip { padding: 1px 10px; border-radius: 2em; color: var(--gh-link); background: #ddf4ff; font-size: 12px; font-weight: 500; line-height: 20px; }\n.gh-repo-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; margin: 4px 0 0; color: var(--gh-muted); font-size: 12px; line-height: 21px; }\n.gh-repo-meta > span { display: inline-flex; align-items: center; gap: 4px; }\n.gh-meta-dot { color: #818b98; }\n.gh-search-aside { padding: 60px 16px 0 0; }\n.gh-sponsor-card { padding: 24px 16px; border: 1px solid var(--gh-border); border-radius: 6px; }\n.gh-sponsor-emoji { font-size: 38px; line-height: 1; }\n.gh-sponsor-card h2 { margin: 10px 0 8px; font-size: 16px; font-weight: 500; line-height: 24px; }\n.gh-sponsor-card p { margin: 0 0 16px; color: var(--gh-muted); font-size: 14px; }\n.gh-sponsor-card a { font-weight: 500; text-decoration: none; }\n.gh-feedback-card { margin-top: 16px; padding: 9px 16px; border: 1px solid var(--gh-border); border-radius: 6px; }\n.gh-search-tip { margin-top: 12px; color: var(--gh-muted); }\n.gh-search-tip strong { color: #9a6700; font-weight: 500; }\n@media (max-width: 1180px) { .gh-search-layout { grid-template-columns: 270px minmax(0, 1fr); } .gh-search-aside { display: none; } }\n@media (max-width: 767px) { .gh-search-layout { display: block; } .gh-search-pane { display: none; } .gh-search-results { padding: 16px; } .gh-results-toolbar .gh-btn:not(:first-of-type) { display: none; } body.gh-page-list .topic-list-item { min-height: 132px; } .gh-repo-description { white-space: normal; } }\n\n/* --- topic-detail.css --- */\nbody.gh-page-topic #main-outlet { max-width: 1216px !important; margin: 0 auto !important; padding: 20px 0 64px !important; }\n.gh-repo-overview { display: flex; min-height: 46px; align-items: center; gap: 8px; padding: 0; border-bottom: 1px solid var(--gh-border-muted); }\n.gh-repo-overview-avatar { width: 24px; height: 24px; border-radius: 6px; }\n.gh-repo-overview-name { color: var(--gh-fg) !important; font-size: 20px; font-weight: 600; line-height: 30px; text-decoration: none !important; }\n.gh-public-badge { padding: 0 7px; border: 1px solid var(--gh-border); border-radius: 2em; color: var(--gh-muted); font-size: 12px; font-weight: 500; line-height: 20px; }\n.gh-repo-actions { display: flex; gap: 8px; margin-left: auto; }\n.gh-split-btn { padding-right: 8px; }\n.gh-repo-content-grid { display: grid; grid-template-columns: minmax(0, 896px) 272px; gap: 48px; align-items: start; }\n.gh-repo-main { min-width: 0; padding-top: 24px; }\n.gh-repo-main #main-container, .gh-repo-main .container.posts, .gh-repo-main .container.posts > .row, .gh-repo-main .topic-area, .gh-repo-main .posts-wrapper, .gh-repo-main .post-stream { display: block !important; width: 100% !important; max-width: none !important; margin-right: 0 !important; margin-left: 0 !important; }\n.gh-repo-toolbar { display: flex !important; align-items: center; gap: 8px; margin-bottom: 16px; }\n.gh-branch-button { margin-right: 0; }\n.gh-branches { display: flex; align-items: center; gap: 16px; margin-right: auto; }\n.gh-branches a { display: inline-flex; align-items: center; gap: 6px; color: var(--gh-fg) !important; text-decoration: none; }\n.gh-go-file { width: 232px; justify-content: flex-start; color: var(--gh-muted) !important; background: var(--gh-canvas); }\n.gh-official-file-table { margin-bottom: 16px; border: 1px solid var(--gh-border); border-radius: 6px; overflow: hidden; }\n.gh-latest-commit { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) auto; gap: 12px; align-items: center; min-height: 52px; padding: 8px 16px; background: var(--gh-subtle); font-size: 14px; box-sizing: border-box; }\n.gh-commit-author { display: flex; align-items: center; gap: 8px; min-width: 0; }\n.gh-commit-avatar { width: 24px; height: 24px; border-radius: 50%; }\n.gh-commit-message { overflow: hidden; color: var(--gh-muted); text-overflow: ellipsis; white-space: nowrap; }\n.gh-commit-history { display: inline-flex; align-items: center; gap: 6px; color: var(--gh-fg); white-space: nowrap; }\n.gh-file-row { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(220px, 1.4fr) 105px; gap: 16px; align-items: center; min-height: 40px; padding: 0 16px; border-top: 1px solid var(--gh-border-muted); color: var(--gh-muted); font-size: 14px; box-sizing: border-box; }\n.gh-file-name { display: flex; min-width: 0; align-items: center; gap: 8px; overflow: hidden; color: var(--gh-fg); text-overflow: ellipsis; white-space: nowrap; }\n.gh-folder-icon { color: #54aeff; }\n.gh-file-message { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.gh-file-time { text-align: right; white-space: nowrap; }\n.gh-about { min-width: 0; padding-top: 10px; }\n.gh-about-section { padding: 16px 0; border-bottom: 1px solid var(--gh-border-muted); }\n.gh-about-section:first-child { padding-top: 0; }\n.gh-about h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }\n.gh-about p { margin: 0 0 12px; font-size: 16px; line-height: 24px; }\n.gh-about-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }\n.gh-about-list a, .gh-about-list li { display: flex; align-items: center; gap: 8px; color: var(--gh-muted) !important; text-decoration: none; }\n.gh-about-stat { color: var(--gh-fg); }\nbody.gh-page-topic #topic-title, body.gh-page-topic .topic-navigation, body.gh-page-topic .timeline-container, body.gh-page-topic .topic-map, body.gh-page-topic .post-notice, body.gh-page-topic .topic-status-info, body.gh-page-topic .more-topics__container, body.gh-page-topic .more-topics { display: none !important; }\nbody.gh-page-topic .post-stream { width: auto !important; max-width: none !important; margin: 0 !important; }\nbody.gh-page-topic .topic-post:first-child { border: 1px solid var(--gh-border) !important; border-radius: 6px !important; overflow: hidden; }\nbody.gh-page-topic .topic-post:first-child::before { content: 'README.md'; display: flex; min-height: 48px; align-items: center; padding: 0 16px; border-bottom: 1px solid var(--gh-border); color: var(--gh-fg); background: var(--gh-subtle); font-size: 14px; font-weight: 600; box-sizing: border-box; }\nbody.gh-page-topic .topic-post:first-child article { padding: 0 !important; border: 0 !important; background: var(--gh-canvas) !important; box-shadow: none !important; }\nbody.gh-page-topic .topic-post:first-child .topic-avatar, body.gh-page-topic .topic-post:first-child .topic-meta-data, body.gh-page-topic .topic-post:first-child nav.post-controls { display: none !important; }\nbody.gh-page-topic .topic-post:first-child .topic-body { float: none !important; width: auto !important; margin: 0 !important; padding: 32px !important; border: 0 !important; }\nbody.gh-page-topic .topic-post:first-child .cooked { max-width: none; margin: 0; color: var(--gh-fg) !important; font-size: 16px !important; line-height: 1.5 !important; }\nbody.gh-page-topic .cooked h1, body.gh-page-topic .cooked h2 { padding-bottom: .3em; border-bottom: 1px solid var(--gh-border-muted); }\nbody.gh-page-topic .cooked h1 { font-size: 2em !important; }\nbody.gh-page-topic .cooked h2 { margin-top: 24px !important; font-size: 1.5em !important; }\nbody.gh-page-topic .cooked h3 { margin-top: 24px !important; font-size: 1.25em !important; }\nbody.gh-page-topic .cooked p, body.gh-page-topic .cooked ul, body.gh-page-topic .cooked ol, body.gh-page-topic .cooked blockquote { margin-top: 0 !important; margin-bottom: 16px !important; }\nbody.gh-page-topic .cooked pre { padding: 16px !important; border-radius: 6px !important; background: var(--gh-subtle) !important; font-size: 85% !important; }\nbody.gh-page-topic .cooked code { padding: .2em .4em; border-radius: 6px; background: rgba(175,184,193,.2); font-size: 85%; }\nbody.gh-page-topic .cooked pre code { padding: 0; background: transparent; }\nbody.gh-page-topic .cooked blockquote { padding: 0 1em !important; border-left: .25em solid var(--gh-border) !important; color: var(--gh-muted) !important; }\n.gh-discussion-heading { max-width: 896px; margin: 32px auto 12px; padding-bottom: 8px; border-bottom: 1px solid var(--gh-border); font-size: 18px; font-weight: 600; }\nbody.gh-page-topic .topic-post:not(:first-child) { max-width: 896px; margin: 16px auto 0; }\nbody.gh-page-topic .topic-post:not(:first-child) article { display: block !important; border: 0 !important; background: transparent !important; }\nbody.gh-page-topic .topic-post:not(:first-child) article .post__row, body.gh-page-topic .topic-post:not(:first-child) article > .row { display: grid !important; grid-template-columns: 44px minmax(0, 1fr); gap: 12px; width: 100% !important; }\nbody.gh-page-topic .topic-post:not(:first-child) .topic-avatar { position: static !important; float: none !important; width: 44px !important; margin: 0 !important; padding: 0 !important; }\nbody.gh-page-topic .topic-post:not(:first-child) .topic-avatar img { width: 40px !important; height: 40px !important; border-radius: 50% !important; }\nbody.gh-page-topic .topic-post:not(:first-child) .topic-body { float: none !important; width: auto !important; min-width: 0 !important; margin: 0 !important; padding: 0 !important; border: 1px solid var(--gh-border) !important; border-radius: 6px !important; }\nbody.gh-page-topic .topic-post:not(:first-child) .topic-meta-data { min-height: 40px; padding: 8px 16px !important; border-bottom: 1px solid var(--gh-border); background: var(--gh-subtle); box-sizing: border-box; }\nbody.gh-page-topic .topic-post:not(:first-child) .cooked { padding: 16px !important; }\nbody.gh-page-topic .topic-post:not(:first-child) nav.post-controls { padding: 0 8px 8px !important; }\n/* Post images are completely opaque until deliberate double-click. */\nbody.gh-page-topic.gh-image-toggle-enabled .gh-image-toggle { position: relative !important; display: inline-block !important; max-width: 100% !important; overflow: hidden !important; vertical-align: baseline !important; cursor: zoom-in !important; }\nbody.gh-page-topic.gh-image-toggle-enabled .gh-image-toggle > img, body.gh-page-topic.gh-image-toggle-enabled .gh-image-toggle > picture, body.gh-page-topic.gh-image-toggle-enabled .gh-image-toggle > picture > img { max-width: 100% !important; }\nbody.gh-page-topic.gh-image-toggle-enabled .gh-image-toggle--hidden > img, body.gh-page-topic.gh-image-toggle-enabled .gh-image-toggle--hidden > picture, body.gh-page-topic.gh-image-toggle-enabled .gh-image-toggle--hidden > picture > img { visibility: hidden !important; }\n.gh-image-toggle-overlay { position: absolute !important; inset: 0 !important; z-index: 2 !important; display: flex !important; min-width: 160px !important; min-height: 64px !important; align-items: center !important; justify-content: center !important; gap: 8px; padding: 12px 18px !important; border: 1px dashed var(--gh-border) !important; border-radius: 6px !important; color: var(--gh-muted) !important; background: var(--gh-subtle) !important; font-size: 14px !important; text-align: center; cursor: zoom-in !important; box-sizing: border-box !important; }\n.gh-image-toggle-overlay:hover, .gh-image-toggle-overlay:focus-visible { border-color: var(--gh-link) !important; color: var(--gh-link) !important; background: #ddf4ff !important; outline: none; }\n.gh-image-toggle--shown { cursor: zoom-out !important; }\n.gh-image-toggle--shown .gh-image-toggle-overlay, .gh-image-toggle-overlay[hidden] { display: none !important; }\n/* Emoji render as readable labels; hovering reveals the original emoji without reflow. */\n.gh-emoji-wrapper { position: relative !important; display: inline-grid !important; place-items: center !important; vertical-align: middle !important; line-height: 1 !important; outline: none !important; }\n.gh-emoji-wrapper > img, .gh-emoji-wrapper > picture, .gh-emoji-wrapper > picture > img { grid-area: 1 / 1 !important; display: block !important; visibility: hidden !important; opacity: 0 !important; }\n.gh-emoji-label { grid-area: 1 / 1 !important; display: inline-flex !important; min-height: 20px !important; align-items: center !important; padding: 1px 5px !important; border: 1px solid #b6e3ff !important; border-radius: 6px !important; color: var(--gh-link) !important; background: #ddf4ff !important; font-size: 12px !important; line-height: 18px !important; white-space: nowrap !important; pointer-events: none !important; box-sizing: border-box; }\n.gh-emoji-wrapper:hover > img, .gh-emoji-wrapper:focus-within > img, .gh-emoji-wrapper:hover > picture, .gh-emoji-wrapper:focus-within > picture, .gh-emoji-wrapper:hover > picture > img, .gh-emoji-wrapper:focus-within > picture > img { visibility: visible !important; opacity: 1 !important; }\n.gh-emoji-wrapper:hover > .gh-emoji-label, .gh-emoji-wrapper:focus-within > .gh-emoji-label { visibility: hidden !important; opacity: 0 !important; }\n@media (max-width: 1280px) { body.gh-page-topic #main-outlet { padding-right: 24px !important; padding-left: 24px !important; } }\n@media (max-width: 980px) { .gh-repo-content-grid { grid-template-columns: 1fr; } .gh-about { display: none; } }\n@media (max-width: 767px) { body.gh-page-topic #main-outlet { padding: 16px !important; } .gh-repo-overview { align-items: flex-start; } .gh-repo-actions { display: none; } .gh-branches { display: none; } .gh-go-file { flex: 1; width: auto; } .gh-file-row { grid-template-columns: 1fr auto; } .gh-file-message { display: none; } body.gh-page-topic .topic-post:first-child .topic-body { padding: 20px !important; } body.gh-page-topic .topic-post:not(:first-child) article .post__row, body.gh-page-topic .topic-post:not(:first-child) article > .row { grid-template-columns: 36px minmax(0, 1fr); gap: 8px; } body.gh-page-topic .topic-post:not(:first-child) .topic-avatar, body.gh-page-topic .topic-post:not(:first-child) .topic-avatar img { width: 32px !important; height: 32px !important; } }\n";
  if (typeof GM_addStyle === 'function') GM_addStyle(css);
  else {
    const style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // Official GitHub Octicons v19.33.0 (MIT), embedded at build time.
  const GITHUB_OCTICONS = Object.freeze({"mark-github":{"viewBox":"0 0 24 24","path":"<path d=\"M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943\"></path>"},"three-bars":{"viewBox":"0 0 16 16","path":"<path d=\"M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z\"></path>"},"search":{"viewBox":"0 0 16 16","path":"<path d=\"M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z\"></path>"},"copilot":{"viewBox":"0 0 16 16","path":"<path d=\"M7.998 15.035c-4.562 0-7.873-2.914-7.998-3.749V9.338c.085-.628.677-1.686 1.588-2.065.013-.07.024-.143.036-.218.029-.183.06-.384.126-.612-.201-.508-.254-1.084-.254-1.656 0-.87.128-1.769.693-2.484.579-.733 1.494-1.124 2.724-1.261 1.206-.134 2.262.034 2.944.765.05.053.096.108.139.165.044-.057.094-.112.143-.165.682-.731 1.738-.899 2.944-.765 1.23.137 2.145.528 2.724 1.261.566.715.693 1.614.693 2.484 0 .572-.053 1.148-.254 1.656.066.228.098.429.126.612.012.076.024.148.037.218.924.385 1.522 1.471 1.591 2.095v1.872c0 .766-3.351 3.795-8.002 3.795Zm0-1.485c2.28 0 4.584-1.11 5.002-1.433V7.862l-.023-.116c-.49.21-1.075.291-1.727.291-1.146 0-2.059-.327-2.71-.991A3.222 3.222 0 0 1 8 6.303a3.24 3.24 0 0 1-.544.743c-.65.664-1.563.991-2.71.991-.652 0-1.236-.081-1.727-.291l-.023.116v4.255c.419.323 2.722 1.433 5.002 1.433ZM6.762 2.83c-.193-.206-.637-.413-1.682-.297-1.019.113-1.479.404-1.713.7-.247.312-.369.789-.369 1.554 0 .793.129 1.171.308 1.371.162.181.519.379 1.442.379.853 0 1.339-.235 1.638-.54.315-.322.527-.827.617-1.553.117-.935-.037-1.395-.241-1.614Zm4.155-.297c-1.044-.116-1.488.091-1.681.297-.204.219-.359.679-.242 1.614.091.726.303 1.231.618 1.553.299.305.784.54 1.638.54.922 0 1.28-.198 1.442-.379.179-.2.308-.578.308-1.371 0-.765-.123-1.242-.37-1.554-.233-.296-.693-.587-1.713-.7Z\"></path><path d=\"M6.25 9.037a.75.75 0 0 1 .75.75v1.501a.75.75 0 0 1-1.5 0V9.787a.75.75 0 0 1 .75-.75Zm4.25.75v1.501a.75.75 0 0 1-1.5 0V9.787a.75.75 0 0 1 1.5 0Z\"></path>"},"plus":{"viewBox":"0 0 16 16","path":"<path d=\"M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z\"></path>"},"issue-opened":{"viewBox":"0 0 16 16","path":"<path d=\"M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z\"></path><path d=\"M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z\"></path>"},"git-pull-request":{"viewBox":"0 0 16 16","path":"<path d=\"M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z\"></path>"},"repo":{"viewBox":"0 0 16 16","path":"<path d=\"M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z\"></path>"},"code":{"viewBox":"0 0 16 16","path":"<path d=\"m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z\"></path>"},"comment-discussion":{"viewBox":"0 0 16 16","path":"<path d=\"M1.75 1h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 10.25 10H7.061l-2.574 2.573A1.458 1.458 0 0 1 2 11.543V10h-.25A1.75 1.75 0 0 1 0 8.25v-5.5C0 1.784.784 1 1.75 1ZM1.5 2.75v5.5c0 .138.112.25.25.25h1a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h3.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Zm13 2a.25.25 0 0 0-.25-.25h-.5a.75.75 0 0 1 0-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 14.25 12H14v1.543a1.458 1.458 0 0 1-2.487 1.03L9.22 12.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.22 2.22v-2.19a.75.75 0 0 1 .75-.75h1a.25.25 0 0 0 .25-.25Z\"></path>"},"people":{"viewBox":"0 0 16 16","path":"<path d=\"M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z\"></path>"},"chevron-down":{"viewBox":"0 0 16 16","path":"<path d=\"M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z\"></path>"},"bookmark":{"viewBox":"0 0 16 16","path":"<path d=\"M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 0 1-1.227.579L8 11.722l-3.773 3.107A.751.751 0 0 1 3 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.91l3.023-2.489a.75.75 0 0 1 .954 0l3.023 2.49V2.75a.25.25 0 0 0-.25-.25Z\"></path>"},"kebab-horizontal":{"viewBox":"0 0 16 16","path":"<path d=\"M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z\"></path>"},"star":{"viewBox":"0 0 16 16","path":"<path d=\"M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z\"></path>"},"git-branch":{"viewBox":"0 0 16 16","path":"<path d=\"M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z\"></path>"},"eye":{"viewBox":"0 0 16 16","path":"<path d=\"M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z\"></path>"},"play":{"viewBox":"0 0 16 16","path":"<path d=\"M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z\"></path>"},"table":{"viewBox":"0 0 16 16","path":"<path d=\"M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25ZM6.5 6.5v8h7.75a.25.25 0 0 0 .25-.25V6.5Zm8-1.5V1.75a.25.25 0 0 0-.25-.25H6.5V5Zm-13 1.5v7.75c0 .138.112.25.25.25H5v-8ZM5 5V1.5H1.75a.25.25 0 0 0-.25.25V5Z\"></path>"},"shield":{"viewBox":"0 0 16 16","path":"<path d=\"M7.467.133a1.748 1.748 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.697 1.697 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667Zm.61 1.429a.25.25 0 0 0-.153 0l-5.25 1.68a.25.25 0 0 0-.174.238V7c0 1.358.275 2.666 1.057 3.86.784 1.194 2.121 2.34 4.366 3.297a.196.196 0 0 0 .154 0c2.245-.956 3.582-2.104 4.366-3.298C13.225 9.666 13.5 8.36 13.5 7V3.48a.251.251 0 0 0-.174-.237l-5.25-1.68ZM8.75 4.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 1.5 0ZM9 10.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z\"></path>"},"graph":{"viewBox":"0 0 16 16","path":"<path d=\"M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z\"></path>"},"file":{"viewBox":"0 0 16 16","path":"<path d=\"M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z\"></path>"},"history":{"viewBox":"0 0 16 16","path":"<path d=\"m.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z\"></path>"},"link":{"viewBox":"0 0 16 16","path":"<path d=\"m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z\"></path>"},"book":{"viewBox":"0 0 16 16","path":"<path d=\"M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z\"></path>"},"law":{"viewBox":"0 0 16 16","path":"<path d=\"M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.289.737c-.265.15-.564.23-.869.23h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.288-.737c.265-.15.564-.23.869-.23h.984V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z\"></path>"},"pulse":{"viewBox":"0 0 16 16","path":"<path d=\"M6 2c.306 0 .582.187.696.471L10 10.731l1.304-3.26A.751.751 0 0 1 12 7h3.25a.75.75 0 0 1 0 1.5h-2.742l-1.812 4.528a.751.751 0 0 1-1.392 0L6 4.77 4.696 8.03A.75.75 0 0 1 4 8.5H.75a.75.75 0 0 1 0-1.5h2.742l1.812-4.529A.751.751 0 0 1 6 2Z\"></path>"},"gear":{"viewBox":"0 0 16 16","path":"<path d=\"M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z\"></path>"},"bell":{"viewBox":"0 0 16 16","path":"<path d=\"M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.519 1.519 0 0 1 13.482 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947Zm5-3.5A3.5 3.5 0 0 0 4.5 5v2.947c0 .346-.102.683-.294.97l-1.703 2.556a.017.017 0 0 0-.003.01l.001.006c0 .002.002.004.004.006l.006.004.007.001h10.964l.007-.001.006-.004.004-.006.001-.007a.017.017 0 0 0-.003-.01l-1.703-2.554a1.745 1.745 0 0 1-.294-.97V5A3.5 3.5 0 0 0 8 1.5Z\"></path>"},"inbox":{"viewBox":"0 0 16 16","path":"<path d=\"M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Zm10.09 7h-2.875l-1.275 1.7a.75.75 0 0 1-.6.3h-3.5a.75.75 0 0 1-.6-.3L4.375 9.5H1.5v3.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25Z\"></path>"},"package":{"viewBox":"0 0 16 16","path":"<path d=\"m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.201.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.248.248 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z\"></path>"},"file-directory":{"viewBox":"0 0 16 16","path":"<path d=\"M0 2.75C0 1.784.784 1 1.75 1H5c.55 0 1.07.26 1.4.7l.9 1.2a.25.25 0 0 0 .2.1h6.75c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5c-.55 0-1.07-.26-1.4-.7l-.9-1.2a.25.25 0 0 0-.2-.1Z\"></path>"},"arrow-right":{"viewBox":"0 0 16 16","path":"<path d=\"M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z\"></path>"},"x":{"viewBox":"0 0 16 16","path":"<path d=\"M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z\"></path>"},"image":{"viewBox":"0 0 16 16","path":"<path d=\"M16 13.25A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75ZM1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h.94l.03-.03 6.077-6.078a1.75 1.75 0 0 1 2.412-.06L14.5 10.31V2.75a.25.25 0 0 0-.25-.25Zm12.5 11a.25.25 0 0 0 .25-.25v-.917l-4.298-3.889a.25.25 0 0 0-.344.009L4.81 13.5ZM7 6a2 2 0 1 1-3.999.001A2 2 0 0 1 7 6ZM5.5 6a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0Z\"></path>"},"smiley":{"viewBox":"0 0 16 16","path":"<path d=\"M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm3.82 1.636a.75.75 0 0 1 1.038.175l.007.009c.103.118.22.222.35.31.264.178.683.37 1.285.37.602 0 1.02-.192 1.285-.371.13-.088.247-.192.35-.31l.007-.008a.75.75 0 0 1 1.222.87l-.022-.015c.02.013.021.015.021.015v.001l-.001.002-.002.003-.005.007-.014.019a2.066 2.066 0 0 1-.184.213c-.16.166-.338.316-.53.445-.63.418-1.37.638-2.127.629-.946 0-1.652-.308-2.126-.63a3.331 3.331 0 0 1-.715-.657l-.014-.02-.005-.006-.002-.003v-.002h-.001l.613-.432-.614.43a.75.75 0 0 1 .183-1.044ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM5 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm5.25 2.25.592.416a97.71 97.71 0 0 0-.592-.416Z\"></path>"}});

  const GitHubDisguise = (function () {
  const REPOSITORIES = Object.freeze([
    ['vercel', 'ai'], ['microsoft', 'AI'], ['facebook', 'react'], ['vuejs', 'core'],
    ['torvalds', 'linux'], ['nodejs', 'node'], ['denoland', 'deno'], ['rust-lang', 'rust'],
    ['golang', 'go'], ['python', 'cpython'], ['tensorflow', 'tensorflow'], ['pytorch', 'pytorch'],
    ['openai', 'openai-cookbook'], ['huggingface', 'transformers'], ['langchain-ai', 'langchain'],
    ['github', 'docs'], ['electron', 'electron'], ['microsoft', 'vscode'], ['vitejs', 'vite'],
    ['sveltejs', 'svelte'], ['tailwindlabs', 'tailwindcss'], ['redis', 'redis'],
    ['docker', 'compose'], ['kubernetes', 'kubernetes'], ['mozilla', 'firefox'],
    ['obsidianmd', 'obsidian-releases'], ['android', 'architecture-samples'], ['flutter', 'samples']
  ]);
  const LANGUAGES = Object.freeze([
    ['TypeScript', '#3178c6'], ['JavaScript', '#f1e05a'], ['Python', '#3572A5'],
    ['Rust', '#dea584'], ['Go', '#00ADD8'], ['C++', '#f34b7d'], ['Kotlin', '#A97BFF']
  ]);
  const EMOJI_SELECTOR = [
    '.post-stream .cooked img.emoji', '.post-stream .cooked img.emoticon',
    '.post-stream .cooked img[data-emoji]', '.post-stream .cooked img[data-emoticon]',
    '.post-stream .topic-meta-data img.emoji', '.post-stream .topic-meta-data img.emoticon',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img',
    '.post-stream button.discourse-boosts__cooked img'
  ].join(',');
  const IMAGE_WRAPPER = 'gh-image-toggle';
  const EMOJI_WRAPPER = 'gh-emoji-wrapper';
  const LIST_RENDER_VERSION = 'primer-8-discourse-tags';
  let observer = null;
  let renderQueued = false;
  let interactionsBound = false;
  let currentKind = '';
  let currentPath = '';

  function icon(name, size = 16, extraClass = '') {
    const data = GITHUB_OCTICONS[name] || GITHUB_OCTICONS.repo;
    return `<svg class="gh-octicon ${extraClass}" width="${size}" height="${size}" viewBox="${data.viewBox}" aria-hidden="true">${data.path}</svg>`;
  }

  function hash(value) {
    let result = 2166136261;
    const text = String(value || 'linux-do');
    for (let i = 0; i < text.length; i += 1) {
      result ^= text.charCodeAt(i);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function stableTopicKey(pathname) {
    const topicId = String(pathname || '').split('/').slice(2).find((segment) => /^\d+$/.test(segment));
    return topicId ? `topic-${topicId}` : String(pathname || 'linux-do');
  }

  function repositoryFor(key) {
    const seed = hash(key);
    const pair = REPOSITORIES[seed % REPOSITORIES.length];
    const language = LANGUAGES[(seed >>> 5) % LANGUAGES.length];
    return { owner: pair[0], name: pair[1], seed, language: language[0], color: language[1] };
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function identiconDataUrl(key) {
    const seed = hash(key);
    const hue = seed % 360;
    const cells = [];
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        if (!((seed >>> ((y * 3 + x) % 29)) & 1)) continue;
        cells.push(`<rect x="${x + 1}" y="${y + 1}" width="1" height="1"/>`);
        if (x !== 2) cells.push(`<rect x="${5 - x}" y="${y + 1}" width="1" height="1"/>`);
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 7" shape-rendering="crispEdges"><rect width="7" height="7" rx=".45" fill="hsl(${hue} 35% 94%)"/><g fill="hsl(${hue} 56% 42%)">${cells.join('')}</g></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function pageKind() {
    if (document.querySelector('.post-stream') || /^\/t\//.test(location.pathname)) return 'topic';
    if (document.querySelector('.topic-list, .topic-list-container') || location.pathname === '/' || /^\/(latest|top|categories)/.test(location.pathname)) return 'list';
    return 'other';
  }

  function topicTitle() {
    return document.querySelector('#topic-title h1, #topic-title [data-topic-title]')?.textContent?.trim() || 'README';
  }

  function applyIdentity(kind) {
    const head = document.head;
    if (!head) return;
    let favicon = head.querySelector('link[data-gh-favicon]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.dataset.ghFavicon = 'true';
      head.appendChild(favicon);
    }
    const mark = GITHUB_OCTICONS['mark-github'];
    favicon.href = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.viewBox}"><g fill="#1f2328">${mark.path}</g></svg>`)}`;
    const desired = kind === 'topic' ? `${topicTitle()} · GitHub` : 'Repository search results';
    if (document.title !== desired) document.title = desired;
  }

  function syncPageClass(kind) {
    const desired = `gh-page-${kind}`;
    if (!document.body.classList.contains('github-disguise')) document.body.classList.add('github-disguise');
    ['gh-page-list', 'gh-page-topic', 'gh-page-other'].forEach((name) => {
      if (name !== desired && document.body.classList.contains(name)) document.body.classList.remove(name);
    });
    if (!document.body.classList.contains(desired)) document.body.classList.add(desired);
  }

  function headerActions() {
    return `<div class="gh-header-right">
      <a class="gh-icon-button" href="/chat" aria-label="Copilot">${icon('copilot')}</a>
      <span class="gh-header-separator"></span>
      <a class="gh-icon-button" href="/new-topic" aria-label="Create new">${icon('plus')}</a>
      <a class="gh-icon-button" href="/latest" aria-label="Issues">${icon('issue-opened')}</a>
      <a class="gh-icon-button" href="/top" aria-label="Pull requests">${icon('git-pull-request')}</a>
      <a class="gh-icon-button" href="/notifications" aria-label="Notifications">${icon('inbox')}</a>
      <img class="gh-header-avatar" src="${identiconDataUrl('linux-do-current-user')}" alt="Open user navigation menu">
    </div>`;
  }

  function searchBox(value, placeholder) {
    return `<form class="gh-header-search" action="/search">${icon('search')}<input name="q" value="${escapeHtml(value || '')}" placeholder="${escapeHtml(placeholder)}" aria-label="Search"><span class="gh-search-key">/</span></form>`;
  }

  function renderHeader(kind) {
    let header = document.querySelector('.gh-app-header');
    if (!header) {
      header = document.createElement('header');
      header.className = 'gh-app-header';
      document.body.prepend(header);
    }
    const data = repositoryFor(stableTopicKey(location.pathname));
    const signature = kind === 'topic' ? `topic:${data.owner}/${data.name}` : `list:${location.pathname}`;
    if (header.dataset.signature === signature) return;
    header.dataset.signature = signature;
    const left = kind === 'topic'
      ? `<div class="gh-header-left"><button class="gh-icon-button" type="button" aria-label="Open menu">${icon('three-bars')}</button><a class="gh-icon-button gh-home-link" href="/" aria-label="Homepage">${icon('mark-github', 32)}</a><nav class="gh-breadcrumbs" aria-label="Breadcrumbs"><a href="/">${escapeHtml(data.owner)}</a><span>/</span><a href="${escapeHtml(location.pathname)}">${escapeHtml(data.name)}</a>${icon('chevron-down', 12)}</nav></div>`
      : `<div class="gh-header-left"><button class="gh-icon-button" type="button" aria-label="Open menu">${icon('three-bars')}</button><a class="gh-icon-button gh-home-link" href="/" aria-label="Homepage">${icon('mark-github', 32)}</a></div>`;
    const nav = kind === 'topic' ? `<nav class="gh-repo-nav" aria-label="Repository"><ul class="gh-repo-nav-list">
      <li><a class="is-active" href="${escapeHtml(location.pathname)}">${icon('code')} Code</a></li>
      <li><a href="#gh-discussions">${icon('issue-opened')} Issues <span class="gh-counter">${Math.max(0, document.querySelectorAll('.topic-post').length - 1)}</span></a></li>
      <li><a href="#gh-discussions">${icon('git-pull-request')} Pull requests <span class="gh-counter">0</span></a></li>
      <li><a href="#gh-discussions">${icon('comment-discussion')} Discussions</a></li>
      <li><a href="#">${icon('play')} Actions</a></li><li><a href="#">${icon('table')} Projects</a></li>
      <li><a href="#">${icon('shield')} Security and quality</a></li><li><a href="#">${icon('graph')} Insights</a></li>
    </ul></nav>` : '';
    header.innerHTML = `<div class="gh-app-header-top">${left}${searchBox(kind === 'list' ? 'linux.do' : '', kind === 'topic' ? 'Type / to search' : 'Search')}${headerActions()}</div>${nav}`;
  }

  function filterItem(href, iconName, label, count, active = false) {
    return `<li><a href="${href}" class="${active ? 'is-active' : ''}">${icon(iconName)}<span>${label}</span>${count ? `<span class="gh-filter-count">${count}</span>` : ''}</a></li>`;
  }

  function renderListShell() {
    const sourceList = Array.from(document.querySelectorAll('.topic-list')).find((list) => !list.closest('.gh-search-layout'));
    if (!sourceList) return;
    sourceList.classList.add('gh-topic-list-source');
    let layout = document.querySelector('.gh-search-layout');
    if (!layout) {
      layout = document.createElement('div');
      layout.className = 'gh-search-layout';
      layout.innerHTML = `<aside class="gh-search-pane" aria-label="Filter by"><h2>Filter by</h2>
        <section class="gh-filter-section"><ul class="gh-filter-list">
          ${filterItem('/latest', 'code', 'Code', '5.5M')}${filterItem('/', 'repo', 'Repositories', '1.6M', true)}
          ${filterItem('/categories', 'issue-opened', 'Issues', '4.3M')}${filterItem('/top', 'git-pull-request', 'Pull requests', '5.9M')}
          ${filterItem('/top', 'comment-discussion', 'Discussions', '119k')}${filterItem('/u', 'people', 'Users', '8.2k')}
          ${filterItem('/tags', 'chevron-down', 'More', '')}
        </ul></section>
        <section class="gh-filter-section"><h3>Languages</h3><ul class="gh-filter-list">
          ${LANGUAGES.concat([['C#','#178600'],['Ruby','#701516'],['CSS','#663399']]).map(([label,color]) => `<li><a href="/tags"><i class="gh-language-dot" style="background:${color}"></i>${label}</a></li>`).join('')}
        </ul></section>
        <section class="gh-filter-section"><h3>Advanced</h3><ul class="gh-filter-list">${filterItem('/search','chevron-down','Owner','')}${filterItem('/search','chevron-down','Number of stars','')}${filterItem('/search','chevron-down','Date created','')}${filterItem('/search','search','Advanced search','')}</ul></section>
      </aside>
      <main class="gh-search-results"><div class="gh-results-toolbar"><h1><span class="gh-result-count">1.6M results</span><span class="gh-results-time">(262 ms)</span></h1><button class="gh-btn">Sort by: Best match ${icon('chevron-down', 12)}</button><button class="gh-btn">${icon('bookmark')} Save</button><button class="gh-btn gh-toolbar-kebab" aria-label="Open column options">${icon('kebab-horizontal')}</button></div></main>
      <aside class="gh-search-aside"><div class="gh-sponsor-card"><span class="gh-sponsor-emoji">🥰</span><h2>Sponsor open source projects you depend on</h2><p>Contributors are working behind the scenes to make open source better for everyone—give them the help and recognition they deserve.</p><a href="/about">Explore sponsorable projects ${icon('arrow-right')}</a></div><div class="gh-feedback-card">How can we improve search? <a href="/about">Give feedback</a></div><p class="gh-search-tip">💡 <strong>ProTip!</strong> Press the <kbd>/</kbd> key to activate the search input again and adjust your query.</p></aside>`;
      document.querySelector('#main-outlet')?.prepend(layout);
    }
    const results = layout.querySelector('.gh-search-results');
    const oldClone = results.querySelector('.gh-topic-list-clone');
    const sourceSignature = `${LIST_RENDER_VERSION}|${Array.from(sourceList.querySelectorAll('.topic-list-item')).map((row) => topicKey(row)).join('|')}`;
    if (!oldClone || oldClone.dataset.sourceSignature !== sourceSignature) {
      const clone = sourceList.cloneNode(true);
      clone.classList.remove('gh-topic-list-source');
      clone.classList.add('gh-topic-list-clone');
      clone.dataset.sourceSignature = sourceSignature;
      clone.querySelectorAll('.topic-list-item').forEach((row) => {
        row.dataset.ghRepoKey = topicKey(row);
        row.removeAttribute('data-gh-primer-key');
      });
      renderTopicRows(clone);
      if (oldClone) oldClone.replaceWith(clone);
      else results.appendChild(clone);
    }
  }

  function topicKey(row) {
    return row.getAttribute('data-topic-id') || row.id || row.querySelector('a[href*="/t/"]')?.getAttribute('href') || 'topic';
  }

  function readableCount(node, fallback) {
    const text = node?.textContent?.replace(/\s+/g, ' ').trim();
    return text && /\d/.test(text) ? text : fallback;
  }

  function renderTopicRows(root = document) {
    root.querySelectorAll('.topic-list-item').forEach((row) => {
      const key = topicKey(row);
      if (row.dataset.ghPrimerKey === key) return;
      const data = repositoryFor(key);
      const titleLink = row.querySelector('.main-link a.title, .main-link a.raw-link, a.title, a.raw-link');
      if (!titleLink) return;
      row.querySelectorAll('.gh-result-heading,.gh-result-star,.gh-repo-avatar,.gh-repo-description,.gh-real-title-line,.gh-topic-chips,.gh-repo-meta').forEach((node) => node.remove());
      const postBadges = row.querySelector('.topic-post-badges')?.cloneNode(true);
      row.querySelectorAll('.topic-post-badges').forEach((node) => node.remove());
      const realTitle = titleLink.querySelector('.gh-real-title')?.textContent?.trim() || titleLink.textContent.trim();
      titleLink.querySelectorAll('.gh-repo-prefix,.gh-real-title').forEach((node) => node.remove());
      titleLink.textContent = '';
      titleLink.innerHTML = `<span class="gh-repo-prefix">${escapeHtml(data.owner)}/${escapeHtml(data.name)}</span>`;
      const cell = titleLink.closest('.main-link, td') || row;
      const heading = document.createElement('div');
      heading.className = 'gh-result-heading';
      heading.innerHTML = `<img class="gh-repo-avatar" src="${identiconDataUrl(`${data.owner}-${data.seed}`)}" width="20" height="20" alt="">`;
      heading.appendChild(titleLink);
      cell.prepend(heading);
      const star = document.createElement('button');
      star.className = 'gh-btn gh-result-star';
      star.type = 'button';
      star.innerHTML = `${icon('star')} Star`;
      row.appendChild(star);
      const category = row.querySelector('.badge-category__name, .category-name')?.textContent?.trim() || 'community';
      const discourseTags = Array.from(row.querySelectorAll('ul.discourse-tags a.discourse-tag, ul.discourse-tags .discourse-tag'))
        .map((node) => node.textContent?.trim())
        .filter(Boolean);
      const chipLabels = Array.from(new Set([category.toLowerCase(), ...discourseTags]))
        .filter((label) => label.toLowerCase() !== 'linux-do');
      const titleLine = document.createElement('p');
      titleLine.className = 'gh-real-title-line';
      titleLine.textContent = realTitle;
      if (postBadges?.querySelector('a, .badge')) titleLine.append(' ', postBadges);
      const chips = document.createElement('div');
      chips.className = 'gh-topic-chips';
      chips.innerHTML = chipLabels.map((label) => `<span class="gh-topic-chip">${escapeHtml(label)}</span>`).join('');
      const views = readableCount(row.querySelector('.views'), String(100 + data.seed % 9800));
      const activity = row.querySelector('.activity')?.textContent?.trim() || 'recently';
      const meta = document.createElement('div');
      meta.className = 'gh-repo-meta';
      meta.innerHTML = `<span><i class="gh-language-dot" style="background:${data.color}"></i>${escapeHtml(data.language)}</span><span class="gh-meta-dot">·</span><span>${icon('star', 14)} ${escapeHtml(views)}</span><span class="gh-meta-dot">·</span><span>Updated ${escapeHtml(activity)}</span>`;
      cell.append(titleLine, chips, meta);
      row.dataset.ghPrimerKey = key;
    });
  }

  function aboutHtml(data) {
    return `<aside class="gh-about"><section class="gh-about-section"><h2>About</h2><p>A repository generated from the linux.do developer community.</p><ul class="gh-about-list"><li>${icon('link')} <a href="/">linux.do</a></li><li>${icon('book')} Readme</li><li>${icon('law')} MIT license</li><li>${icon('people')} Contributing</li><li>${icon('pulse')} Activity</li><li>${icon('gear')} Custom properties</li><li class="gh-about-stat">${icon('star')} ${20 + data.seed % 9900} stars</li><li class="gh-about-stat">${icon('eye')} ${1 + data.seed % 90} watching</li><li class="gh-about-stat">${icon('git-branch')} ${1 + data.seed % 900} forks</li></ul></section><section class="gh-about-section"><h2>Releases <span class="gh-counter">${data.seed % 24}</span></h2><a href="#">${icon('package')} Latest release</a></section></aside>`;
  }

  function fileTableHtml(data, title) {
    const rows = [
      ['file-directory','src','Update project source','last month'], ['file-directory','.github/workflows','Improve automated workflow','3 days ago'],
      ['file-directory','docs','Refresh documentation','last week'], ['file','LICENSE','Initial commit','last year'],
      ['file','README.md',title,'recently']
    ];
    const signature = `${data.owner}/${data.name}`;
    return `<div class="gh-official-file-table" data-repo-signature="${escapeHtml(signature)}"><div class="gh-latest-commit"><span class="gh-commit-author"><img class="gh-commit-avatar" src="${identiconDataUrl(data.owner)}" alt=""><strong>${escapeHtml(data.owner)}</strong></span><span class="gh-commit-message">Update documentation and examples</span><span class="gh-commit-history">${icon('history')} ${120 + data.seed % 880} Commits</span></div>${rows.map(([type,name,message,time])=>`<div class="gh-file-row"><span class="gh-file-name">${icon(type,16,type==='file-directory'?'gh-folder-icon':'')} ${escapeHtml(name)}</span><span class="gh-file-message">${escapeHtml(message)}</span><span class="gh-file-time">${time}</span></div>`).join('')}</div>`;
  }

  function restoreNativeContainers() {
    const shell = document.querySelector('.gh-detail-shell');
    const mainContainer = shell?.querySelector('#main-container');
    const postsContainer = shell?.querySelector('.container.posts');
    const outlet = document.querySelector('#main-outlet');
    if (postsContainer && outlet) outlet.insertBefore(postsContainer, shell);
    if (mainContainer && outlet) outlet.insertBefore(mainContainer, shell);
    shell?.remove();
    document.querySelector('.gh-search-layout')?.remove();
  }

  function renderTopicDetail() {
    const stream = document.querySelector('.post-stream');
    const postsContainer = stream?.closest('.container.posts');
    const mainContainer = document.querySelector('#main-container');
    const outlet = document.querySelector('#main-outlet');
    if (!stream || !mainContainer || !outlet) return;
    const data = repositoryFor(stableTopicKey(location.pathname));
    const title = topicTitle();
    const repoSignature = `${data.owner}/${data.name}`;
    let shell = document.querySelector('.gh-detail-shell');
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'gh-detail-shell';
      shell.innerHTML = `<section class="gh-repo-overview"><img class="gh-repo-overview-avatar" alt="" width="24" height="24"><a class="gh-repo-overview-name"></a><span class="gh-public-badge">Public</span><div class="gh-repo-actions"><button class="gh-btn gh-split-btn">${icon('eye')} Watch <span class="gh-counter"></span>${icon('chevron-down',12)}</button><button class="gh-btn gh-split-btn">${icon('git-branch')} Fork <span class="gh-counter"></span>${icon('chevron-down',12)}</button><button class="gh-btn gh-split-btn">${icon('star')} Star <span class="gh-counter"></span>${icon('chevron-down',12)}</button></div></section><div class="gh-repo-content-grid"><main class="gh-repo-main"></main>${aboutHtml(data)}</div>`;
      outlet.prepend(shell);
    }
    if (shell.dataset.repoSignature !== repoSignature) {
      const oldAbout = shell.querySelector('.gh-about');
      if (oldAbout) {
        const holder = document.createElement('div');
        holder.innerHTML = aboutHtml(data);
        oldAbout.replaceWith(holder.firstElementChild);
      }
      shell.querySelector('.gh-official-file-table')?.remove();
      shell.dataset.repoSignature = repoSignature;
    }
    shell.querySelector('.gh-repo-overview-avatar').src = identiconDataUrl(`${data.owner}-${data.name}`);
    const nameLink = shell.querySelector('.gh-repo-overview-name');
    nameLink.textContent = data.name;
    nameLink.href = location.pathname;
    const counters = shell.querySelectorAll('.gh-repo-actions .gh-counter');
    if (counters[0]) counters[0].textContent = 1 + data.seed % 90;
    if (counters[1]) counters[1].textContent = 1 + data.seed % 900;
    if (counters[2]) counters[2].textContent = 20 + data.seed % 9900;
    const repoMain = shell.querySelector('.gh-repo-main');
    if (mainContainer.parentNode !== repoMain) repoMain.appendChild(mainContainer);
    let toolbar = repoMain.querySelector('.gh-repo-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'gh-repo-toolbar';
      toolbar.innerHTML = `<button class="gh-btn gh-branch-button">${icon('git-branch')} main ${icon('chevron-down',12)}</button><span class="gh-branches"><a href="#">${icon('git-branch')} <strong>${1 + data.seed % 9}</strong> Branches</a><a href="#">${icon('bookmark')} <strong>${1 + data.seed % 24}</strong> Tags</a></span><button class="gh-btn gh-go-file">${icon('search')} Go to file</button><button class="gh-btn">Add file ${icon('chevron-down',12)}</button><button class="gh-btn gh-btn-primary">${icon('code')} Code ${icon('chevron-down',12)}</button>`;
      repoMain.insertBefore(toolbar, mainContainer);
    }
    let table = repoMain.querySelector('.gh-official-file-table');
    if (table && table.dataset.repoSignature !== repoSignature) {
      table.remove();
      table = null;
    }
    if (!table) {
      const holder = document.createElement('div');
      holder.innerHTML = fileTableHtml(data, title);
      table = holder.firstElementChild;
      repoMain.insertBefore(table, mainContainer);
    }
    if (postsContainer && postsContainer.parentNode !== repoMain) repoMain.appendChild(postsContainer);
    const replies = stream.querySelectorAll('.topic-post:not(:first-child)');
    if (replies.length && !document.querySelector('.gh-discussion-heading')) {
      const heading = document.createElement('h2');
      heading.id = 'gh-discussions';
      heading.className = 'gh-discussion-heading';
      heading.textContent = 'Discussions';
      replies[0].parentNode.insertBefore(heading, replies[0]);
    }
  }

  function emojiDescription(image) {
    const values = ['alt','title','data-emoji','data-emoji-name','data-emoji-shortcode','data-name','aria-label'].map((name)=>image.getAttribute(name)).filter(Boolean);
    for (const value of values) {
      const match = String(value).match(/:([A-Za-z0-9_+.-]+):/);
      if (match) return match[1];
      if (/^[\w\u3400-\u9fff+.-]{1,32}$/.test(String(value).trim())) return String(value).trim();
    }
    const filename = (image.getAttribute('src') || '').split('/').pop()?.split(/[.?#]/)[0];
    return filename || 'emoji';
  }

  function syncEmojis() {
    if (pageKind() !== 'topic') return;
    document.querySelectorAll(EMOJI_SELECTOR).forEach((image) => {
      if (image.closest(`.${EMOJI_WRAPPER}`)) return;
      const media = image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;
      const parent = media.parentNode;
      if (!parent) return;
      const wrapper = document.createElement('span');
      wrapper.className = EMOJI_WRAPPER;
      wrapper.dataset.ghEmojiWrapper = 'true';
      wrapper.tabIndex = image.closest('button') ? -1 : 0;
      const label = document.createElement('span');
      label.className = 'gh-emoji-label';
      label.textContent = `[emoji:${emojiDescription(image)}]`;
      label.setAttribute('aria-hidden', 'true');
      parent.insertBefore(wrapper, media);
      wrapper.append(media, label);
    });
  }

  function isContentImage(image) {
    if (!image.closest('.post-stream .cooked')) return false;
    if (image.closest(`.${EMOJI_WRAPPER}, .emoji, .emoticon, [data-emoji], [data-emoticon], .avatar, [data-user-card]`)) return false;
    const cls = typeof image.className === 'string' ? image.className : '';
    const alt = `${image.getAttribute('alt') || ''} ${image.getAttribute('title') || ''}`;
    return !/(?:^|[\s_-])(emoji|emoticon|avatar|badge|icon|reaction|flair)(?:$|[\s_-])/i.test(cls) && !/头像|表情|徽章|图标/i.test(alt);
  }

  function setImageState(wrapper, shown) {
    wrapper.classList.toggle('gh-image-toggle--hidden', !shown);
    wrapper.classList.toggle('gh-image-toggle--shown', shown);
    wrapper.dataset.visible = String(shown);
    const overlay = wrapper.querySelector('.gh-image-toggle-overlay');
    if (overlay) { overlay.hidden = shown; overlay.setAttribute('aria-label', shown ? '双击隐藏图片' : '双击显示图片'); }
  }

  function syncImages() {
    if (pageKind() !== 'topic') return;
    document.body.classList.add('gh-image-toggle-enabled');
    document.querySelectorAll('.post-stream .cooked img').forEach((image) => {
      if (!isContentImage(image) || image.closest(`.${IMAGE_WRAPPER}`)) return;
      const media = image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;
      const parent = media.parentNode;
      if (!parent) return;
      const wrapper = document.createElement('span');
      wrapper.className = `${IMAGE_WRAPPER} gh-image-toggle--hidden`;
      wrapper.dataset.ghImageWrapper = 'true';
      wrapper.setAttribute('role', 'group');
      const overlay = document.createElement('span');
      overlay.className = 'gh-image-toggle-overlay';
      overlay.tabIndex = 0;
      overlay.setAttribute('role', 'button');
      overlay.innerHTML = `${icon('image')} <span>双击显示图片</span>`;
      parent.insertBefore(wrapper, media);
      wrapper.append(media, overlay);
      setImageState(wrapper, false);
    });
  }

  function closestImageWrapper(target) {
    return target instanceof Element ? target.closest(`.${IMAGE_WRAPPER}`) : null;
  }

  function bindInteractions() {
    if (interactionsBound) return;
    interactionsBound = true;
    document.addEventListener('click', (event) => {
      const wrapper = closestImageWrapper(event.target);
      if (!wrapper) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    document.addEventListener('dblclick', (event) => {
      const wrapper = closestImageWrapper(event.target);
      if (!wrapper) return;
      event.preventDefault();
      event.stopPropagation();
      setImageState(wrapper, !wrapper.classList.contains('gh-image-toggle--shown'));
    }, true);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const wrapper = closestImageWrapper(event.target);
      if (!wrapper) return;
      event.preventDefault();
      if (!event.repeat) setImageState(wrapper, !wrapper.classList.contains('gh-image-toggle--shown'));
    }, true);
  }

  function cleanupForRoute(kind) {
    if (currentKind && currentKind !== kind) restoreNativeContainers();
    if (kind !== 'topic') document.querySelectorAll('.gh-detail-shell,.gh-discussion-heading').forEach((node)=>node.remove());
    if (kind !== 'list') document.querySelector('.gh-search-layout')?.remove();
  }

  function render() {
    if (!document.body) return;
    const kind = pageKind();
    if (kind !== currentKind || location.pathname !== currentPath) cleanupForRoute(kind);
    currentKind = kind;
    currentPath = location.pathname;
    syncPageClass(kind);
    applyIdentity(kind);
    renderHeader(kind);
    if (kind === 'list') renderListShell();
    if (kind === 'topic') { renderTopicDetail(); syncEmojis(); syncImages(); }
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; render(); });
  }

  function init() {
    bindInteractions();
    render();
    window.addEventListener('popstate', queueRender);
    window.addEventListener('hashchange', queueRender);
    observer?.disconnect();
    observer = new MutationObserver((records) => {
      const relevant = records.some((record) => {
        if (record.type === 'characterData') return true;
        if (record.type === 'attributes') return !record.target.closest?.('.gh-app-header,.gh-search-layout,.gh-detail-shell');
        return Array.from(record.addedNodes).some((node) => {
          if (node.nodeType !== 1) return false;
          if (node.matches?.('.gh-topic-list-clone')) return !node.dataset.sourceSignature?.startsWith(`${LIST_RENDER_VERSION}|`);
          return !node.closest?.('.gh-app-header,.gh-search-layout,.gh-detail-shell');
        });
      });
      if (relevant) queueRender();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src','alt','title','class','data-emoji'] });
  }

  return { init };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { GitHubDisguise };


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GitHubDisguise.init(), { once: true });
  } else GitHubDisguise.init();
})();
