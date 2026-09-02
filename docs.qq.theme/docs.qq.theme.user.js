// ==UserScript==
// @name         LINUX DO 伪装腾讯文档 (Docs QQ Theme)
// @namespace    https://linux.do/
// @version      1.1.2
// @description  将 LINUX DO 论坛界面深度伪装为腾讯文档工作台与在线文档风格，支持 Favicon/Title 劫持、文档列表转换与 Word 视图
// @author       Antigravity
// @match        https://linux.do/*
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // 注入 CSS 样式
  const css = "\n/* --- variables.css --- */\n/* 腾讯文档 2026 官方 Design Token 变量 */\n:root {\n  --text-ultrastrong: rgba(0, 0, 0, 0.9);\n  --text-strong: rgba(0, 0, 0, 0.76);\n  --text-medium: rgba(0, 0, 0, 0.56);\n  --text-weak: rgba(0, 0, 0, 0.26);\n  --text-link: #175ceb;\n  --text-white: #fff;\n  --text-vip: #e59837;\n\n  --accent-default: #1e6fff;\n  --accent-hover: #175ceb;\n  --accent-pressed: #134ae0;\n  --accent-disabled: #c2d8ff;\n\n  --bg-lv1-default: #fff;\n  --bg-lv2-default: #fff;\n  --bg-lv3-default: #fff;\n  --bg-lv4-default: #fff;\n  --bg-lv3-medium: #f3f5f7;\n\n  --border-weak: rgba(0, 0, 0, 0.04);\n  --border-medium: rgba(0, 0, 0, 0.08);\n  --border-strong: rgba(0, 0, 0, 0.12);\n\n  --feedback-hover: rgba(51, 77, 102, 0.06);\n  --feedback-active: rgba(51, 77, 102, 0.08);\n\n  --sidebar-width: 244px;\n  /* 腾讯文档桌面端实测：顶部栏高 60px，左侧栏宽 244px。 */\n  --topbar-height: 60px;\n\n  /* 2026-08-27 从腾讯文档 desktop 实际 computed style 提取。 */\n  --font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Noto Sans\", Ubuntu, Cantarell, \"Helvetica Neue\", apple-system, Helvetica, Arial, \"PingFang SC\", \"Microsoft YaHei\", \"Source Han Sans SC\", \"Noto Sans CJK SC\", \"WenQuanYi Micro Hei\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", TdocsUncommon;\n  --font-family-numeric: Bahnschrift, \"DIN Alternate\", var(--font-family);\n  --font-size-caption: 12px;\n  --font-size-body: 14px;\n  --font-size-tab: 16px;\n  --line-height-caption: 16px;\n  --line-height-body: 20px;\n  --line-height-title: 24px;\n  --font-weight-regular: 400;\n  --font-weight-medium: 500;\n  --font-weight-semibold: 600;\n\n  /* 兼容 composer/modal 中的旧变量名。 */\n  --qqdocs-font-family: var(--font-family);\n  --qqdocs-text-primary: var(--text-ultrastrong);\n  --qqdocs-text-secondary: var(--text-strong);\n  --qqdocs-brand-color: var(--accent-default);\n  --qqdocs-brand-hover: var(--accent-hover);\n  --qqdocs-bg-hover: var(--bg-lv3-medium);\n}\n\n/* --- global.css --- */\n/* 全局基础重置与工作台布局 (彻底解决 #main-outlet-wrapper 居中与重复偏移) */\n\nhtml, body {\n  background-color: #ffffff !important;\n  color: var(--text-ultrastrong) !important;\n  font-family: var(--font-family) !important;\n  font-size: 16px !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: normal !important;\n  letter-spacing: normal !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow-x: hidden !important;\n  width: 100vw !important;\n}\n\nbutton:not(#reply-control button),\ninput:not(#reply-control input),\ntextarea:not(#reply-control textarea),\nselect:not(#reply-control select) {\n  font-family: var(--font-family) !important;\n  font-style: normal !important;\n  letter-spacing: normal !important;\n}\n\n/* 覆盖 Discourse 自带字体变量，确保伪装界面的所有文字都落到腾讯文档字体栈。 */\n.d-header,\n.d-header *,\n.desktop-layout-sidebar-pc,\n.desktop-layout-sidebar-pc *,\n#main-outlet,\n#main-outlet *,\n.menu-panel,\n.menu-panel *,\n.modal-inner-container,\n.modal-inner-container * {\n  font-family: var(--font-family) !important;\n  letter-spacing: normal !important;\n}\n\n/* 正文中的代码仍保持语义正确的等宽字体。 */\n#main-outlet code,\n#main-outlet pre,\n#main-outlet kbd,\n#main-outlet samp {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", monospace !important;\n}\n\n/* Discourse 刷新遮罩：仅移除遮罩中的巨大站点 Logo，保留加载点与页面启动流程。 */\n#d-splash .splash-logo-container {\n  display: none !important;\n  background-image: none !important;\n  animation: none !important;\n}\n\n/* 1. 彻底隐藏 Linux Do 原生的所有 Banner、Notice、公告、原生侧栏与导航条 */\n.welcome-banner,\n.custom-search-banner-wrap,\n.global-notice,\n.alert,\n.alert-info,\n.alert-update-topics,\n.above-main-container-outlet,\n.list-controls,\n.navigation-container,\n.navigation-controls,\n.nav-pills,\n.categories-admin-dropdown,\n.category-breadcrumb,\n.category-boxes,\n.top-notices,\n.community-rule,\n#site-text-logo,\n.sidebar-wrapper,\n#d-sidebar,\n.d-sidebar-wrapper,\n.topic-list-bottom,\n.nav-tabs,\n.select-kit:not(#reply-control .select-kit),\n.loading-container {\n  display: none !important;\n}\n\n/* 2. 重置 Discourse 外层包装容器 #main-outlet-wrapper (去除原版的 max-width: 1110px 和 margin: 0 auto) */\n#main-outlet-wrapper,\n#main-outlet-wrapper.wrap {\n  display: block !important;\n  margin: var(--topbar-height) 0 0 var(--sidebar-width) !important;\n  padding: 0 !important;\n  width: calc(100vw - var(--sidebar-width)) !important;\n  max-width: calc(100vw - var(--sidebar-width)) !important;\n  box-sizing: border-box !important;\n  min-height: calc(100vh - var(--topbar-height)) !important;\n  grid-template-columns: 1fr !important;\n}\n\n/* 3. #main-outlet 与主容器直接贴紧左侧栏，消除任何多余空白 */\n#main-outlet {\n  margin: 0 !important;\n  width: 100% !important;\n  max-width: 100% !important;\n  padding: 16px 28px !important;\n  box-sizing: border-box !important;\n  background: #ffffff !important;\n  display: block !important;\n}\n\n#main-container,\n#main-container.container,\n#main-outlet > .container,\n#main-outlet > .container.list-container,\n#main-outlet > .ember-view,\n.topic-list-container {\n  width: 100% !important;\n  max-width: 100% !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  box-sizing: border-box !important;\n  display: block !important;\n}\n\n/* 4. 滚动条轻量化 */\n::-webkit-scrollbar {\n  width: 6px;\n  height: 6px;\n}\n::-webkit-scrollbar-track {\n  background: transparent;\n}\n::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.12);\n  border-radius: 3px;\n}\n::-webkit-scrollbar-thumb:hover {\n  background: rgba(0, 0, 0, 0.22);\n}\n\n/* --- header.css --- */\n/* 腾讯文档官方原生 Header 样式 */\n.d-header {\n  background: var(--bg-lv3-medium) !important;\n  border-bottom: 0 !important;\n  box-shadow: none !important;\n  height: var(--topbar-height) !important;\n  padding: 0 !important;\n  position: fixed !important;\n  top: 0 !important;\n  left: 0 !important;\n  right: 0 !important;\n  transform: none !important;\n  z-index: 1100 !important;\n  width: 100vw !important;\n  max-width: 100vw !important;\n  box-sizing: border-box !important;\n}\n\n.d-header .wrap {\n  max-width: 100% !important;\n  width: 100% !important;\n  height: 100% !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n}\n\n.d-header .contents {\n  height: 100% !important;\n  display: flex !important;\n  align-items: center !important;\n  width: 100% !important;\n  justify-content: flex-start !important;\n  flex-flow: row nowrap !important;\n  min-width: 0 !important;\n  position: relative !important;\n}\n\n/* Discourse 2026 的 Logo outlet 本身也是 flex item，必须固定为侧栏宽度。 */\n.d-header .home-logo-wrapper-outlet {\n  display: flex !important;\n  align-items: center !important;\n  width: var(--sidebar-width) !important;\n  min-width: var(--sidebar-width) !important;\n  height: 100% !important;\n  flex: 0 0 var(--sidebar-width) !important;\n  overflow: visible !important;\n  order: 0 !important;\n}\n\n/* 彻底隐藏原论坛左侧边栏折叠按钮、Logo与右侧原生各种按钮 */\n.header-sidebar-toggle,\n.btn-sidebar-toggle,\n.d-header .title a img,\n.d-header .title a .title-text,\n.d-header-icons .hamburger-dropdown,\n.d-header-icons .language-switcher,\n.d-header-icons .search-dropdown,\n.d-header-icons .chat-header-icon,\n.d-header-icons .header-dropdown-toggle:not(#current-user):not(.desktop-top-bar-right) {\n  display: none !important;\n}\n\n/* 官方左侧 Logo 容器 */\n.d-header .title {\n  display: flex !important;\n  align-items: center !important;\n  width: var(--sidebar-width) !important;\n  min-width: var(--sidebar-width) !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  flex-shrink: 0 !important;\n  position: static !important;\n  overflow: visible !important;\n  box-sizing: border-box !important;\n  order: 0 !important;\n}\n\n.desktop-top-bar-left {\n  display: flex !important;\n  align-items: center !important;\n  width: 100% !important;\n}\n\n.desktop-logo-pc {\n  display: inline-flex !important;\n  align-items: center !important;\n  text-decoration: none !important;\n  width: 100% !important;\n  height: 26px !important;\n  padding-left: 32px !important;\n  box-sizing: border-box !important;\n  flex-shrink: 0 !important;\n}\n.desktop-logo-pc svg {\n  display: block !important;\n  width: 195px !important;\n  height: 26px !important;\n  max-width: 195px !important;\n  flex: 0 0 195px !important;\n}\n\n/* 搜索框 (DUI 官方规范) */\n.d-header .desktop-search-input-pc {\n  position: relative !important;\n  display: flex !important;\n  align-items: center !important;\n  background: #ffffff !important;\n  border: 1px solid var(--border-medium) !important;\n  border-radius: 8px !important;\n  height: 38px !important;\n  width: clamp(220px, calc(100vw - var(--sidebar-width) - 558px), 960px) !important;\n  max-width: 960px !important;\n  min-width: 220px !important;\n  padding: 0 14px !important;\n  box-sizing: border-box !important;\n  transition: all 0.2s ease !important;\n  margin: 0 !important;\n  flex: 0 1 clamp(220px, calc(100vw - var(--sidebar-width) - 558px), 960px) !important;\n  order: 1 !important;\n  overflow: hidden !important;\n}\n.d-header .desktop-search-input-pc:focus-within {\n  background: #ffffff !important;\n  border: 1px solid var(--accent-default) !important;\n  box-shadow: 0 0 0 2px rgba(30, 111, 255, 0.15) !important;\n}\n.d-header .desktop-search-input-pc input {\n  display: block !important;\n  flex: 1 1 auto !important;\n  min-width: 0 !important;\n  height: 36px !important;\n  border: none !important;\n  outline: none !important;\n  background: transparent !important;\n  box-shadow: none !important;\n  appearance: none !important;\n  -webkit-appearance: none !important;\n  font-size: 12px !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: 36px !important;\n  color: var(--text-ultrastrong) !important;\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 0 0 0 6px !important;\n  box-sizing: border-box !important;\n}\n.d-header .desktop-search-input-pc input::placeholder {\n  color: var(--text-weak) !important;\n  line-height: 36px !important;\n  opacity: 1 !important;\n}\n\n/* 接管原生 panel (右侧按钮组容器) */\n.d-header .panel {\n  display: flex !important;\n  align-items: center !important;\n  margin-left: auto !important;\n  float: none !important;\n  height: 100% !important;\n  min-width: 0 !important;\n  padding: 0 16px 0 24px !important;\n  box-sizing: border-box !important;\n  flex: 0 0 auto !important;\n  order: 2 !important;\n}\n\n/* 顶部右侧功能按钮组 */\n.d-header-icons {\n  display: flex !important;\n  align-items: center !important;\n}\n\n.desktop-top-bar-right {\n  display: flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n}\n\n.desktop-top-bar-button {\n  background: transparent !important;\n  border: none !important;\n  outline: none !important;\n  cursor: pointer !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 4px !important;\n  font-size: var(--font-size-caption) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n  color: var(--text-ultrastrong) !important;\n  padding: 4px 8px !important;\n  border-radius: 4px !important;\n  transition: background-color 0.15s ease !important;\n  user-select: none !important;\n  text-decoration: none !important;\n}\n.desktop-top-bar-button:hover {\n  background-color: var(--feedback-hover) !important;\n  color: var(--text-ultrastrong) !important;\n}\n\n.desktop-vip-center-button {\n  color: var(--text-vip) !important;\n  font-weight: 500 !important;\n}\n.desktop-vip-center-button:hover {\n  color: #c97f26 !important;\n}\n\n.desktop-notification-badge {\n  background: #f54a45 !important;\n  color: #fff !important;\n  font-size: 12px !important;\n  font-weight: var(--font-weight-medium) !important;\n  padding: 0 4px !important;\n  height: 14px !important;\n  line-height: 14px !important;\n  border-radius: 7px !important;\n  margin-left: 2px !important;\n}\n\n/* 窄屏时先收起文字型次要入口，始终给品牌和搜索框保留独立空间。 */\n@media (max-width: 1180px) {\n  .desktop-top-bar-button span:not(.desktop-notification-badge) {\n    display: none !important;\n  }\n\n  .desktop-top-bar-right {\n    gap: 2px !important;\n  }\n\n  .d-header .panel {\n    padding-left: 12px !important;\n  }\n}\n\n@media (max-width: 760px) {\n  .d-header .title {\n    width: 72px !important;\n    min-width: 72px !important;\n  }\n\n  .desktop-logo-pc {\n    padding-left: 20px !important;\n  }\n\n  .desktop-logo-pc svg {\n    width: 28px !important;\n    max-width: 28px !important;\n    flex-basis: 28px !important;\n  }\n\n  .d-header .desktop-search-input-pc {\n    min-width: 120px !important;\n    width: auto !important;\n    flex: 1 1 auto !important;\n  }\n}\n\n/* 用户头像 */\n.d-header-icons #current-user .avatar {\n  width: 28px !important;\n  height: 28px !important;\n  border-radius: 50% !important;\n  border: 1px solid var(--border-weak) !important;\n}\n\n/* --- sidebar.css --- */\n/* 腾讯文档官方原生 Sidebar 样式 (Fixed 固定左侧) */\n.desktop-layout-sidebar-pc {\n  position: fixed !important;\n  left: 0 !important;\n  top: var(--topbar-height) !important;\n  width: var(--sidebar-width) !important;\n  min-width: var(--sidebar-width) !important;\n  max-width: var(--sidebar-width) !important;\n  background: var(--bg-lv3-medium) !important;\n  border-right: 0 !important;\n  padding: 16px 12px !important;\n  display: flex !important;\n  flex-direction: column !important;\n  height: calc(100vh - var(--topbar-height)) !important;\n  box-sizing: border-box !important;\n  user-select: none !important;\n  z-index: 1000 !important;\n}\n\n/* 顶部操作按钮 */\n.desktop-create-button-pc {\n  background-color: var(--accent-default) !important;\n  color: #ffffff !important;\n  height: 36px !important;\n  border-radius: 4px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 6px !important;\n  font-size: 14px !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: 16px !important;\n  cursor: pointer !important;\n  border: none !important;\n  width: 100% !important;\n  margin-bottom: 8px !important;\n  transition: background-color 0.15s ease !important;\n  text-decoration: none !important;\n}\n.desktop-create-button-pc:hover {\n  background-color: var(--accent-hover) !important;\n}\n\n.desktop-upload-button-pc {\n  background-color: #ffffff !important;\n  color: var(--text-ultrastrong) !important;\n  border: 1px solid var(--border-medium) !important;\n  height: 32px !important;\n  border-radius: 4px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 6px !important;\n  font-size: var(--font-size-body) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-body) !important;\n  cursor: pointer !important;\n  width: 100% !important;\n  margin-bottom: 16px !important;\n  transition: all 0.15s ease !important;\n  text-decoration: none !important;\n}\n.desktop-upload-button-pc:hover {\n  background-color: var(--feedback-hover) !important;\n  border-color: var(--border-strong) !important;\n}\n\n/* 导航链接 */\n.desktop-sidebar-nav-list {\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 2px !important;\n  flex: 1 !important;\n}\n\n.desktop-node-link-router {\n  display: flex !important;\n  align-items: center !important;\n  gap: 10px !important;\n  padding: 8px 12px !important;\n  border-radius: 4px !important;\n  font-size: var(--font-size-body) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-body) !important;\n  color: var(--text-ultrastrong) !important;\n  text-decoration: none !important;\n  cursor: pointer !important;\n  transition: all 0.15s ease !important;\n}\n.desktop-node-link-router:hover {\n  background-color: var(--feedback-hover) !important;\n  color: var(--text-ultrastrong) !important;\n}\n.desktop-node-link-router.desktop-link-active {\n  background-color: var(--bg-lv3-medium) !important;\n  color: var(--text-ultrastrong) !important;\n  font-weight: 600 !important;\n}\n\n/* 企业版卡片 */\n.desktop-enterprise-edition-entry {\n  margin-top: auto !important;\n  margin-bottom: 12px !important;\n}\n.desktop-promo-card {\n  background: linear-gradient(180deg, #f0f5ff 0%, #f7f9fc 100%) !important;\n  border: 1px solid #e1eaff !important;\n  border-radius: 6px !important;\n  padding: 12px !important;\n}\n.desktop-promo-header {\n  display: flex !important;\n  align-items: center !important;\n  gap: 6px !important;\n  margin-bottom: 4px !important;\n}\n.desktop-promo-title {\n  font-size: var(--font-size-body) !important;\n  font-weight: 600 !important;\n  line-height: var(--line-height-body) !important;\n  color: var(--text-strong) !important;\n}\n.desktop-promo-subtitle {\n  font-size: var(--font-size-caption) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n  color: var(--text-weak) !important;\n  margin-bottom: 8px !important;\n}\n.desktop-promo-button {\n  background: var(--accent-default) !important;\n  color: #fff !important;\n  font-size: var(--font-size-body) !important;\n  line-height: var(--line-height-body) !important;\n  padding: 4px 0 !important;\n  text-align: center !important;\n  border-radius: 12px !important;\n  cursor: pointer !important;\n  font-weight: var(--font-weight-regular) !important;\n}\n\n/* 空间容量进度条 */\n.desktop-storage-panel {\n  padding: 6px 2px !important;\n  font-family: var(--font-family-numeric) !important;\n  font-size: var(--font-size-caption) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n  color: var(--text-medium) !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n}\n.desktop-storage-panel a {\n  color: var(--text-medium) !important;\n  text-decoration: none !important;\n}\n.desktop-storage-panel a:hover {\n  color: var(--accent-default) !important;\n}\n\n/* --- topic-list.css --- */\n/* 腾讯文档官方原生列表页样式 (深度适配 Discourse 原生 Table 结构) */\n\n.list-container,\n.topic-list-container,\n#main-container,\n#main-outlet .container.list-container,\n#main-outlet > .ember-view {\n  width: 100% !important;\n  max-width: 100% !important;\n  background: #ffffff !important;\n  border: none !important;\n  box-shadow: none !important;\n  box-sizing: border-box !important;\n  padding: 0 !important;\n  margin: 0 !important;\n}\n\n/* 顶部 Tab 切换头 (最近 / 空间 / 收藏) */\n.desktop-home-page-tab-header-pc {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  border-bottom: 1px solid var(--border-weak) !important;\n  padding-bottom: 8px !important;\n  margin-bottom: 12px !important;\n  width: 100% !important;\n}\n\n.desktop-tab-group {\n  display: flex !important;\n  align-items: center !important;\n  gap: 24px !important;\n}\n\n.desktop-tab-link {\n  font-size: var(--font-size-tab) !important;\n  line-height: 48px !important;\n  color: var(--text-medium) !important;\n  cursor: pointer !important;\n  padding-bottom: 0 !important;\n  position: relative !important;\n  font-weight: var(--font-weight-regular) !important;\n  text-decoration: none !important;\n}\n.desktop-tab-link:hover {\n  color: var(--text-ultrastrong) !important;\n}\n.desktop-tab-link.desktop-link-active {\n  color: var(--text-ultrastrong) !important;\n  font-weight: 600 !important;\n}\n.desktop-tab-link.desktop-link-active::after {\n  content: '';\n  position: absolute;\n  bottom: -9px;\n  left: 0;\n  width: 100%;\n  height: 2px;\n  background-color: var(--text-ultrastrong);\n}\n\n.desktop-page-header-extra-pc {\n  display: flex !important;\n  align-items: center !important;\n  gap: 16px !important;\n}\n\n.desktop-header-action-btn {\n  display: flex !important;\n  align-items: center !important;\n  gap: 4px !important;\n  font-size: var(--font-size-caption) !important;\n  font-weight: var(--font-weight-semibold) !important;\n  line-height: var(--line-height-caption) !important;\n  color: var(--text-ultrastrong) !important;\n  cursor: pointer !important;\n  background: transparent !important;\n  border: none !important;\n}\n.desktop-header-action-btn:hover {\n  color: var(--text-ultrastrong) !important;\n}\n\n/* 表格主体 */\n.topic-list {\n  width: 100% !important;\n  border-collapse: collapse !important;\n  table-layout: fixed !important;\n  margin: 0 !important;\n}\n\n/* 表头重构 */\n.topic-list thead {\n  display: table-header-group !important;\n}\n\n.topic-list thead tr {\n  border-bottom: 1px solid var(--border-weak) !important;\n}\n\n.topic-list th {\n  color: var(--text-strong) !important;\n  font-size: var(--font-size-caption) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n  text-align: left !important;\n  padding: 10px 8px !important;\n  background: transparent !important;\n  border: none !important;\n}\n\n/* 列宽分配 (与腾讯文档完全一致) */\n.topic-list th.default,\n.topic-list th.topic-list-data:nth-child(1),\n.topic-list td.main-link {\n  width: 50% !important;\n}\n.topic-list th.posters,\n.topic-list td.posters {\n  width: 13% !important;\n}\n.topic-list th.posts,\n.topic-list td.posts {\n  width: 12% !important;\n}\n.topic-list th.views,\n.topic-list td.views {\n  width: 13% !important;\n}\n.topic-list th.activity,\n.topic-list td.activity {\n  width: 12% !important;\n  text-align: right !important;\n}\n\n/* 行样式 */\n.topic-list-item {\n  border-bottom: 1px solid #f7f8fa !important;\n  /* 行高调为 56px */\n  height: 56px !important;\n  transition: background-color 0.1s ease !important;\n}\n.topic-list-item:hover {\n  background-color: #f7f8fa !important;\n}\n\n.topic-list-item .main-link {\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n}\n\n.topic-list-item .link-top-line {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  width: 100% !important;\n  overflow: hidden !important;\n}\n\n.topic-list-item .title {\n  color: var(--text-ultrastrong) !important;\n  font-size: 14px !important;\n  font-weight: 400 !important;\n  line-height: var(--line-height-title) !important;\n  text-decoration: none !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n  display: inline !important;\n}\n.topic-list-item .title:hover {\n  color: var(--accent-default) !important;\n}\n\n/* 隐藏未读蓝点、标题下方的论坛分类条与摘要 */\n.topic-list-item .link-bottom-line,\n.topic-list-item .topic-statuses,\n.topic-list-item .topic-excerpt,\n.topic-list-item .unread-indicator,\n.topic-list-item .badge-notification.unread-posts {\n  display: none !important;\n}\n\n/* 腾讯文档单选圆圈双保险隐藏（如果有旧DOM） */\n.qqdocs-select-circle {\n  display: none !important;\n}\n\n/* 图标容器 */\n.qqdocs-row-icon-wrap {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  margin-right: 8px !important;\n  flex-shrink: 0 !important;\n  vertical-align: middle !important;\n}\n\n.qqdocs-doc-svg {\n  width: 20px !important;\n  height: 20px !important;\n  min-width: 20px !important;\n  min-height: 20px !important;\n  flex-shrink: 0 !important;\n  display: inline-block !important;\n  vertical-align: middle !important;\n}\n\n/* 所有者列 */\n.topic-list-item .posters {\n  font-size: 12px !important;\n  color: var(--text-strong) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n}\n.topic-list-item .posters img.avatar,\n.topic-list-item .posters a:not(:first-child) {\n  display: none !important;\n}\n\n/* 位置列 */\n.topic-list-item .posts {\n  font-size: 12px !important;\n  color: var(--text-strong) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  text-align: left !important;\n}\n\n/* 最近查看列 */\n.topic-list-item .views {\n  font-size: 12px !important;\n  color: var(--text-strong) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n  text-align: left !important;\n}\n\n/* 文档大小列 */\n.topic-list-item .activity {\n  font-size: 12px !important;\n  color: var(--text-strong) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n  text-align: right !important;\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n}\n\n/* Search results reuse the home page's five-column document-list language. */\nbody.qqdocs-search-page .search-container,\nbody.qqdocs-search-page .search-advanced,\nbody.qqdocs-search-page .search-results {\n  width: 100% !important;\n  max-width: none !important;\n}\n\n/* Discourse gives the labelled results region large responsive gutters. With\n   width: 100% and content-box sizing those gutters also expand it past the\n   available workspace, so keep this list flush with its parent instead. */\nbody.qqdocs-search-page div.search-results[role=\"region\"][aria-label] {\n  padding-inline: 0 !important;\n  box-sizing: border-box !important;\n}\n\nbody.qqdocs-search-page .search-results .fps-result-entries {\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: 0 !important;\n}\n\n.qqdocs-search-list-header,\nbody.qqdocs-search-page .fps-result {\n  display: grid !important;\n  grid-template-columns: minmax(0, 50fr) minmax(0, 13fr) minmax(0, 12fr) minmax(0, 13fr) minmax(0, 12fr) !important;\n  align-items: center !important;\n  width: 100% !important;\n  box-sizing: border-box !important;\n}\n\n.qqdocs-search-list-header {\n  min-height: 37px !important;\n  border-bottom: 1px solid var(--border-weak) !important;\n  color: var(--text-strong) !important;\n  font-size: var(--font-size-caption) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-caption) !important;\n}\n\n.qqdocs-search-list-header > span {\n  min-width: 0 !important;\n  padding: 10px 8px !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n}\n\n.qqdocs-search-list-header > span:last-child { text-align: right !important; }\n\nbody.qqdocs-search-page .fps-result {\n  position: relative !important;\n  height: 56px !important;\n  min-height: 56px !important;\n  grid-template-rows: 56px !important;\n  grid-auto-rows: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: 0 !important;\n  border-bottom: 1px solid #f7f8fa !important;\n  background: #fff !important;\n  font-size: var(--font-size-body) !important;\n  line-height: var(--line-height-body) !important;\n  transition: background-color 0.1s ease !important;\n}\n\nbody.qqdocs-search-page .fps-result:hover { background: #f7f8fa !important; }\n\nbody.qqdocs-search-page .fps-result > .qqdocs-search-row-icon {\n  position: absolute !important;\n  left: 8px !important;\n  top: 16px !important;\n  z-index: 1 !important;\n  display: inline-flex !important;\n  width: 24px !important;\n  height: 24px !important;\n  align-items: center !important;\n  justify-content: center !important;\n  pointer-events: none !important;\n}\n\nbody.qqdocs-search-page .fps-result > .fps-topic,\nbody.qqdocs-search-page .fps-result > .fps-topic > .topic,\nbody.qqdocs-search-page .fps-result > .fps-topic > .blurb {\n  display: contents !important;\n}\n\nbody.qqdocs-search-page .fps-result .search-link {\n  grid-column: 1 !important;\n  grid-row: 1 !important;\n  align-self: center !important;\n  min-width: 0 !important;\n  padding: 0 8px 0 40px !important;\n  display: block !important;\n  overflow: hidden !important;\n  color: var(--text-ultrastrong) !important;\n  font-size: 14px !important;\n  font-weight: 400 !important;\n  line-height: var(--line-height-title) !important;\n  text-decoration: none !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n}\n\nbody.qqdocs-search-page .fps-result .search-link:hover { color: var(--accent-default) !important; }\n\nbody.qqdocs-search-page .fps-result .topic-title,\nbody.qqdocs-search-page .fps-result .topic-title > span,\nbody.qqdocs-search-page .fps-result .topic-title [dir=\"auto\"],\nbody.qqdocs-search-page .fps-result .topic-title .search-highlight {\n  display: inline !important;\n  font-size: var(--font-size-body) !important;\n  line-height: var(--line-height-body) !important;\n  white-space: nowrap !important;\n}\n\nbody.qqdocs-search-page .fps-result > .author {\n  grid-column: 2 !important;\n  grid-row: 1 !important;\n  align-self: center !important;\n  min-width: 0 !important;\n  padding: 0 8px !important;\n}\n\nbody.qqdocs-search-page .fps-result > .author a {\n  display: block !important;\n  min-width: 0 !important;\n  overflow: hidden !important;\n  color: var(--text-strong) !important;\n  font-size: var(--font-size-caption) !important;\n  line-height: var(--line-height-caption) !important;\n  text-decoration: none !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n}\n\nbody.qqdocs-search-page .fps-result > .author img.avatar { display: none !important; }\n\nbody.qqdocs-search-page .fps-result .search-category {\n  grid-column: 3 !important;\n  grid-row: 1 !important;\n  align-self: center !important;\n  min-width: 0 !important;\n  padding: 0 8px !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n}\n\nbody.qqdocs-search-page .fps-result .search-category .badge-category__wrapper {\n  color: var(--text-strong) !important;\n  font-size: var(--font-size-caption) !important;\n  line-height: var(--line-height-caption) !important;\n  text-decoration: none !important;\n}\n\nbody.qqdocs-search-page .fps-result .search-category .badge-category svg,\nbody.qqdocs-search-page .fps-result .search-category .discourse-tags,\nbody.qqdocs-search-page .fps-result .topic-statuses,\nbody.qqdocs-search-page .fps-result > .ai-result__icon {\n  display: none !important;\n}\n\nbody.qqdocs-search-page .fps-result .blurb > .date {\n  grid-column: 4 !important;\n  grid-row: 1 !important;\n  align-self: center !important;\n  min-width: 0 !important;\n  padding: 0 8px !important;\n  overflow: hidden !important;\n  color: var(--text-strong) !important;\n  font-size: var(--font-size-caption) !important;\n  line-height: var(--line-height-caption) !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n}\n\nbody.qqdocs-search-page .fps-result .blurb > .date .separator { display: none !important; }\n\nbody.qqdocs-search-page .fps-result .blurb > span:not(.date) {\n  grid-column: 5 !important;\n  grid-row: 1 !important;\n  align-self: center !important;\n  min-width: 0 !important;\n  padding: 0 8px !important;\n  overflow: hidden !important;\n  color: var(--text-strong) !important;\n  font-size: var(--font-size-caption) !important;\n  line-height: var(--line-height-caption) !important;\n  text-align: right !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n}\n\nbody.qqdocs-search-page .fps-result .blurb img { display: none !important; }\n\n/* --- page-shells.css --- */\n/* Secondary Discourse routes shaped into Tencent Docs workspace surfaces. */\n\nbody.qqdocs-page-secondary #main-outlet > section,\nbody.qqdocs-page-secondary #main-outlet > .container:not(.list-container):not(:has(.desktop-home-page-tab-header-pc)),\nbody.qqdocs-page-secondary #main-outlet .contents.body-page,\nbody.qqdocs-page-secondary #main-outlet .user-main,\nbody.qqdocs-page-secondary #main-outlet .groups-index,\nbody.qqdocs-page-secondary #main-outlet .tags-index {\n  width: 100% !important;\n  max-width: none !important;\n  box-sizing: border-box !important;\n}\n\nbody.qqdocs-page-secondary #main-outlet h1,\nbody.qqdocs-page-secondary #main-outlet h2,\nbody.qqdocs-page-secondary #main-outlet h3 {\n  color: #1f2329 !important;\n  letter-spacing: normal !important;\n}\n\nbody.qqdocs-page-secondary #main-outlet a {\n  text-decoration: none !important;\n}\n\nbody.qqdocs-page-secondary #main-outlet input:not([type='checkbox']):not([type='radio']),\nbody.qqdocs-page-secondary #main-outlet textarea,\nbody.qqdocs-page-secondary #main-outlet select,\nbody.qqdocs-page-secondary #main-outlet .select-kit-header {\n  min-height: 34px !important;\n  padding: 7px 10px !important;\n  border: 1px solid #dee0e3 !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n  color: #1f2329 !important;\n  box-shadow: none !important;\n  box-sizing: border-box !important;\n}\n\nbody.qqdocs-page-secondary #main-outlet input:focus,\nbody.qqdocs-page-secondary #main-outlet textarea:focus,\nbody.qqdocs-page-secondary #main-outlet .select-kit.is-expanded .select-kit-header {\n  border-color: #2a65f5 !important;\n  box-shadow: 0 0 0 2px rgba(42, 101, 245, .12) !important;\n  outline: none !important;\n}\n\nbody.qqdocs-page-secondary #main-outlet .btn,\nbody.qqdocs-page-secondary #main-outlet button {\n  min-height: 32px;\n  border-radius: 4px !important;\n  box-shadow: none !important;\n  font-size: 13px !important;\n}\n\nbody.qqdocs-page-secondary #main-outlet .btn-primary,\nbody.qqdocs-page-secondary #main-outlet button.btn-primary {\n  color: #fff !important;\n  border-color: #2a65f5 !important;\n  background: #2a65f5 !important;\n}\n\n/* Category index becomes a single workspace table instead of a forum split view. */\nbody.qqdocs-page-categories .categories-and-latest {\n  display: block !important;\n  width: 100% !important;\n}\n\nbody.qqdocs-page-categories .categories-and-latest > .column.categories {\n  width: 100% !important;\n  max-width: none !important;\n  padding: 0 !important;\n}\n\nbody.qqdocs-page-categories .categories-and-latest > .column:not(.categories),\nbody.qqdocs-page-categories .category-list + *,\nbody.qqdocs-page-categories .category-list .category-logo,\nbody.qqdocs-page-categories .category-list.subcategories-with-subcategories .category-logo {\n  display: none !important;\n}\n\nbody.qqdocs-page-categories .category-list {\n  width: 100% !important;\n  table-layout: fixed !important;\n  border-collapse: collapse !important;\n  background: #fff !important;\n  border: 0 !important;\n}\n\nbody.qqdocs-page-categories .category-list-header tr,\nbody.qqdocs-page-categories .category-list > tbody > tr {\n  border-bottom: 1px solid #eff0f2 !important;\n}\n\nbody.qqdocs-page-categories .category-list-header th {\n  height: 38px !important;\n  padding: 0 14px !important;\n  color: #646a73 !important;\n  background: transparent !important;\n  border: 0 !important;\n  font-size: 12px !important;\n  font-weight: 400 !important;\n  text-align: left !important;\n}\n\nbody.qqdocs-page-categories .category-list-header th.category { width: auto !important; }\nbody.qqdocs-page-categories .category-list-header th.topics { width: 150px !important; text-align: right !important; }\n\nbody.qqdocs-page-categories .category-list > tbody > tr:hover {\n  background: #f7f8fa !important;\n}\n\nbody.qqdocs-page-categories .category-list > tbody > tr > td.category {\n  position: relative !important;\n  min-height: 76px !important;\n  padding: 16px 16px 16px 56px !important;\n  border: 0 !important;\n  box-sizing: border-box !important;\n}\n\nbody.qqdocs-page-categories .category-list > tbody > tr > td.category::before {\n  content: '';\n  position: absolute;\n  left: 16px;\n  top: 20px;\n  width: 24px;\n  height: 24px;\n  border-radius: 3px;\n  background: #2a65f5;\n  box-shadow: inset 0 -5px 0 rgba(255,255,255,.13);\n}\n\nbody.qqdocs-page-categories .category-list > tbody > tr > td.category::after {\n  content: '';\n  position: absolute;\n  left: 22px;\n  top: 26px;\n  width: 12px;\n  height: 9px;\n  border-top: 2px solid #fff;\n  border-bottom: 2px solid #fff;\n  opacity: .9;\n}\n\nbody.qqdocs-page-categories .category-title-link,\nbody.qqdocs-page-categories .category-name {\n  color: #1f2329 !important;\n  font-size: 14px !important;\n  font-weight: 500 !important;\n  line-height: 20px !important;\n}\n\nbody.qqdocs-page-categories .category-description {\n  margin: 4px 0 0 !important;\n  color: #8f959e !important;\n  font-size: 12px !important;\n  line-height: 18px !important;\n}\n\nbody.qqdocs-page-categories .subcategories {\n  display: flex !important;\n  flex-wrap: wrap !important;\n  gap: 4px !important;\n  margin-top: 6px !important;\n}\n\nbody.qqdocs-page-categories .subcategory .badge-category {\n  padding: 2px 6px !important;\n  border: 0 !important;\n  border-radius: 3px !important;\n  background: #f2f3f5 !important;\n  color: #646a73 !important;\n  font-size: 11px !important;\n}\n\nbody.qqdocs-page-categories .category-list > tbody > tr > td.topics {\n  width: 150px !important;\n  padding: 16px 14px !important;\n  color: #646a73 !important;\n  border: 0 !important;\n  font-size: 12px !important;\n  font-weight: 400 !important;\n  text-align: right !important;\n  vertical-align: middle !important;\n}\n\nbody.qqdocs-page-categories .category-list.subcategories-with-subcategories {\n  margin: 8px 0 0 !important;\n  border: 0 !important;\n}\n\nbody.qqdocs-page-categories .category-list.subcategories-with-subcategories td.category {\n  min-height: 0 !important;\n  padding: 4px 0 !important;\n}\n\nbody.qqdocs-page-categories .category-list.subcategories-with-subcategories td.category::before,\nbody.qqdocs-page-categories .category-list.subcategories-with-subcategories td.category::after {\n  display: none !important;\n}\n\n/* Tags are represented as compact document labels inside section cards. */\nbody.qqdocs-page-tags .tags-index .tags-controls h2,\nbody.qqdocs-page-badges .badges > h1,\nbody.qqdocs-page-groups .groups-index > h1,\nbody.qqdocs-page-users .users-directory > h1 {\n  margin: 6px 0 18px !important;\n  font-size: 20px !important;\n  font-weight: 600 !important;\n}\n\nbody.qqdocs-page-tags .tags-index .tag-list {\n  display: grid !important;\n  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;\n  gap: 8px !important;\n  margin: 8px 0 22px !important;\n  padding: 0 !important;\n  border: 0 !important;\n}\n\nbody.qqdocs-page-tags .tags-index .tag-list > h3 {\n  grid-column: 1 / -1 !important;\n  margin: 10px 0 2px !important;\n  font-size: 15px !important;\n  font-weight: 600 !important;\n}\n\nbody.qqdocs-page-tags .tags-index .tag-box {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  min-width: 0 !important;\n  min-height: 42px !important;\n  margin: 0 !important;\n  padding: 8px 10px !important;\n  border: 1px solid #eff0f2 !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n  box-sizing: border-box !important;\n  grid-column: auto !important;\n  width: auto !important;\n}\n\nbody.qqdocs-page-tags .tags-index .tag-box:hover {\n  border-color: #c9d7fb !important;\n  background: #f7f9ff !important;\n}\n\nbody.qqdocs-page-tags .tag-box .discourse-tag {\n  overflow: hidden !important;\n  color: #1f2329 !important;\n  background: transparent !important;\n  font-size: 13px !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n}\n\nbody.qqdocs-page-tags .tag-box .tag-count {\n  color: #8f959e !important;\n  font-size: 11px !important;\n  white-space: nowrap !important;\n}\n\n/* Badges resemble reusable templates rather than forum trophies. */\nbody.qqdocs-page-badges .badge-grouping {\n  margin: 0 0 26px !important;\n}\n\nbody.qqdocs-page-badges .badge-grouping-title {\n  margin: 0 0 10px !important;\n  color: #454d5a !important;\n  font-size: 16px !important;\n  font-weight: 600 !important;\n}\n\nbody.qqdocs-page-badges .badge-card {\n  min-height: 124px !important;\n  padding: 18px !important;\n  border: 1px solid #eff0f2 !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n  box-shadow: none !important;\n}\n\nbody.qqdocs-page-badges .badge-card:hover {\n  border-color: #c9d7fb !important;\n  background: #f9faff !important;\n}\n\nbody.qqdocs-page-badges .badge-card .badge-icon,\nbody.qqdocs-page-badges .badge-card .d-icon,\nbody.qqdocs-page-badges .badge-card svg {\n  color: #2a65f5 !important;\n  fill: #2a65f5 !important;\n}\n\nbody.qqdocs-page-badges .badge-card svg * {\n  fill: #2a65f5 !important;\n}\n\nbody.qqdocs-page-badges .badge-card h3,\nbody.qqdocs-page-badges .badge-card .badge-card__title {\n  font-size: 14px !important;\n  font-weight: 600 !important;\n}\n\n/* People and groups use the same restrained cloud-workspace cards. */\nbody.qqdocs-page-groups .groups-boxes {\n  display: grid !important;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;\n  gap: 12px !important;\n}\n\nbody.qqdocs-page-groups .group-box,\nbody.qqdocs-page-group .group-details-container,\nbody.qqdocs-page-users .users-directory .directory-table-container,\nbody.qqdocs-page-users .users-directory table {\n  border: 1px solid #eff0f2 !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n  box-shadow: none !important;\n}\n\nbody.qqdocs-page-groups .group-box {\n  min-height: 154px !important;\n  margin: 0 !important;\n  padding: 18px !important;\n  box-sizing: border-box !important;\n}\n\nbody.qqdocs-page-groups .group-box:hover { border-color: #c9d7fb !important; }\nbody.qqdocs-page-groups .group-box .group-box-inner { padding: 0 !important; }\nbody.qqdocs-page-groups .group-box h2 { font-size: 16px !important; font-weight: 600 !important; }\nbody.qqdocs-page-groups .group-box .group-user-count { color: #8f959e !important; }\n\nbody.qqdocs-page-users .users-directory table {\n  width: 100% !important;\n  border-collapse: collapse !important;\n}\n\nbody.qqdocs-page-users .users-directory th {\n  padding: 10px 14px !important;\n  color: #646a73 !important;\n  background: #fafbfc !important;\n  font-size: 12px !important;\n  font-weight: 400 !important;\n  text-align: left !important;\n}\n\nbody.qqdocs-page-users .users-directory td {\n  padding: 12px 14px !important;\n  border-top: 1px solid #eff0f2 !important;\n  font-size: 13px !important;\n}\n\n/* Profile, activity, bookmarks, messages and settings. */\nbody.qqdocs-page-user .user-main,\nbody.qqdocs-page-preferences .user-main,\nbody.qqdocs-page-bookmarks .user-main,\nbody.qqdocs-page-notifications .user-main,\nbody.qqdocs-page-messages .user-main {\n  color: #1f2329 !important;\n}\n\nbody.qqdocs-page-user .user-main .about,\nbody.qqdocs-page-preferences .user-main .about,\nbody.qqdocs-page-bookmarks .user-main .about,\nbody.qqdocs-page-notifications .user-main .about,\nbody.qqdocs-page-messages .user-main .about {\n  margin-bottom: 16px !important;\n  padding: 16px 18px !important;\n  border: 1px solid #eff0f2 !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n}\n\nbody.qqdocs-page-user .user-navigation,\nbody.qqdocs-page-preferences .user-navigation,\nbody.qqdocs-page-bookmarks .user-navigation,\nbody.qqdocs-page-notifications .user-navigation,\nbody.qqdocs-page-messages .user-navigation {\n  border-bottom: 1px solid #eff0f2 !important;\n  background: transparent !important;\n}\n\nbody.qqdocs-page-user .user-stream-item,\nbody.qqdocs-page-bookmarks .user-stream-item,\nbody.qqdocs-page-notifications .user-notifications-list li,\nbody.qqdocs-page-messages .user-stream-item {\n  padding: 18px 12px !important;\n  border-bottom: 1px solid #eff0f2 !important;\n  background: #fff !important;\n}\n\nbody.qqdocs-page-user .user-stream-item:hover,\nbody.qqdocs-page-bookmarks .user-stream-item:hover,\nbody.qqdocs-page-messages .user-stream-item:hover {\n  background: #f7f8fa !important;\n}\n\nbody.qqdocs-page-preferences .user-content {\n  max-width: 1040px !important;\n  padding: 8px 0 40px !important;\n}\n\nbody.qqdocs-page-preferences .control-group,\nbody.qqdocs-page-preferences .pref-avatar,\nbody.qqdocs-page-preferences .form-vertical > .control-group {\n  margin: 0 0 12px !important;\n  padding: 18px !important;\n  border: 1px solid #eff0f2 !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n}\n\nbody.qqdocs-page-preferences .control-label,\nbody.qqdocs-page-preferences label {\n  color: #454d5a !important;\n  font-size: 13px !important;\n  font-weight: 500 !important;\n}\n\nbody.qqdocs-page-preferences .instructions {\n  color: #8f959e !important;\n  font-size: 12px !important;\n}\n\n/* About and policy pages are presented as workspace documents. */\nbody.qqdocs-page-about #main-outlet,\nbody.qqdocs-page-static #main-outlet {\n  background: #f5f6f7 !important;\n}\n\nbody.qqdocs-page.qqdocs-page-about #main-outlet .contents.body-page,\nbody.qqdocs-page.qqdocs-page-static #main-outlet .contents.body-page,\nbody.qqdocs-page.qqdocs-page-static #main-outlet > section > .container {\n  width: calc(100% - 48px) !important;\n  max-width: 1120px !important;\n  margin: 0 auto !important;\n  padding: 34px 52px 60px !important;\n  border: 1px solid #e8e9eb !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n  box-shadow: 0 1px 3px rgba(31,35,41,.04) !important;\n}\n\nbody.qqdocs-page-about .about__banner {\n  display: none !important;\n}\n\nbody.qqdocs-page-about .about__header {\n  position: relative !important;\n  min-height: 84px !important;\n  margin: 0 0 20px !important;\n  padding: 18px 20px 18px 76px !important;\n  border: 1px solid #e8edfb !important;\n  border-radius: 6px !important;\n  background: linear-gradient(135deg, #f3f7ff 0%, #fbfcff 100%) !important;\n  box-sizing: border-box !important;\n}\n\nbody.qqdocs-page-about .about__header::before {\n  content: 'T';\n  position: absolute;\n  left: 20px;\n  top: 18px;\n  display: grid;\n  place-items: center;\n  width: 44px;\n  height: 44px;\n  border-radius: 6px;\n  color: #fff;\n  background: #2a65f5;\n  font-size: 24px;\n  font-weight: 700;\n}\n\nbody.qqdocs-page-about .about__header h1 {\n  margin: 0 0 4px !important;\n  font-size: 20px !important;\n  font-weight: 600 !important;\n}\n\nbody.qqdocs-page-about .about__header .short-description {\n  margin: 0 !important;\n  color: #646a73 !important;\n  font-size: 13px !important;\n}\n\nbody.qqdocs-page-about .about__stats {\n  display: grid !important;\n  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;\n  gap: 8px !important;\n  margin: 0 0 22px !important;\n  padding: 0 !important;\n  border: 0 !important;\n}\n\nbody.qqdocs-page-about .about__stats-item {\n  padding: 12px !important;\n  border-radius: 4px !important;\n  background: #f7f8fa !important;\n  color: #454d5a !important;\n  font-size: 12px !important;\n}\n\nbody.qqdocs-page-about .about__main-content {\n  display: grid !important;\n  grid-template-columns: minmax(0, 1fr) !important;\n  gap: 0 !important;\n}\n\nbody.qqdocs-page-about .about__right-side {\n  display: none !important;\n}\n\nbody.qqdocs-page-about .about-page-users-list {\n  display: grid !important;\n  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)) !important;\n  gap: 8px !important;\n}\n\nbody.qqdocs-page-about .about-page-users-list .user-info {\n  margin: 0 !important;\n  padding: 10px !important;\n  border: 1px solid #eff0f2 !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n}\n\nbody.qqdocs-page-static .body-page {\n  color: #1f2329 !important;\n  font-size: 14px !important;\n  line-height: 1.75 !important;\n}\n\nbody.qqdocs-page-static .body-page h1 { font-size: 24px !important; }\nbody.qqdocs-page-static .body-page h2 { margin-top: 28px !important; font-size: 19px !important; }\nbody.qqdocs-page-static .body-page h3 { margin-top: 22px !important; font-size: 16px !important; }\nbody.qqdocs-page-static .body-page blockquote {\n  margin: 16px 0 !important;\n  padding: 12px 16px !important;\n  border-left: 3px solid #2a65f5 !important;\n  background: #f7f9ff !important;\n  color: #454d5a !important;\n}\n\n/* Authentication, review, chat and unknown routes still receive a safe panel. */\nbody.qqdocs-page-auth #main-outlet > *,\nbody.qqdocs-page-review #main-outlet > *,\nbody.qqdocs-page-chat #main-outlet > *,\nbody.qqdocs-page-error #main-outlet > *,\nbody.qqdocs-page-generic #main-outlet > * {\n  max-width: 1120px !important;\n  margin-left: auto !important;\n  margin-right: auto !important;\n}\n\nbody.qqdocs-page-auth .login-welcome-header,\nbody.qqdocs-page-auth .login-form,\nbody.qqdocs-page-error .page-not-found,\nbody.qqdocs-page-generic #main-outlet > section {\n  padding: 28px !important;\n  border: 1px solid #eff0f2 !important;\n  border-radius: 6px !important;\n  background: #fff !important;\n  box-shadow: 0 1px 3px rgba(31,35,41,.04) !important;\n}\n\nbody.qqdocs-page-error #main-outlet {\n  padding-top: 36px !important;\n  background: #f5f6f7 !important;\n}\n\nbody.qqdocs-page-error .page-not-found {\n  width: calc(100% - 48px) !important;\n  max-width: 1120px !important;\n  margin: 0 auto 20px !important;\n  padding: 34px 44px !important;\n  border: 1px solid #e8e9eb !important;\n  background: #fff !important;\n  box-sizing: border-box !important;\n}\n\nbody.qqdocs-page-error .page-not-found .heading {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  min-height: 72px !important;\n}\n\nbody.qqdocs-page-error .page-not-found .illustration-not-found {\n  display: none !important;\n}\n\nbody.qqdocs-page-error .page-not-found .title_wrapper,\nbody.qqdocs-page-error .page-not-found .title {\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nbody.qqdocs-page-error .page-not-found .title {\n  font-size: 22px !important;\n  font-weight: 600 !important;\n}\n\nbody.qqdocs-page-error .page-not-found-search {\n  margin-top: 22px !important;\n  padding: 20px !important;\n  border: 1px solid #e8edfb !important;\n  border-radius: 4px !important;\n  background: #f7f9ff !important;\n}\n\nbody.qqdocs-page-error .page-not-found-topics {\n  width: calc(100% - 48px) !important;\n  max-width: 1120px !important;\n  margin: 0 auto !important;\n  padding: 24px !important;\n  border: 1px solid #eff0f2 !important;\n  border-radius: 4px !important;\n  background: #fff !important;\n  box-sizing: border-box !important;\n}\n\n@media (max-width: 900px) {\n  body.qqdocs-page-about .about__main-content { grid-template-columns: 1fr !important; }\n  body.qqdocs-page-about .about__stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }\n  body.qqdocs-page.qqdocs-page-about #main-outlet .contents.body-page,\n  body.qqdocs-page.qqdocs-page-static #main-outlet .contents.body-page,\n  body.qqdocs-page.qqdocs-page-static #main-outlet > section > .container { padding: 24px !important; }\n}\n\n@media (max-width: 640px) {\n  body.qqdocs-page-tags .tags-index .tag-list { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }\n  body.qqdocs-page-categories .category-list-header th.topics,\n  body.qqdocs-page-categories .category-list > tbody > tr > td.topics { width: 86px !important; }\n  body.qqdocs-page-categories .category-description { display: none !important; }\n}\n\n/* --- topic-detail.css --- */\n/* Tencent Docs document shell for topic detail pages. */\nbody.qqdocs-topic-detail {\n  --qqdocs-editor-top: 150px;\n  background: #f3f5f7 !important;\n}\n\n/* A topic has its own document chrome; the forum chrome is not shown here. */\nbody.qqdocs-topic-detail .d-header,\nbody.qqdocs-topic-detail .desktop-layout-sidebar-pc {\n  display: none !important;\n}\n\nbody.qqdocs-topic-detail .qqdocs-doc-toolbar {\n  display: none !important;\n  width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: 0 !important;\n}\n\nbody.qqdocs-topic-detail,\nbody.qqdocs-topic-detail #main,\nbody.qqdocs-topic-detail #main-outlet-wrapper,\nbody.qqdocs-topic-detail #main-outlet,\nbody.qqdocs-topic-detail .container.posts {\n  background: #f3f5f7 !important;\n}\n\nbody.qqdocs-topic-detail #main-outlet-wrapper,\nbody.qqdocs-topic-detail #main-outlet-wrapper.wrap {\n  width: 100vw !important;\n  max-width: 100vw !important;\n  min-height: 100vh !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nbody.qqdocs-topic-detail #main-outlet {\n  width: 100% !important;\n  max-width: none !important;\n  min-height: 100vh !important;\n  margin: 0 !important;\n  padding: calc(var(--qqdocs-editor-top) + 12px) 32px 72px !important;\n  box-sizing: border-box !important;\n}\n\n/* Discourse mounts the topic route in a generated .regular.ember-view wrapper.\n   Keep that full-width wrapper on the editor canvas instead of its white default. */\nbody.qqdocs-topic-detail #main-outlet > .regular.ember-view {\n  background: #f3f5f7 !important;\n}\n\nbody.qqdocs-topic-detail .container.posts {\n  display: block !important;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\n\n/* Three non-interactive rows: titlebar, menu tabs, and the ribbon. */\n.qqdocs-editor-shell {\n  position: fixed !important;\n  inset: 0 0 auto 0 !important;\n  z-index: 1400 !important;\n  height: var(--qqdocs-editor-top) !important;\n  overflow: hidden !important;\n  background: #f3f5f7 !important;\n  color: #1f2329 !important;\n  border-bottom: 1px solid #dfe2e7 !important;\n  box-sizing: border-box !important;\n  font-family: var(--font-family) !important;\n  pointer-events: none !important;\n  user-select: none !important;\n}\n\n.qqdocs-editor-titlebar {\n  height: 40px !important;\n  padding: 0 12px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  box-sizing: border-box !important;\n  font-size: 13px !important;\n}\n\n.qqdocs-editor-title-left,\n.qqdocs-editor-title-actions {\n  display: flex !important;\n  align-items: center !important;\n  min-width: 0 !important;\n}\n\n.qqdocs-editor-title-left {\n  height: 40px !important;\n  margin-right: 16px !important;\n  flex: 1 1 auto !important;\n  overflow: hidden !important;\n}\n\n.qqdocs-editor-title-left > .qqdocs-editor-home {\n  width: 28px !important;\n  height: 28px !important;\n  margin-right: 4px !important;\n  padding: 0 !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  flex: 0 0 28px !important;\n  border: 0 !important;\n  border-radius: 4px !important;\n  background: transparent !important;\n  color: inherit !important;\n  cursor: pointer !important;\n  pointer-events: auto !important;\n  appearance: none !important;\n}\n\n.qqdocs-editor-title-left > .qqdocs-editor-home:hover {\n  background: rgba(51, 77, 102, 0.06) !important;\n}\n\n.qqdocs-editor-title-left > .qqdocs-editor-home:focus-visible {\n  outline: 2px solid rgba(30, 111, 255, 0.5) !important;\n  outline-offset: 1px !important;\n}\n\n.qqdocs-editor-title-left > .qqdocs-editor-plus {\n  width: 24px !important;\n  height: 24px !important;\n  margin-right: 8px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  flex: 0 0 24px !important;\n}\n\n.qqdocs-editor-divider {\n  width: 1px !important;\n  height: 16px !important;\n  margin-right: 8px !important;\n  display: inline-block !important;\n  flex: 0 0 1px !important;\n  background: #dfe2e7 !important;\n}\n\n.qqdocs-editor-title-text {\n  min-width: 0 !important;\n  flex: 0 1 auto !important;\n  max-width: min(560px, 42vw) !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n  color: #1f2329 !important;\n  font-size: 16px !important;\n  font-weight: 600 !important;\n  line-height: 28px !important;\n}\n\n.qqdocs-editor-readonly {\n  height: 24px !important;\n  margin-left: 12px !important;\n  padding: 0 7px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 4px !important;\n  flex: 0 0 auto !important;\n  background: #fff !important;\n  border: 1px solid #d8dce3 !important;\n  border-radius: 3px !important;\n  box-sizing: border-box !important;\n  color: #646a73 !important;\n  font-size: 12px !important;\n  line-height: 22px !important;\n}\n\n.qqdocs-editor-star,\n.qqdocs-editor-folder {\n  width: 24px !important;\n  height: 24px !important;\n  margin-left: 4px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  flex: 0 0 24px !important;\n}\n\n.qqdocs-editor-title-actions {\n  height: 40px !important;\n  gap: 16px !important;\n  flex: 0 0 auto !important;\n  color: #454d5a !important;\n}\n\n.qqdocs-editor-action,\n.qqdocs-editor-collaborator {\n  width: 24px !important;\n  height: 24px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  position: relative !important;\n  flex: 0 0 24px !important;\n}\n\n.qqdocs-editor-presentation {\n  width: 28px !important;\n  height: 28px !important;\n  flex-basis: 28px !important;\n}\n\n.qqdocs-editor-collaborator sup {\n  position: absolute !important;\n  top: -4px !important;\n  right: -3px !important;\n  color: #454d5a !important;\n  font-size: 11px !important;\n  font-weight: 400 !important;\n  line-height: 12px !important;\n}\n\n.qqdocs-editor-share {\n  width: 56px !important;\n  height: 28px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  flex: 0 0 56px !important;\n  background: #1e6fff !important;\n  border-radius: 4px !important;\n  box-sizing: border-box !important;\n  color: #fff !important;\n  font-size: 13px !important;\n  line-height: 28px !important;\n}\n\n.qqdocs-editor-account {\n  width: 28px !important;\n  height: 28px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  position: relative !important;\n  flex: 0 0 28px !important;\n  background: #fff !important;\n  border: 1px solid #e5e7eb !important;\n  border-radius: 50% !important;\n  box-sizing: border-box !important;\n}\n\n.qqdocs-editor-account > .qqdocs-chrome-icon:first-child { color: #454d5a !important; }\n\n.qqdocs-editor-account > .qqdocs-chrome-icon:last-child {\n  position: absolute !important;\n  right: -2px !important;\n  bottom: -2px !important;\n}\n\n.qqdocs-editor-tabs {\n  height: 40px !important;\n  padding: 0 9px !important;\n  display: flex !important;\n  align-items: flex-end !important;\n  gap: 26px !important;\n  box-sizing: border-box !important;\n  color: #3c424a !important;\n  font-size: 12px !important;\n  line-height: 32px !important;\n}\n\n.qqdocs-editor-tabs > span {\n  height: 32px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  position: relative !important;\n  white-space: nowrap !important;\n}\n\n.qqdocs-editor-tabs > span.is-active {\n  color: #1f2329 !important;\n  font-weight: 600 !important;\n}\n\n.qqdocs-editor-tabs > span.is-active::after {\n  content: \"\" !important;\n  position: absolute !important;\n  left: 0 !important;\n  right: 0 !important;\n  bottom: 0 !important;\n  height: 2px !important;\n  background: #1e6fff !important;\n  border-radius: 2px !important;\n}\n\n.qqdocs-editor-ribbon {\n  height: 70px !important;\n  margin: 0 8px !important;\n  padding: 8px 10px !important;\n  display: flex !important;\n  align-items: stretch !important;\n  gap: 0 !important;\n  overflow: hidden !important;\n  background: #fff !important;\n  border: 1px solid #e1e4e8 !important;\n  border-radius: 8px 8px 0 0 !important;\n  box-shadow: 0 1px 5px rgba(31, 35, 41, 0.08) !important;\n  box-sizing: border-box !important;\n  color: #454d5a !important;\n}\n\n.qqdocs-ribbon-group {\n  min-width: 0 !important;\n  padding: 0 10px !important;\n  display: flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  border-right: 1px solid #eceef1 !important;\n  box-sizing: border-box !important;\n  white-space: nowrap !important;\n}\n\n.qqdocs-ribbon-group > span {\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  flex: 0 0 auto !important;\n}\n\n.qqdocs-ribbon-history {\n  width: 82px !important;\n  padding: 0 5px !important;\n  flex-wrap: wrap !important;\n  align-content: center !important;\n  column-gap: 8px !important;\n  row-gap: 0 !important;\n}\n\n.qqdocs-ribbon-insert-group {\n  width: 62px !important;\n  padding: 0 7px !important;\n}\n\n.qqdocs-ribbon-labeled {\n  flex-direction: column !important;\n  gap: 1px !important;\n  color: #454d5a !important;\n  font-size: 11px !important;\n  line-height: 14px !important;\n}\n\n.qqdocs-ribbon-font {\n  width: 348px !important;\n  padding: 0 8px !important;\n  flex-wrap: wrap !important;\n  align-content: center !important;\n  gap: 4px 8px !important;\n}\n\n.qqdocs-ribbon-select,\n.qqdocs-ribbon-size {\n  height: 24px !important;\n  padding: 0 7px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  gap: 7px !important;\n  background: #f5f6f7 !important;\n  border-radius: 3px !important;\n  box-sizing: border-box !important;\n  color: #454d5a !important;\n  font-size: 12px !important;\n  line-height: 24px !important;\n}\n\n.qqdocs-ribbon-select { width: 116px !important; }\n.qqdocs-ribbon-size { width: 56px !important; }\n\n.qqdocs-ribbon-paragraph {\n  width: 272px !important;\n  padding: 0 8px !important;\n  flex-wrap: wrap !important;\n  align-content: center !important;\n  gap: 4px 8px !important;\n}\n\n.qqdocs-ribbon-styles {\n  width: 408px !important;\n  padding: 0 8px !important;\n  gap: 4px !important;\n}\n\n.qqdocs-ribbon-styles > span {\n  width: 61px !important;\n  height: 36px !important;\n  padding: 0 5px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  background: #f7f8fa !important;\n  border-radius: 3px !important;\n  box-sizing: border-box !important;\n  color: #646a73 !important;\n  font-size: 12px !important;\n}\n\n.qqdocs-ribbon-styles > span.is-selected {\n  background: #fff !important;\n  border: 1px solid #7db0ff !important;\n  color: #1f2329 !important;\n}\n\n.qqdocs-ribbon-tools {\n  width: 390px !important;\n  padding: 0 8px !important;\n  gap: 12px !important;\n  color: #454d5a !important;\n  font-size: 12px !important;\n}\n\n.qqdocs-ribbon-tools > span { gap: 3px !important; }\n\n.qqdocs-ribbon-search {\n  min-width: 64px !important;\n  margin-left: auto !important;\n  padding: 0 8px 0 14px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: flex-end !important;\n  gap: 8px !important;\n  color: #646a73 !important;\n}\n\n/* All icon wrappers are inert inline SVGs captured from the reference shell. */\n.qqdocs-chrome-icon {\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  flex: 0 0 auto !important;\n  color: currentColor !important;\n}\n\n.qqdocs-chrome-icon > svg {\n  width: 100% !important;\n  height: 100% !important;\n  display: block !important;\n  overflow: visible !important;\n}\n\n/* The native title stays in the DOM as a source for the shell, but is not part\n   of the document paper. */\nbody.qqdocs-topic-detail #topic-title {\n  display: none !important;\n}\n\n/* The post stream is one continuous 794px document page. */\nbody.qqdocs-topic-detail .topic-area {\n  width: min(794px, calc(100% - 48px)) !important;\n  max-width: 794px !important;\n  margin-left: auto !important;\n  margin-right: auto !important;\n  min-height: calc(100vh - var(--qqdocs-editor-top) - 84px) !important;\n  box-sizing: border-box !important;\n  background: #fff !important;\n  padding: 46px 56px 70px !important;\n  border: 1px solid rgba(0, 0, 0, 0.09) !important;\n  border-radius: 2px !important;\n  box-shadow: 0 4px 16px rgba(31, 35, 41, 0.08) !important;\n}\n\nbody.qqdocs-topic-detail .posts-wrapper,\nbody.qqdocs-topic-detail .post-stream {\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\n\nbody.qqdocs-topic-detail .topic-post,\nbody.qqdocs-topic-detail .topic-post:first-child,\nbody.qqdocs-topic-detail .topic-post:not(:first-child) {\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 28px 0 !important;\n  box-sizing: border-box !important;\n  background: transparent !important;\n  border: 0 !important;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\n\nbody.qqdocs-topic-detail .topic-post:first-child { padding-top: 18px !important; }\nbody.qqdocs-topic-detail .topic-post:last-child { border-bottom: 0 !important; }\nbody.qqdocs-topic-detail .topic-post:not(:first-child)::before { content: none !important; }\n\nbody.qqdocs-topic-detail .topic-post > article,\nbody.qqdocs-topic-detail .post__row,\nbody.qqdocs-topic-detail .post__body,\nbody.qqdocs-topic-detail .post__contents {\n  width: 100% !important;\n  max-width: none !important;\n  box-sizing: border-box !important;\n}\n\nbody.qqdocs-topic-detail .post__row { display: block !important; }\n\nbody.qqdocs-topic-detail .topic-meta-data {\n  min-height: 28px !important;\n  margin: 0 0 16px !important;\n  padding: 0 0 10px !important;\n  border: 0 !important;\n}\n\nbody.qqdocs-topic-detail .cooked {\n  max-width: none !important;\n  color: rgba(0, 0, 0, 0.88) !important;\n  font-family: var(--font-family) !important;\n  font-size: 15px !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: 28px !important;\n}\n\nbody.qqdocs-topic-detail .cooked p { margin: 0 0 14px !important; }\n\n/*\n * Post images are intentionally represented by an opaque, same-size surface\n * until the reader double-clicks them. The wrapper keeps an actual hit target\n * even while the image itself is visibility-hidden, so no source pixels can\n * leak through a blur or translucent veil.\n */\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle {\n  position: relative !important;\n  display: inline-block !important;\n  max-width: 100% !important;\n  vertical-align: baseline !important;\n  line-height: inherit !important;\n  overflow: hidden !important;\n  cursor: zoom-in !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle > img,\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle > picture,\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle > picture > img {\n  max-width: 100% !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle--hidden > img,\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle--hidden > picture,\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle--hidden > picture > img {\n  visibility: hidden !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle-overlay {\n  position: absolute !important;\n  inset: 0 !important;\n  z-index: 2 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  min-width: 120px !important;\n  min-height: 48px !important;\n  box-sizing: border-box !important;\n  padding: 10px 18px !important;\n  border: 1px dashed rgba(30, 111, 255, 0.38) !important;\n  border-radius: 4px !important;\n  background: #f3f5f7 !important;\n  color: #646a73 !important;\n  font-family: var(--font-family) !important;\n  font-size: 13px !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: 20px !important;\n  text-align: center !important;\n  white-space: nowrap !important;\n  cursor: zoom-in !important;\n  user-select: none !important;\n  outline: none !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle-overlay:hover,\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle-overlay:focus-visible {\n  border-color: var(--accent-default) !important;\n  background: #eaf2ff !important;\n  color: var(--accent-default) !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle--shown {\n  cursor: zoom-out !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle--shown .qqdocs-image-toggle-overlay {\n  display: none !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-image-toggle-enabled .qqdocs-image-toggle-overlay[hidden] {\n  display: none !important;\n}\n\n/*\n * Post emoji labels. The grid wrapper keeps the larger of the original emoji\n * and its label in the same inline box in both states, so hovering never\n * reflows the surrounding paragraph. The actual <img> remains in the DOM;\n * only visibility changes while the real label is a normal text node.\n */\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper {\n  position: relative !important;\n  display: inline-grid !important;\n  place-items: center !important;\n  vertical-align: middle !important;\n  line-height: 1 !important;\n  text-align: center !important;\n  cursor: default !important;\n  outline: none !important;\n}\n\n/* Reaction emoji are visual children of an existing native button. Keep the\n * wrapper non-focusable and let pointer/click events bubble to that button so\n * its aria-label, counter and native details dialog continue to work. */\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled nav.post-controls .qqdocs-emoji-wrapper--reaction,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled button.discourse-boosts__cooked .qqdocs-emoji-wrapper--reaction {\n  flex: 0 0 auto !important;\n  white-space: nowrap !important;\n  pointer-events: auto !important;\n  cursor: inherit !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled nav.post-controls .discourse-reactions-list-emoji {\n  align-items: center !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper > img,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper > picture,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper > picture > img {\n  grid-area: 1 / 1 !important;\n  display: block !important;\n  visibility: hidden !important;\n  opacity: 0 !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-label {\n  grid-area: 1 / 1 !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  box-sizing: border-box !important;\n  min-height: 20px !important;\n  padding: 1px 5px !important;\n  border: 1px solid #b7dfbd !important;\n  border-radius: 3px !important;\n  background: #e9f7eb !important;\n  color: #397342 !important;\n  font-family: var(--font-family) !important;\n  font-size: 12px !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: 18px !important;\n  white-space: nowrap !important;\n  user-select: none !important;\n  pointer-events: none !important;\n  visibility: visible !important;\n  opacity: 1 !important;\n  transition: opacity 0.08s ease !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:hover > img,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:focus-within > img,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:hover > picture,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:focus-within > picture,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:hover > picture > img,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:focus-within > picture > img {\n  visibility: visible !important;\n  opacity: 1 !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:hover > .qqdocs-emoji-label,\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:focus-within > .qqdocs-emoji-label {\n  visibility: hidden !important;\n  opacity: 0 !important;\n}\n\nbody.qqdocs-topic-detail.qqdocs-emoji-label-enabled .qqdocs-emoji-wrapper:focus-visible {\n  outline: 2px solid rgba(30, 111, 255, 0.5) !important;\n  outline-offset: 2px !important;\n  border-radius: 3px !important;\n}\n\n/* Hide forum identity avatars only; ordinary content images remain visible. */\nbody.qqdocs-topic-detail .topic-avatar,\nbody.qqdocs-topic-detail .topic-map__users-list,\nbody.qqdocs-topic-detail .d-header-icons #current-user .avatar,\nbody.qqdocs-topic-detail .post-avatar,\nbody.qqdocs-topic-detail .post-retort__reactions img.avatar,\nbody.qqdocs-topic-detail .who-liked img.avatar,\nbody.qqdocs-topic-detail .discourse-boosts img.avatar,\nbody.qqdocs-topic-detail .reply-to-tab img.avatar,\nbody.qqdocs-topic-detail .presence-avatars img.avatar,\nbody.qqdocs-topic-detail .presence-users img.avatar,\nbody.qqdocs-topic-detail .cooked .quote img.avatar,\nbody.qqdocs-topic-detail .cooked blockquote img.avatar,\nbody.qqdocs-topic-detail .user-card img.avatar,\nbody.qqdocs-topic-detail [role=\"dialog\"] img.avatar,\nbody.qqdocs-topic-detail .avatar-flair,\nbody.qqdocs-topic-detail .topic-map__users-list .poster {\n  display: none !important;\n}\n\nbody.qqdocs-topic-detail .topic-avatar + .post__body { margin-left: 0 !important; }\nbody.qqdocs-topic-detail .topic-navigation { display: none !important; }\n\n/* The same facts are rendered in the shell titlebar. Hide both native maps so\n   the avatar strip and the duplicate first-post map cannot overflow the page. */\nbody.qqdocs-topic-detail .topic-map.--bottom,\nbody.qqdocs-topic-detail .post__topic-map.topic-map.--op {\n  display: none !important;\n}\n\n.qqdocs-topic-stats {\n  min-width: 0 !important;\n  max-width: min(280px, 25vw) !important;\n  margin-left: 12px !important;\n  padding-left: 10px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  flex: 0 1 auto !important;\n  overflow: hidden !important;\n  border-left: 1px solid #dfe2e7 !important;\n  color: #81868f !important;\n  font-size: 11px !important;\n  line-height: 18px !important;\n  white-space: nowrap !important;\n}\n\n.qqdocs-topic-stats[hidden] { display: none !important; }\n\n.qqdocs-topic-stat {\n  min-width: 0 !important;\n  display: inline-flex !important;\n  align-items: baseline !important;\n  gap: 3px !important;\n  flex: 0 1 auto !important;\n  overflow: hidden !important;\n}\n\n.qqdocs-topic-stat-value {\n  min-width: 0 !important;\n  max-width: 8ch !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  color: #454d5a !important;\n  font-size: 12px !important;\n  font-weight: 600 !important;\n  line-height: 18px !important;\n}\n\n.qqdocs-topic-stat-label {\n  min-width: 0 !important;\n  max-width: 4em !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  color: #81868f !important;\n  font-size: 11px !important;\n  font-weight: 400 !important;\n}\n\nbody.qqdocs-topic-detail nav.post-controls .actions button {\n  padding: 4px 8px !important;\n  background: transparent !important;\n  border-radius: 4px !important;\n  color: var(--text-medium) !important;\n  font-size: 12px !important;\n}\n\n@media (max-width: 1100px) {\n  .qqdocs-ribbon-styles > span:nth-child(n+5),\n  .qqdocs-ribbon-tools { display: none !important; }\n  .qqdocs-ribbon-font { width: 320px !important; }\n  .qqdocs-ribbon-paragraph { width: 272px !important; }\n\n  .qqdocs-editor-title-left { margin-right: 8px !important; }\n  .qqdocs-editor-title-actions { gap: 8px !important; }\n  .qqdocs-editor-title-text { max-width: min(360px, 32vw) !important; }\n  .qqdocs-topic-stats {\n    max-width: min(230px, 24vw) !important;\n    margin-left: 8px !important;\n    padding-left: 8px !important;\n    gap: 6px !important;\n  }\n}\n\n@media (max-width: 760px) {\n  body.qqdocs-topic-detail #main-outlet {\n    padding-right: 12px !important;\n    padding-left: 12px !important;\n  }\n\n  .qqdocs-editor-title-actions > span:not(.qqdocs-editor-share),\n  .qqdocs-editor-readonly,\n  .qqdocs-editor-star,\n  .qqdocs-editor-folder,\n  .qqdocs-ribbon-styles { display: none !important; }\n\n  .qqdocs-editor-title-left { margin-right: 0 !important; }\n  .qqdocs-editor-title-text {\n    min-width: 0 !important;\n    max-width: min(44vw, 220px) !important;\n  }\n  .qqdocs-topic-stats {\n    max-width: min(36vw, 190px) !important;\n    margin-left: 6px !important;\n    padding-left: 6px !important;\n    gap: 5px !important;\n  }\n  .qqdocs-topic-stat { gap: 2px !important; }\n  .qqdocs-editor-tabs { gap: 14px !important; }\n  .qqdocs-editor-ribbon { margin-left: 4px !important; margin-right: 4px !important; }\n  .qqdocs-ribbon-font { width: 240px !important; }\n  .qqdocs-ribbon-paragraph { width: 180px !important; }\n\n  body.qqdocs-topic-detail .topic-area {\n    width: 100% !important;\n    max-width: none !important;\n  }\n\n  body.qqdocs-topic-detail .topic-area { padding: 46px 24px 48px !important; }\n}\n\n@media (max-width: 500px) {\n  .qqdocs-editor-plus { display: none !important; }\n  .qqdocs-editor-title-text { max-width: 26vw !important; }\n  .qqdocs-topic-stats { max-width: 32vw !important; gap: 4px !important; }\n  .qqdocs-topic-stat-label { display: none !important; }\n}\n\n/*\n * 左侧大纲面板：复刻腾讯文档\"大纲\"导航，固定在文档纸左侧空白处。\n * 类名刻意避开 \"outline\" 子串，防止 renderTopicDetail 的旧版残留清理误删。\n */\n.qqdocs-toc-panel {\n  position: fixed !important;\n  left: 16px !important;\n  top: calc(var(--qqdocs-editor-top, 150px) + 10px) !important;\n  width: 248px !important;\n  max-height: calc(100vh - var(--qqdocs-editor-top, 150px) - 40px) !important;\n  z-index: 1300 !important;\n  display: flex !important;\n  flex-direction: column !important;\n  overflow: hidden !important;\n  background: #fff !important;\n  border: 1px solid #e1e4e8 !important;\n  border-radius: 8px !important;\n  box-shadow: 0 2px 8px rgba(31, 35, 41, 0.08) !important;\n  box-sizing: border-box !important;\n  font-family: var(--font-family) !important;\n  color: #1f2329 !important;\n  user-select: none !important;\n}\n\n.qqdocs-toc-panel.is-hidden { display: none !important; }\n\n.qqdocs-toc-panel.is-collapsed .qqdocs-toc-body { display: none !important; }\n\n.qqdocs-toc-header {\n  height: 38px !important;\n  padding: 0 6px 0 14px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  flex: 0 0 auto !important;\n  border-bottom: 1px solid #eceef1 !important;\n  box-sizing: border-box !important;\n}\n\n.qqdocs-toc-title {\n  min-width: 0 !important;\n  overflow: hidden !important;\n  color: #1f2329 !important;\n  font-size: 13px !important;\n  font-weight: 600 !important;\n  line-height: 20px !important;\n}\n\n.qqdocs-toc-button-common {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 2px !important;\n}\n\n.qqdocs-toc-btn {\n  width: 24px !important;\n  height: 24px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  border-radius: 4px !important;\n  color: #81868f !important;\n  cursor: pointer !important;\n}\n\n.qqdocs-toc-btn:hover {\n  background: rgba(51, 77, 102, 0.06) !important;\n  color: #1f2329 !important;\n}\n\n.qqdocs-toc-btn::before {\n  content: \"\" !important;\n  width: 12px !important;\n  height: 12px !important;\n  display: block !important;\n  background: currentColor !important;\n  -webkit-mask-position: center !important;\n  mask-position: center !important;\n  -webkit-mask-repeat: no-repeat !important;\n  mask-repeat: no-repeat !important;\n  -webkit-mask-size: 12px 12px !important;\n  mask-size: 12px 12px !important;\n}\n\n.qqdocs-toc-collapse::before {\n  -webkit-mask-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M1 6h10' stroke='black' stroke-width='1.4' stroke-linecap='round'/></svg>\") !important;\n  mask-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M1 6h10' stroke='black' stroke-width='1.4' stroke-linecap='round'/></svg>\") !important;\n}\n\n.qqdocs-toc-close::before {\n  -webkit-mask-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2 2l8 8M10 2l-8 8' stroke='black' stroke-width='1.4' stroke-linecap='round'/></svg>\") !important;\n  mask-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2 2l8 8M10 2l-8 8' stroke='black' stroke-width='1.4' stroke-linecap='round'/></svg>\") !important;\n}\n\n.qqdocs-toc-body {\n  flex: 1 1 auto !important;\n  min-height: 0 !important;\n  overflow-y: auto !important;\n  overflow-x: hidden !important;\n  padding: 6px 0 10px !important;\n  box-sizing: border-box !important;\n}\n\n.qqdocs-toc-headlines {\n  display: block !important;\n}\n\n.qqdocs-toc-headline {\n  display: flex !important;\n  align-items: center !important;\n  gap: 4px !important;\n  min-height: 26px !important;\n  padding: 2px 10px 2px 8px !important;\n  box-sizing: border-box !important;\n  cursor: pointer !important;\n}\n\n.qqdocs-toc-headline:hover {\n  background: #f5f7fa !important;\n}\n\n.qqdocs-toc-headline.is-active {\n  background: #eaf2ff !important;\n}\n\n.qqdocs-toc-headline-triangle {\n  width: 16px !important;\n  height: 16px !important;\n  flex: 0 0 16px !important;\n}\n\n.qqdocs-toc-headline-text {\n  flex: 1 1 auto !important;\n  min-width: 0 !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n}\n\n.qqdocs-toc-headline-text.is-title {\n  color: #1f2329 !important;\n  font-size: 13px !important;\n  font-weight: 600 !important;\n  line-height: 22px !important;\n}\n\n.qqdocs-toc-headline-text.is-floor {\n  color: #4e5969 !important;\n  font-size: 12px !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: 20px !important;\n}\n\n.qqdocs-toc-headline.is-active .qqdocs-toc-headline-text {\n  color: #1e6fff !important;\n  font-weight: 600 !important;\n}\n\n.qqdocs-toc-headline-inner-text {\n  display: inline !important;\n}\n\n/* 点击未加载楼层后的路由加载反馈。 */\n.qqdocs-toc-headline.is-jumping .qqdocs-toc-headline-inner-text {\n  color: #1e6fff !important;\n}\n\n.qqdocs-toc-headline.is-jumping::after {\n  content: \"\" !important;\n  flex: 0 0 12px !important;\n  width: 12px !important;\n  height: 12px !important;\n  margin-left: 2px !important;\n  border: 2px solid #d8dce3 !important;\n  border-top-color: #1e6fff !important;\n  border-radius: 50% !important;\n  box-sizing: border-box !important;\n  animation: qqdocs-toc-spin 0.7s linear infinite !important;\n}\n\n@keyframes qqdocs-toc-spin {\n  to { transform: rotate(360deg); }\n}\n\n/* 大纲收起后的浮动展开按钮。 */\n.qqdocs-toc-fab {\n  position: fixed !important;\n  left: 16px !important;\n  top: calc(var(--qqdocs-editor-top, 150px) + 10px) !important;\n  width: 34px !important;\n  height: 34px !important;\n  z-index: 1300 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  background: #fff !important;\n  border: 1px solid #e1e4e8 !important;\n  border-radius: 50% !important;\n  box-shadow: 0 2px 8px rgba(31, 35, 41, 0.12) !important;\n  box-sizing: border-box !important;\n  color: #454d5a !important;\n  cursor: pointer !important;\n  font-family: var(--font-family) !important;\n  font-size: 12px !important;\n  font-weight: 600 !important;\n  user-select: none !important;\n}\n\n.qqdocs-toc-fab.is-hidden { display: none !important; }\n\n.qqdocs-toc-fab::before {\n  content: \"\" !important;\n  width: 16px !important;\n  height: 16px !important;\n  display: block !important;\n  background: currentColor !important;\n  -webkit-mask-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path d='M2 4h12M2 8h12M2 12h8' stroke='black' stroke-width='1.5' stroke-linecap='round'/></svg>\") !important;\n  mask-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path d='M2 4h12M2 8h12M2 12h8' stroke='black' stroke-width='1.5' stroke-linecap='round'/></svg>\") !important;\n  -webkit-mask-position: center !important;\n  mask-position: center !important;\n  -webkit-mask-repeat: no-repeat !important;\n  mask-repeat: no-repeat !important;\n  -webkit-mask-size: 16px 16px !important;\n  mask-size: 16px 16px !important;\n}\n\n/* 点击大纲跳转后，楼层不被固定顶栏遮住。 */\nbody.qqdocs-topic-detail .topic-post {\n  scroll-margin-top: calc(var(--qqdocs-editor-top, 150px) + 12px) !important;\n}\n\n@media (max-width: 1100px) {\n  .qqdocs-toc-panel,\n  .qqdocs-toc-fab { display: none !important; }\n}\n\n/* --- composer.css --- */\n/* 回复编辑器保持 Discourse 原生样式，不在主题中覆盖 #reply-control。 */\n\n/* --- modal-menu.css --- */\n/* 腾讯文档 - 菜单、浮层与弹窗样式 */\n\n/* 下拉菜单面板 */\n.menu-panel,\n.menu-panel.drop-down,\n.user-menu,\n.search-menu {\n  background: var(--qqdocs-bg-card) !important;\n  border: 1px solid var(--qqdocs-border-color) !important;\n  border-radius: var(--qqdocs-radius-lg) !important;\n  box-shadow: var(--qqdocs-shadow-popover) !important;\n  padding: 8px !important;\n}\n\n/* 菜单项 */\n.menu-panel li a,\n.user-menu .panel-body-contents a,\n.search-menu .results a {\n  border-radius: var(--qqdocs-radius-md) !important;\n  color: var(--qqdocs-text-primary) !important;\n  padding: 8px 12px !important;\n  font-size: var(--font-size-body) !important;\n  font-weight: var(--font-weight-regular) !important;\n  line-height: var(--line-height-body) !important;\n  transition: background 0.15s ease !important;\n}\n\n.menu-panel li a:hover,\n.user-menu .panel-body-contents a:hover,\n.search-menu .results a:hover {\n  background-color: var(--qqdocs-bg-hover) !important;\n  color: var(--qqdocs-brand-color) !important;\n}\n\n/* 弹窗模态框 (Discourse Modal) */\n.modal-inner-container {\n  background: var(--qqdocs-bg-card) !important;\n  border-radius: var(--qqdocs-radius-lg) !important;\n  box-shadow: var(--qqdocs-shadow-lg) !important;\n  border: 1px solid var(--qqdocs-border-color) !important;\n  overflow: hidden !important;\n}\n\n.modal-header {\n  border-bottom: 1px solid var(--qqdocs-border-color) !important;\n  padding: 14px 20px !important;\n}\n\n.modal-header h3 {\n  font-size: 16px !important;\n  font-weight: 600 !important;\n  line-height: 24px !important;\n  color: var(--qqdocs-text-primary) !important;\n}\n\n.modal-footer {\n  border-top: 1px solid var(--qqdocs-border-color) !important;\n  padding: 12px 20px !important;\n}\n\n/* 按钮通用 */\n.btn-default:not(#reply-control .btn-default) {\n  background: var(--qqdocs-bg-hover) !important;\n  border: 1px solid var(--qqdocs-border-color) !important;\n  color: var(--qqdocs-text-primary) !important;\n  border-radius: var(--qqdocs-radius-md) !important;\n}\n.btn-default:not(#reply-control .btn-default):hover {\n  background: #e8ebf0 !important;\n}\n";
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
  // 腾讯文档真实资产与图标库。
// 资源于 2026-08-27 通过 Kimi WebBridge 从 https://docs.qq.com/desktop 的实际 DOM/CSS 中提取。
const ICONS = Object.freeze({
  officialLogoSvg: "<svg width=\"180\" height=\"24\"><path fill=\"#2A65F5\" d=\"M21.93 0H4.523a.495.495 0 0 0-.487.408L.008 23.19a.494.494 0 0 0 .487.579h9.596l.76-.235h4.457l.623.235h7.392c.24 0 .445-.172.487-.408l3.313-18.74L21.93 0Z\"></path><path fill=\"#00DCFF\" d=\"M21.703 4.622h5.42L21.93 0l-.715 4.043c-.053.302.18.58.488.58\"></path><path fill=\"#FFF\" d=\"m14.125.976-.974 5.525-9.497.016 4.126 4.452h4.579L10.091 23.77h5.84l2.271-12.801h6.894l.24-.005z\"></path><path class=\"desktop-logo-text\" d=\"M66.707 4.107v14.744h1.357v1.54H65.18v-8.254h-3.653v8.434H60v-8.434h-3.311v-1.526h3.31V5.648h-2.888v-1.54h9.596Zm24.463-.594v3.268h2.19v1.4h-2.19v2.262h.811l.024.056 1.395 3.297a.088.088 0 0 1-.044.117l-.033.007h-1.381l-.772-1.83v8.462h-1.528v-7.504c-.577 1.623-1.495 3.28-2.553 4.734a.086.086 0 0 1-.148-.012l-.008-.036v-2.482c1.4-2.314 2.272-4.422 2.582-6.651l.052-.42H87.35v-1.4h2.292V3.513h1.528ZM55.503 8.55v9.101l2.576-1.967a.085.085 0 0 1 .128.025l.01.04v1.586l-4.214 3.218-.838-1.116.702-.536.119-.09v-8.72h-2.051V8.548h3.568Zm22.863-4.996v2.605h7.165v1.563h-2.44c-.665 3.138-2.104 5.858-4.28 8.02 1.719 1.313 3.807 2.311 6.228 2.957l.489.125.003.003-.003.002v1.634l-.007.034a.087.087 0 0 1-.046.046l-.034.007-.02-.002c-2.959-.681-5.504-1.83-7.596-3.425a11.27 11.27 0 0 1-.304-.233c-.136.108-.27.21-.404.308-2.074 1.556-4.587 2.68-7.5 3.35a.086.086 0 0 1-.099-.051l-.007-.034v-1.639c2.63-.64 4.885-1.682 6.719-3.084a15.24 15.24 0 0 1-2.997-4.197 16.548 16.548 0 0 1-1.169-3.319l-.113-.502h-2.44V6.158h7.163V3.553h1.692Zm-38.72.59V20.49h-2.47l-.381-1.26c-.029-.077-.001-.12.046-.135l.038-.005h1.382v-4.353h-1.946c-.008 1.327-.062 3.126-.451 5.283l-.083.437h-1.393c-.082 0-.13-.043-.085-.201.392-1.598.596-3.389.622-5.69l.002-.5V4.141h4.72Zm6.042-.714c.068 0 .125.021.11.126-.103.754-.214 1.44-.338 2.07l-.077.37h1.671l.548-1.88h1.183c.06 0 .108.036.081.13l-.464 1.593-.045.157h1.36v1.26h-4.645c-.101.35-.21.682-.326.995l-.12.307h5.432v1.26h-1.864c.834 1.193 1.72 1.782 2.137 2.041l.072.045v1.442c0 .072-.056.15-.282.02a10.118 10.118 0 0 1-1.618-1.145l-.277-.25-.056 2.45h1.724v6.067h-4.406l-.38-1.259c-.029-.077 0-.121.046-.135l.037-.006h3.176V15.68h-7.045a.082.082 0 0 1-.079-.051l-.006-.034.131-2.389h1.306c.038 0 .067.021.079.052l.006.034-.062 1.128h4.083l.044-1.887h-5.172c-.445.331-.883.597-1.294.832-.198.113-.266.068-.28.007l-.003-.027v-1.442a7.103 7.103 0 0 0 2.055-1.869l.157-.217h-2.199v-1.26h2.927c.158-.348.309-.717.427-1.055l.082-.247h-3.095v-1.26h1.326l-.51-1.75c-.022-.075.005-.113.047-.125l.034-.005h1.182l.548 1.88h.82c.153-.646.28-1.33.396-2.096l.07-.47h1.346Zm53.205.084v6.56h3.838v10.024H93.22v-1.484h7.846v-2.898H93.83V14.23h7.235v-2.675h-7.651v-1.484h3.812V3.513h1.667ZM47.658 16.656v1.4h-7.572v-1.4h7.572Zm33.698-8.935h-7.67c.517 2.184 1.461 4.146 2.793 5.772.327.395.673.776 1.04 1.133.14-.135.278-.275.416-.42 1.667-1.767 2.826-3.973 3.42-6.485ZM38.26 10.126h-1.945v3.35h1.945v-3.35Zm8.233-.309H44.02c-.254.453-.524.85-.802 1.202l-.21.254h4.545c-.37-.423-.728-.904-1.06-1.456ZM65.18 5.648h-3.653v4.963h3.653V5.648Zm-26.92-.106h-1.944v3.324h1.945V5.542Zm56.723-.78 1.259 3.83a.088.088 0 0 1-.05.107l-.032.007h-1.636l-1.258-3.827a.09.09 0 0 1 .05-.11l.034-.007h1.633Zm7.786 0c.048 0 .085.038.088.083l-.004.034-1.258 3.827h-1.636a.087.087 0 0 1-.086-.081l.004-.034 1.259-3.829h1.633Zm-48.947-.965 2.106 3.242c.026.04.012.1-.032.123l-.039.008h-1.67L52.08 3.924c-.028-.043-.004-.098.039-.119l.035-.008h1.67Z\"></path></svg>",
  // Replaced with a data URL by build.js from the checked-in favicon2.ico.
  // Keeping the payload in the built userscript avoids any runtime CDN request.
  favicon: 'data:image/x-icon;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAABMLAAATCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD2ZSs09mYrn/ZmK9P2Ziu+9mYrvvZmK772Ziu+9mYrvvZmK772Ziu+9l0fvvZlKr/+6eDC////wP/9/MD//fzA//7+wP///8H5pYPB9EsGvfZmK772Ziu+9mYrvvZmK772Ziu+9mYr0/ZmK532Zy4A9mcuAPZnLgD2Zy4A////APZlKUn1ZSrb9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1YCT/9FcX//zUxP////////////////////////////vAqP/zTwz/9WMo//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VnKyX0ZyoA9GcqAPRnKgD///8A92ovEfZnLJ71ZCn/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VkKf/zSwb/+rmf/////////////////////////////dzP//RZGv/1YCP/9WUq//VlKv/1ZSr/9WUq//VlKv/0ZSj/+GYuUP1mNgD8ZjQA/GY0AP///wD2ZioA9mUqd/VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//NMB//5n3r////////////////////////////+8Ov/9Wox//RaGv/1ZSr/9WUq//VlKv/1ZSr/9WUq//RlKf/4Zi5z/WYzAPxmMgD8ZjIA////APttPQD4aTRI9GMn//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9FAN//eGV//////////////////////////////////3gFD/9FEP//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VmKqP2ZyoA9mcqAPZnKgD///8A92k0APZnLyX1ZCj/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/0Vxf/9nA5//728/////////////////////////////iYcP/zTQn/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WYrx/doLQD3aC0A92gtAP///wD6bCkA+WsqAPVmK9z1ZCr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VfIv/0XR7//eLW////////////////////////////+rSX//NKBf/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSrx+WcsFPtoLAD6aCwA////APhnKgD4ZioA9WUquvVlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WMn//RRDv/7x7P////////////////////////////7zLj/9FIQ//ViJv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/5Zisx+mUpAPllKQD///8A+Hc0APh3NAD2ai2M9WIp//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/80oE//quj/////////////////////////////3m3P/1YCP/9V4g//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WQo//ZnLV/4bDUA+Gs0AP///wD2bS4A9m0uAPZnK2X1ZCn/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/0TQn/+JRr//////////////////////////////n3//ZzPf/0Vxb/9WUq//VlKv/1ZSr/9WUq//VlKv/0ZCj/92guhPpuNQD5bTMA////APttLwD8bzAA+WstN/VkKf/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//RTEf/2fEr/////////////////////////////////94te//ROCv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSq1+GMtAPhjLgD///8A92kqAPdqKgD2aCkY9WUq9fVlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9Fsb//VoLv/+7uf////////////////////////////5pID/80wH//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUp//VmK9j6ZTEA+mQwAP///wD5aToA+Wk7APlqOgD1ZizP9WQo//VlKv/1ZSr/9WUq//VmLP/1XR//9FcX//RZGf/0VRT/80gC//zRwP////////////////////////////q9o//yQAD/9FcX//RZGf/0WRn/9FkZ//RZGf/0Vxf/9V8j/vVrLiH1bC8A////APhdMwD4XTQA+FwzAPViK6n1Zin/9WUq//VlKv/1aC7/9FYV//RfIf/1cjz/9W02//VsNP/0WBj/+7+m/////////////////////////////NrL//RiJ//1aC//9W02//VtNv/1bDX/9Wsz//Z/Tv/2dUH/9WUnQvVtMAD///8A+pktAPqaLQD7ny4A93QsevRdKf/1ZSr/9Wgu//RNCf/1ZSr//ebd///////+8+///vPv//7x6///9vL///////////////////////////////7//vTw//7y7v/+8+///vLu//708P///////eri//V1P//2WBpx+2QuAP///wD3gSwA94EsAPeELAD2bitU9WEq//VoLv/0UAz/9Fwe//3l2/////////////////////////////////////////////////////////////////////////////////////////////7y7v/2eEX/81MQ//dmLZf6ZTEA////APleLQD5Xi0A+l0tAPlkLSj1ai7/9FIQ//RWFv/93dD////////////////////////////////////////////////////////////////////////////////////////////82sz/9Fob//RMB//1Zy3/9WYqxvlqKgD///8A+WUuAPllLgD5ZS4A+GYuCvRaG+b1ajL//eXc////////////////////////////////////////////////////////////////////////////////////////////+8m1//NQDf/0UQ7/9Wgu//VlKv/1Zirl+WkrB////wD3Zi0A92YtAPdmLQD3ZCoA9VYVvfmqiv/++ff//dzP//3ay//9283//dvN//3bzf/9287//drN//3XyP/+9PD///////////////////////////////////////q3m//zSQP/9FcV//VoLv/1ZSr/9WUq//RkKv/2aCwv////APVmKQD1ZikA9WYpAPVlKAD1aC2X9Wsz//RcHf/0Whr/9Fsd//RbHf/0Wx3/9Fsd//RcHf/0Wxz/8kQA//qxk//////////////////////////////////5pIH/80YA//RQIP/0VjT/9FUw//RVMP/0VTD/81Qv//dfMFr///8A/GcyAPxnMgD8ZzIA/Wg0APhmLWj0YCL/9V4h//VfIv/1XyL/9V8i//VfIv/1XyL/9V8i//VfIf/zRAD/+Jdw////////////////////////////+JBm//NDAP/1XSL/9ncn//d/If/3fCL/93wi//d8Iv/3hR//93gihv///wD7ZzAA+2cwAPtnMAD8ZzEA+GctRfRlKf/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//RSEP/2gE////////////////////r4//d/Tf/zRAD/9F4o//ReLv/9yAj///QA///iAP//4wD///EA///aA8/6rBAV////APZpKgD2aSoA9mkqAPZpKgD2aSsZ9WUq+fVlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9Foa//VrMv/+8+////////7u5//1bTb/80cA//VlKv/1Yyz/9Fgu//y7DP//8wD//+QA///sAP//ygaz/5IcAPugFwD///8A9mYrAPZmKwD2ZisA9mYrAPZmKwD1ZSrX9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1XyL/9Fsc//7s5P/+9fH/9F8i//RKBf/1Zy3/9WYr//VlKv/zUDH/+p8V///2AP//6AD//c4Emv2YFgD/fCUA+6cUAP///wD5ZS0A+WUtAPllLQD5ZS0A+WUtAPZlKq70ZSr/9WUq//VlKv/1ZSr/9WUq//VlKv/1ZSr/9WUq//VkKf/1YCL/+Jlx//ZtNf/0Twz/9Wgu//VlKv/1ZSr/9WUq//NRMf/4jhz///IA//27DHn7pxEA/qYRAP+GIQD7phQA////APZmLQD2Zi0A9mYtAPZmLQD2Zi0A9mYsXvVlKuP1ZSrJ9WUqx/VlKsf1ZSrH9WUqx/VlKsf1ZSrH9WYrx/VnLcf0UxLH9Fkax/VoLsf1ZSrH9WUqx/VlKsf1ZSrH9FouyveAH97+sRFg+n0lAPyzDAD+qQ8A/4UhAPumFAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////////////////AAAAHwAAAA8AAAAPgAAAD4AAAA+AAAAPwAAAB8AAAAfAAAAHwAAAB8AAAAfAAAAH4AAAA+AAAAPgAAAD4AAAA+AAAAPgAAAB8AAAAfAAAAHwAAAB8AAAAfAAAAf4AAAP+AAAH/gAAD////////////////8=',
  pngIcons: Object.freeze({"sheet":"https://docs.gtimg.com/docs-design-resources/document-management/tencent-docs/png@3x/application-vnd.tdocs-apps.sheet@3x.png","doc":"https://docs.gtimg.com/docs-design-resources/document-management/tencent-docs/png@3x/application-vnd.tdocs-apps.doc@3x.png","slide":"https://docs.gtimg.com/docs-design-resources/document-management/tencent-docs/png@3x/application-vnd.tdocs-apps.slide@3x.png","markdown":"https://docs.gtimg.com/docs-design-resources/document-management/tencent-docs/png@3x/application-vnd.tdocs-apps.markdown@3x.png","mind":"https://docs.gtimg.com/docs-design-resources/document-management/tencent-docs/png@3x/application-vnd.tdocs-apps.mind@3x.png","pdf":"https://docs.gtimg.com/docs-design-resources/document-management/tencent-docs/png@3x/application-vnd.tdocs-apps.pdf@3x.png"}),
  uiIcons: Object.freeze({
    search: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjxkZWZzPjxmaWx0ZXIgaWQ9ImIiIHdpZHRoPSIxMTguMiUiIGhlaWdodD0iMTE4LjIlIiB4PSItOS4xJSIgeT0iLTkuMSUiIGZpbHRlclVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJzaGFkb3dCbHVySW5uZXIxIiBzdGREZXZpYXRpb249Ii41Ii8+PGZlT2Zmc2V0IGR4PSIxIiBpbj0ic2hhZG93Qmx1cklubmVyMSIgcmVzdWx0PSJzaGFkb3dPZmZzZXRJbm5lcjEiLz48ZmVDb21wb3NpdGUgaW49InNoYWRvd09mZnNldElubmVyMSIgaW4yPSJTb3VyY2VBbHBoYSIgazI9Ii0xIiBrMz0iMSIgb3BlcmF0b3I9ImFyaXRobWV0aWMiIHJlc3VsdD0ic2hhZG93SW5uZXJJbm5lcjEiLz48ZmVDb2xvck1hdHJpeCBpbj0ic2hhZG93SW5uZXJJbm5lcjEiIHZhbHVlcz0iMCAwIDAgMCAxIDAgMCAwIDAgMSAwIDAgMCAwIDEgMCAwIDAgMC4yNCAwIi8+PC9maWx0ZXI+PGNpcmNsZSBpZD0iYSIgY3g9IjYiIGN5PSI1LjUiIHI9IjUuNSIvPjwvZGVmcz48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHRyYW5zZm9ybT0icm90YXRlKC00NSAxNS41MzYgMi4wNSkiPjx1c2UgeGxpbms6aHJlZj0iI2EiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIGZpbGw9IiMwMDAiIGZpbHRlcj0idXJsKCNiKSIvPjxjaXJjbGUgY3g9IjYiIGN5PSI1LjUiIHI9IjQuODc1IiBzdHJva2U9IiM4MTg2OGYiIHN0cm9rZS1saW5lam9pbj0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjEuMjUiLz48L2c+PHBhdGggZmlsbD0iIzgxODY4ZiIgZD0ibTE0Ljc2OCAxNS40NzUuODg0LS44ODQgMi44MjggMi44MjgtLjg4NC44ODR6Ii8+PC9nPjwvc3ZnPg=="}),
    vip: Object.freeze({"mode":"background","src":"https://docs.gtimg.com/desktop/static/media/membership_tips_16.c8c0786f.svg"}),
    manageDevice: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTcuNDUgNC45NDdIMy45NXY5LjI5NGg5LjM1VjguOTdjMC0uMzY4LjI3LS42NjcuNjAzLS42NjdoMy41NDd6TTMuNTkgMTUuNDloOS43MXY0LjE0NmMwIC4zNjguMjcuNjY2LjYwMy42NjZoNi43OTRjLjMzMyAwIC42MDMtLjI5OC42MDMtLjY2NlY4Ljk3YzAtLjM2OC0uMjctLjY2Ny0uNjAzLS42NjdIMTguN1Y0LjU4NmEuODkuODkgMCAwIDAtLjg4OS0uODlIMy41OWEuODkuODkgMCAwIDAtLjg4OS44OXYxMC4wMTZhLjg5Ljg5IDAgMCAwIC44OS44ODltOC42NjYgMi40MjhoLTZ2MS4yNWg2em03Ljc5NCAxLjEzNHYtOS41aC01LjV2OS41ek0xOC4zIDE2LjY3aC0ydjEuMjVoMnoiIGNsaXAtcnVsZT0iZXZlbm9kZCIgc3R5bGU9ImZpbGw6IzQ1NGQ1YTtmaWxsOmNvbG9yKGRpc3BsYXktcDMgLjI3MDYgLjMwMiAuMzUyOSk7ZmlsbC1vcGFjaXR5OjEiLz48L3N2Zz4="}),
    template: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS4yNSA1LjI1VjE4YzAgLjQxNC4zMzYuNzUuNzUuNzVoOS43NVY2YS43NS43NSAwIDAgMC0uNzUtLjc1ek01IDRhMSAxIDAgMCAwLTEgMXYxM2EyIDIgMCAwIDAgMiAyaDEwLjAxN2ExLjQyIDEuNDIgMCAwIDAgMS41OTItLjg1OGw0LjAzOC05Ljg4N2ExLjQyMyAxLjQyMyAwIDAgMC0uNzk4LTEuODYybC0zLjg1Mi0xLjUxQTIgMiAwIDAgMCAxNSA0em0xNS40OSA0Ljc4M0wxNyAxNy4zMjZWNy4yMjdsMy4zOTIgMS4zM2MuMDkuMDM1LjEzNC4xMzYuMDk3LjIyNk0xMi4yNSAxMmExLjc1IDEuNzUgMCAxIDEtMy41IDAgMS43NSAxLjc1IDAgMCAxIDMuNSAwbTEuMjUgMGEzIDMgMCAxIDEtNiAwIDMgMyAwIDAgMSA2IDAiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg=="}),
    toolkit: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTMuNDQ1IDcuOTAyYTIuNjUzIDIuNjUzIDAgMSAwIDUuMzA1IDAgMi42NTMgMi42NTMgMCAwIDAtNS4zMDUgME0xNi4wOTggNGEzLjkwMiAzLjkwMiAwIDEgMCAwIDcuODA1IDMuOTAyIDMuOTAyIDAgMCAwIDAtNy44MDVNNS4yNSAxMC4xNjVWNS42NGg0LjUyNHY0LjUyNXpNNCA1LjE3YzAtLjQzMS4zNS0uNzguNzgtLjc4aDUuNDY0YS43OC43OCAwIDAgMSAuNzguNzh2NS40NjNhLjc4Ljc4IDAgMCAxLS43OC43OEg0Ljc4YS43OC43OCAwIDAgMS0uNzgtLjc4em0xLjI1IDEzLjU4di00LjUyNGg0LjUyNHY0LjUyNHpNNCAxMy43NTZjMC0uNDMxLjM1LS43OC43OC0uNzhoNS40NjRhLjc4Ljc4IDAgMCAxIC43OC43OHY1LjQ2NGEuNzguNzggMCAwIDEtLjc4Ljc4SDQuNzhhLjc4Ljc4IDAgMCAxLS43OC0uNzh6bTkuODM2IDQuOTk0di00LjUyNGg0LjUyNHY0LjUyNHptLTEuMjUtNC45OTRjMC0uNDMxLjM1LS43OC43OC0uNzhoNS40NjRjLjQzIDAgLjc4LjM0OS43OC43OHY1LjQ2NGEuNzguNzggMCAwIDEtLjc4Ljc4aC01LjQ2NGEuNzguNzggMCAwIDEtLjc4LS43OHoiIGNsaXAtcnVsZT0iZXZlbm9kZCIgc3R5bGU9ImZpbGw6IzQ1NGQ1YTtmaWxsOmNvbG9yKGRpc3BsYXktcDMgLjI3MDYgLjMwMiAuMzUyOSk7ZmlsbC1vcGFjaXR5OjEiLz48L3N2Zz4="}),
    aiTop: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzFlNmZmZiIgZD0iTTEyIDFjNi4wNzUgMCAxMSA0LjkyNSAxMSAxMXMtNC45MjUgMTEtMTEgMTFTMSAxOC4wNzUgMSAxMiA1LjkyNSAxIDEyIDFtMCAxLjVhOS41IDkuNSAwIDEgMCAwIDE5IDkuNSA5LjUgMCAwIDAgMC0xOSIgc3R5bGU9ImZpbGw6IzFlNmZmZjtmaWxsOmNvbG9yKGRpc3BsYXktcDMgLjExNzYgLjQzNTMgMSk7ZmlsbC1vcGFjaXR5OjEiLz48cGF0aCBmaWxsPSIjMmZkNmZmIiBkPSJtMTcuNDM0IDguOTA2LjAyMy0uMjY0Yy0uOTguMDk2LTEuODE0IDEuMDEzLTEuOTk3IDEuM2wtLjAwMy4yOGMuNDM1LS41MyAxLjIwNS0xLjI0NSAxLjk3Ny0xLjMxNm0tNS4zNiA0LjM3N2MtLjgtMi4xMjEtMi44MTItMi4wNi0zLjkzNC0uOTg0bC0uNjU5IDEuMTY4YzEuMDE4LS40MDUgMy41MzktLjY2IDQuNTkzLS4xODQiIHN0eWxlPSJmaWxsOiMyZmQ2ZmY7ZmlsbDpjb2xvcihkaXNwbGF5LXAzIC4xODQzIC44MzkyIDEpO2ZpbGwtb3BhY2l0eToxIi8+PHBhdGggZmlsbD0iIzFlNmZmZiIgZD0iTTEwLjkzNCA3LjQ0M2MxLjAzLS4wNCAxLjk5Mi41MzEgMi4yMSAxLjU5My40MjUgMi4wNy43MyAzLjUzNCAxLjEwOSA1LjQ0di0uMDFjLjEyNC42MzIgMS4wMTguNjYxIDEuMTg3LjA1Ni4wNzQtMS4xMzYuMDM0LTIuNjYuMDI1LTMuOTQ4LjQxOC0uNTEyIDEuMjc0LS44NTUgMS45MTUtLjk0MS0uMDk1IDEuNzkzLS4wMjYgMy44OTgtLjA5IDQuMzlsLS4wMDkuMDJjLS4wOTUgMS4yOTMtLjc3NSAyLjQ5LTIuMzM0IDIuNTQ1LTEuNDE0LjA1LTIuMjMtLjkwMi0yLjQzNC0yLjc2M2wtLjg3Ny00LjMxYS43MDYuNzA2IDAgMCAwLS43MDYtLjU2NC45LjkgMCAwIDAtLjgwNS41NDFsLTEuMzUzIDMuMWMuNjY3LS43MDUgMi41MjUtLjY2MiAzLjQwNi44MjctMS41NjUtLjI4Mi0zLjQ5Ny42MzMtNC42MTggMi40NjdhLjcyLjcyIDAgMCAxLS42MDcuMzU0SDUuNjQ4YzEuMDQtMi4zODMgMi4wNS00Ljc4NiAzLjA3My03LjE4LjM4Ny0uOTA2IDEuMjY4LTEuNTQgMi4yMTMtMS42MTdtNC42NDYuODE4Yy4zMjUtMS4xOTcgMS41NDQtMS4yNjMgMi4xOTYtMS4wNy0uMTUzLjMtLjI1NC44MjQtLjMyIDEuNDUzLS44Mi4yMDItMS41NzYuODQzLTEuOTkzIDEuNDc3IDAtLjgzLjAyNC0xLjUxNi4xMTctMS44NiIgc3R5bGU9ImZpbGw6IzFlNmZmZjtmaWxsOmNvbG9yKGRpc3BsYXktcDMgLjExNzYgLjQzNTMgMSk7ZmlsbC1vcGFjaXR5OjEiLz48L3N2Zz4="}),
    notification: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIuOTk3IDUuMDgyUTEzIDUuMDQyIDEzIDVhMSAxIDAgMSAwLTEuOTk3LjA4MkE2IDYgMCAwIDAgNiAxMXY1Ljc1SDQuNVYxOGgxNXYtMS4yNUgxOFYxMWE2IDYgMCAwIDAtNS4wMDMtNS45MThNMTYuNzUgMTF2NS43NWgtOS41VjExYTQuNzUgNC43NSAwIDAgMSA5LjUgME0xNSAxOXYxLjI1SDlWMTl6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4="}),
    moreMenu: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS40NzkgNi4xMjVoMTV2MS4yNWgtMTV6bTAgNS4yNWgxNXYxLjI1aC0xNXptMTUgNS4yNWgtMTV2MS4yNWgxNXoiIGNsaXAtcnVsZT0iZXZlbm9kZCIgc3R5bGU9ImZpbGw6IzQ1NGQ1YTtmaWxsOmNvbG9yKGRpc3BsYXktcDMgLjI3MDYgLjMwMiAuMzUyOSk7ZmlsbC1vcGFjaXR5OjEiLz48L3N2Zz4="}),
    home: Object.freeze({"mode":"background","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PGcgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbHRlcj0idXJsKCNhKSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZD0iTTQgMjAuMzRjMCAuMDg4LjA3MS4xNi4xNTkuMTZIMTkuODRhLjE2LjE2IDAgMCAwIC4xNTktLjE2di05LjgxYS40OC40OCAwIDAgMC0uMTYtLjM1N2wtNy43MzUtNi44NDVhLjE2LjE2IDAgMCAwLS4yMSAwTDQuMTYgMTAuMTcyYS40OC40OCAwIDAgMC0uMTYxLjM1N3ptOC00LjU1YTEuNiAxLjYgMCAwIDAtMS42IDEuNnYzLjExaDMuMnYtMy4xMWExLjYgMS42IDAgMCAwLTEuNi0xLjYiIHN0eWxlPSJmaWxsOiM0NTRkNWE7ZmlsbDpjb2xvcihkaXNwbGF5LXAzIC4yNzA2IC4zMDIgLjM1MjkpO2ZpbGwtb3BhY2l0eToxIi8+PHBhdGggZmlsbD0idXJsKCNiKSIgZD0iTTQgMjAuMzRjMCAuMDg4LjA3MS4xNi4xNTkuMTZIMTkuODRhLjE2LjE2IDAgMCAwIC4xNTktLjE2di05LjgxYS40OC40OCAwIDAgMC0uMTYtLjM1N2wtNy43MzUtNi44NDVhLjE2LjE2IDAgMCAwLS4yMSAwTDQuMTYgMTAuMTcyYS40OC40OCAwIDAgMC0uMTYxLjM1N3ptOC00LjU1YTEuNiAxLjYgMCAwIDAtMS42IDEuNnYzLjExaDMuMnYtMy4xMWExLjYgMS42IDAgMCAwLTEuNi0xLjYiLz48L2c+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iMTUuNzUiIHgyPSIxLjIzOCIgeTE9Ii0xLjIyNSIgeTI9IjE4LjQ2MyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiM3OTg2OWMiIHN0eWxlPSJzdG9wLWNvbG9yOiM3OTg2OWM7c3RvcC1jb2xvcjpjb2xvcihkaXNwbGF5LXAzIC40NzQ3IC41MjcgLjYxMjUpO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIuOTk5IiBzdG9wLWNvbG9yPSIjNDU0ZDVhIiBzdHlsZT0ic3RvcC1jb2xvcjojNDU0ZDVhO3N0b3AtY29sb3I6Y29sb3IoZGlzcGxheS1wMyAuMjcwNiAuMzAyIC4zNTI5KTtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+PGZpbHRlciBpZD0iYSIgd2lkdGg9IjIxLjExNyIgaGVpZ2h0PSIyMi4zMyIgeD0iMS40NDIiIHk9Ii43MjkiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPjxmZUdhdXNzaWFuQmx1ciBpbj0iQmFja2dyb3VuZEltYWdlRml4IiBzdGREZXZpYXRpb249IjEuMjc5Ii8+PGZlQ29tcG9zaXRlIGluMj0iU291cmNlQWxwaGEiIG9wZXJhdG9yPSJpbiIgcmVzdWx0PSJlZmZlY3QxX2JhY2tncm91bmRCbHVyXzMxMTFfMzc5NDgyIi8+PGZlQmxlbmQgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9iYWNrZ3JvdW5kQmx1cl8zMTExXzM3OTQ4MiIgcmVzdWx0PSJzaGFwZSIvPjwvZmlsdGVyPjwvZGVmcz48L3N2Zz4="}),
    cloud: Object.freeze({"mode":"background","src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAABICAYAAAC6L9h5AAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAZDSURBVHgB7ZvPUxxFFMdfz8wSg2Wyniw9JEPESFmJtepBbywoaFlAVqusSvDAwh8gJn+AgCc9STzpRSAHoLRKBuSQIqlkuXkSqOQQUyaMfwGb0iLIzkz7epaF7mVZZnZ+7G6lP6nZ1LzN/NjvvH7z3usOgEQikUgkEolEIpFIGh0CDUI6c1lP7Cpp0JTT4NhtQMhpoPQJBZJXgK4rGl2/acybUAfqKtJHKIzjKENAIUsBdA+HmCjcoqrRyTgFq4tITBzbJlN4+TTUzrSqOhNxiKVCzPQMDI6i98zj0+mAYKQoJaPtHRfh0Z/3ViFCYvOkdCaTTNgnF47yHkppDr9bpW78IWYBnLxmgY4xKUmApAjQToxTFY/F7xZ2/3k6kssZeYiAWEQqDi/lLpTFHYxDefy4bmnbkzmj+g/Ec7C/dMsi44SQoQr/ZBOHX3cUwy9ykYoe1LoG5QKh52gaHfb7o6qKRWGt8O92d9geFXlMam9/6wdSNkwogYnbv80N//Xgvu8fg8ewLX/u/JsG7uKpIb3/JYGX1ROJlx4/vLcIIRKpSD39g1n8FWO8zRVoaXYcAoJCwLnzF3NQLhQG9Ndev/Dk0cP7v0NIRCYSi0P49sHXPCRLtrAEKnGEUASD/btnXnn1R9N8sAMhoEBEsJgBQhyiZpgClbi9PMvebhPgvh33eVE71folhEQkIjEvwmd7ibepKu2CqNDQeTRyjTeh5Yt0OpOEEIhEJHzdpwk3zJDpKDPjW8YsUJuuY45lcOak9vzJLIRANMON0iFx15mBqMGcArfvOQshCgxACEQjkvDKx1i0PJ+DiMFr4HWVnJugHtxIKowhF7pIH/RdTosWkoO4QGdiXQLOkky0JnQISOgiEUfR+X3q0A2IC3zN4SZeT02kICChisSSRzzjqGAkdB1iouhI2HPiro7bV70Dnw9BADQIgZ7MYAosYIljqrwaJI4dSWVeCQXbBsAac3aCN7dhTJ/GBzhWawEc2JNYfwhsWENxDrk1C6KF7YIJMaEW/xz1UNowNXncOzA4Bj4JVJb09rkX/Kbczip8opBJS90ezt00YvMkVvy2d1zIKwqdwXvYYG83EPM15uedfht1NbdKmEBYi42LVmoSal9dWf7ZgAagp99tq2RxwLCHqXNfUaz1JlaWZie8nKcmkdhrHjO1u4KRwrqqOZ/Ua0bjKPb6T222o/yK98iHBHQ2p9tLDldTTEKBpgQDClTQtrsaTSAG3hPswHObBSXRjS7Bv2mxc6D85CXZ9C3SXhzSDyzUZB50XPu1nuSMafwkW65QIKQIbV66Bb5FwjiU5fex2r7aiB5UDhNKs/7bwiE2wtu9dAt8ieQmi5wXEXAWV5bnGiJIe4HVd4SVSWLvKXnihVOd1Y7zJRKW2UKPyKEwCU0GLbYLvuZMxAHrUrVjfIlEinlHiXwc1X3YVO4WCD3yQ3gWKZ3JsnGrl/bZJCI0KQR9CTf+/vVqccmzSJq1kxIvBPFV9yHjsGgKRLj/ai2VmgtctiQGmhTilpXCcAOqqME96VnG+3DThCQM01U4C00LZc6k85ZqLR3PImFqL56EQuCOX70gxU14yNVaOp5Fwow1T/iUHvtHYc1rxQm+paGgtSSFyQqsPastsvAVk2wKwkKEsOa14iRh7+JWyAhGsfA9hM9k0hFKEGysjULz4fa9uX3WMrlR7QBfIrkZtlj36B/2Xwltzj1qsNXMJGIPVj+wHj8v6L8LwBYncGBSNtbz8WcNH8RZ801VnDb8Ad9xZtahHD/uWN8iVfCmJM5tLbiLJBqU/e6krdzh7TjOjJWluRvHHV9TMqlqdLisQHTXRB6eva0/eE9gWdBl2eofIA6zTU2j17yco+aJAHeujU0lHSa29dXVOGYhKsV5ordvGbOeivRAC0vf77uSwRuYKltmU7qPHBDVoI61wbLZQosaS63XYpEU1mFngdqZSsuhcQRsKdQaxhkdz+sqA6++PWr5cQPCJsFNUMmnXj2oROA1k2wl7Jk33plBbzmJb4r3oPGge+vFv7W0pyN3jF9M8Emo67iZV+3FANYz1qF+0L2P0mL660FmcyJb7M4Cu2NR3f0vD/F1DFgD+29sWpuFFmc11wSzOBKJRCKRSCQSiUQiCYf/AaLzhaH2gbaFAAAAAElFTkSuQmCC"}),
    aiSidebar: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTExLjI4ODkgMi44NDMwM0MxMS40ODgyIDIuNDQ4OTQgMTEuOTY4OSAyLjI5MDQ3IDEyLjM2MzIgMi40ODk1MkMxMi43NTcyIDIuNjg4NzMgMTIuOTE1NSAzLjE2OTU2IDEyLjcxNjcgMy41NjM3NEw5LjE4MzQ4IDEwLjU1NDlMMTkuMzQ3NSA2Ljg0OTg3QzE5Ljc2MjQgNi42OTg5NCAyMC4yMjE2IDYuOTEyNjQgMjAuMzcyOSA3LjMyNzQxQzIwLjUyNDEgNy43NDIzNiAyMC4zMTAyIDguMjAyMzQgMTkuODk1NCA4LjM1Mzc3TDkuODg5NTMgMTIuMDAxMkwxOS44OTE1IDE1LjY0NzdDMjAuMzA2NSAxNS43OTkxIDIwLjUyMTIgMTYuMjU5IDIwLjM3IDE2LjY3NDFDMjAuMjE4NiAxNy4wODkxIDE5Ljc1ODcgMTcuMzAyOSAxOS4zNDM2IDE3LjE1MTZMOS4xODQ0NSAxMy40NDU2TDEyLjcxNjcgMjAuNDM2OEMxMi45MTU2IDIwLjgzMSAxMi43NTcyIDIxLjMxMTggMTIuMzYzMiAyMS41MTFDMTEuOTY5MSAyMS43MSAxMS40ODg0IDIxLjU1MjMgMTEuMjg4OSAyMS4xNTg1TDcuNDM1NDMgMTMuNTMxNUw1LjAzMjExIDE2Ljg2NTVDNC43NzM3NSAxNy4yMjM2IDQuMjc0MTUgMTcuMzA1IDMuOTE1OSAxNy4wNDcxQzMuNTU3ODEgMTYuNzg4OCAzLjQ3NjI3IDE2LjI4OTIgMy43MzQyNiAxNS45MzA5TDYuNTY4MjQgMTIuMDAwM0wzLjczMTMzIDguMDY4NjJDMy40NzMwOSA3LjcxMDM3IDMuNTUzODcgNy4yMDk5IDMuOTExOTkgNi45NTE0M0M0LjI3MDI3IDYuNjkzMjIgNC43NzA3NCA2Ljc3NDg5IDUuMDI5MTggNy4xMzMwN0w3LjQzNTQzIDEwLjQ2NzFMMTEuMjg4OSAyLjg0MzAzWiIgZmlsbD0iIzQ1NEQ1QSIvPgo8L3N2Zz4K"}),
    space: Object.freeze({"mode":"background","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZD0iTTE5LjEwMyA3Ljc4Yy40Ny4wNDguODQ0LjQyMy44OTIuODkzbC4wMDUuMTAydjEwYTEgMSAwIDAgMS0uODk4Ljk5NWwtLjEwMi4wMDVINWwtLjEwMy0uMDA1QTEgMSAwIDAgMSA0IDE4Ljc3NXYtMTBsLjAwNS0uMTAyYTEgMSAwIDAgMSAuODkyLS44OTNMNSA3Ljc3NWgxNHpNNS4yNSAxOC41MjVoMTMuNXYtOS41SDUuMjV6bTYuNTI2LTcuODAyYS4yNS4yNSAwIDAgMSAuNDQ4IDBsLjkwNSAxLjgxMWEuMjUuMjUgMCAwIDAgLjExMi4xMTFsMS44MTIuOTA3YS4yNS4yNSAwIDAgMSAwIC40NDdsLTEuODEyLjkwNWEuMjUuMjUgMCAwIDAtLjExMi4xMTNsLS45MDUgMS44MTFhLjI1LjI1IDAgMCAxLS40NDggMGwtLjkwNi0xLjgxMWEuMjUuMjUgMCAwIDAtLjExMS0uMTEzTDguOTQ3IDE0YS4yNS4yNSAwIDAgMSAwLS40NDdsMS44MTItLjkwNmEuMjUuMjUgMCAwIDAgLjExMS0uMTEyem01LjIyLTYuNDg5Yy4yOTguMDQuNTY4LjIxMy43MjYuNDc2bDEuMzU3IDIuMjU4aC0xLjQ1OGwtLjg5Ny0xLjQ5MmgtOS40NWwtLjg5NiAxLjQ5Mkg0LjkyTDYuMjczIDQuNzFhMSAxIDAgMCAxIC43MjgtLjQ3N2wuMTMtLjAxaDkuNzM0eiIvPjwvc3ZnPg=="}),
    trash: Object.freeze({"mode":"background","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOC43MjkgNGg3YS41LjUgMCAwIDEgLjUuNXYyaDR2MS4yNWgtMi4wOTNsLS44NzMgMTEuNzg3YS41LjUgMCAwIDEtLjQ5OS40NjNoLTkuMDdhLjUuNSAwIDAgMS0uNS0uNDYzTDYuMzIxIDcuNzVINC4yM1Y2LjVoNHYtMmEuNS41IDAgMCAxIC41LS41bTYuMjUgMS4yNVY2LjVoLTUuNVY1LjI1em0tNi41OSAxMy41LS44MTQtMTFoOS4zMDhsLS44MTUgMTF6TTEyLjg4IDExaC0xLjI1djVoMS4yNXoiIGNsaXAtcnVsZT0iZXZlbm9kZCIgc3R5bGU9ImZpbGw6IzQ1NGQ1YTtmaWxsOmNvbG9yKGRpc3BsYXktcDMgLjI3MDYgLjMwMiAuMzUyOSk7ZmlsbC1vcGFjaXR5OjEiLz48L3N2Zz4="}),
    enterprise: Object.freeze({"mode":"background","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzFlNmZmZiIgZD0iTTMuMzczIDguNWEuOTIuOTIgMCAwIDEgLjUxMS0uODI1bDguMjEzLTQuMDhhLjkyLjkyIDAgMCAxIDEuMzMuODI1djE1Ljc3NGEuOTIuOTIgMCAwIDEtLjkyLjkySDQuMjk0YS45Mi45MiAwIDAgMS0uOTIxLS45MnoiLz48cGF0aCBmaWxsPSJ1cmwoI2EpIiBkPSJNMy4zNzMgOC41YS45Mi45MiAwIDAgMSAuNTExLS44MjVsOC4yMTMtNC4wOGEuOTIuOTIgMCAwIDEgMS4zMy44MjV2MTUuNzc0YS45Mi45MiAwIDAgMS0uOTIuOTJINC4yOTRhLjkyLjkyIDAgMCAxLS45MjEtLjkyeiIvPjxwYXRoIGZpbGw9IiMxMzRhZTAiIGQ9Ik0xNC4zNDggOC44MDNhLjkyLjkyIDAgMCAxIDEuNDgzLS43M2w0LjQzNyAzLjQyMmEuOTIuOTIgMCAwIDEgLjM1OS43Mjl2Ny45NDJhLjkyLjkyIDAgMCAxLS45Mi45MmgtNC40MzhhLjkyLjkyIDAgMCAxLS45Mi0uOTJ6Ii8+PHBhdGggZmlsbD0idXJsKCNiKSIgZD0iTTE0LjM0OCA4LjgwM2EuOTIuOTIgMCAwIDEgMS40ODMtLjczbDQuNDM3IDMuNDIyYS45Mi45MiAwIDAgMSAuMzU5LjcyOXY3Ljk0MmEuOTIuOTIgMCAwIDEtLjkyLjkyaC00LjQzOGEuOTIuOTIgMCAwIDEtLjkyLS45MnoiLz48ZyBmaWx0ZXI9InVybCgjYykiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik02LjA5OSAxMS43MDVhLjY5LjY5IDAgMCAxIC42OS0uNjloMy4yMjNhLjY5LjY5IDAgMCAxIDAgMS4zODFINi43ODlhLjY5LjY5IDAgMCAxLS42OS0uNjkxIi8+PC9nPjxnIGZpbHRlcj0idXJsKCNkKSI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTYuMDk5IDE0LjQ3MmEuNjkuNjkgMCAwIDEgLjY5LS42OWgzLjIyM2EuNjkuNjkgMCAwIDEgMCAxLjM4MUg2Ljc4OWEuNjkuNjkgMCAwIDEtLjY5LS42OTEiLz48L2c+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMTMuNDI4IiB4Mj0iNy43MDgiIHkxPSItLjMiIHkyPSIyNS45NDkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjMzRhNGZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMWU2ZmZmIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIzMi4xNDkiIHgyPSIxNy40ODgiIHkxPSIyMS4wODciIHkyPSI5Ljg1OCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiMxZTZmZmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxNDRkZWIiLz48L2xpbmVhckdyYWRpZW50PjxmaWx0ZXIgaWQ9ImMiIHdpZHRoPSI2LjYwMyIgaGVpZ2h0PSIzLjM4MSIgeD0iNS43NjUiIHk9IjEwLjM0OCIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiPjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+PGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9ImhhcmRBbHBoYSIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIvPjxmZU9mZnNldCBkeD0iLjY2NyIgZHk9Ii4zMzMiLz48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIuNSIvPjxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwLjA5MDE5NjEgMCAwIDAgMCAwLjM2MDc4NCAwIDAgMCAwIDAuOTIxNTY5IDAgMCAwIDAuOCAwIi8+PGZlQmxlbmQgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93XzIzNF81MjU2OSIvPjxmZUJsZW5kIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvd18yMzRfNTI1NjkiIHJlc3VsdD0ic2hhcGUiLz48L2ZpbHRlcj48ZmlsdGVyIGlkPSJkIiB3aWR0aD0iNi42MDMiIGhlaWdodD0iMy4zODEiIHg9IjUuNzY1IiB5PSIxMy4xMTQiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJoYXJkQWxwaGEiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiLz48ZmVPZmZzZXQgZHg9Ii42NjciIGR5PSIuMzMzIi8+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iLjUiLz48ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMC4wOTAxOTYxIDAgMCAwIDAgMC4zNjA3ODQgMCAwIDAgMCAwLjkyMTU2OSAwIDAgMCAwLjggMCIvPjxmZUJsZW5kIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvd18yMzRfNTI1NjkiLz48ZmVCbGVuZCBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJlZmZlY3QxX2Ryb3BTaGFkb3dfMjM0XzUyNTY5IiByZXN1bHQ9InNoYXBlIi8+PC9maWx0ZXI+PC9kZWZzPjwvc3ZnPg=="}),
    create: Object.freeze({"mode":"background","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPjxkZWZzPjxwYXRoIGlkPSJhIiBkPSJNOS4xIDB2Ni44OTlMMTYgNi45djIuMmwtNi45LS4wMDFWMTZINi45VjkuMDk5TDAgOS4xVjYuOWw2Ljg5OS0uMDAxTDYuOSAweiIvPjwvZGVmcz48dXNlIHhsaW5rOmhyZWY9IiNhIiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4="}),
    upload: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJtMTIuNDQyIDQuNTU5IDQgMy45OTktLjg4NC44ODQtMi45MzMtMi45MzN2OC40OTJoLTEuMjVWNi41MDlMOC40NDIgOS40NDJsLS44ODQtLjg4NCA0LTQgLjQ0Mi0uNDR6TTQgMTEuNXY2LjYyNWMwIC40ODMuNDQ4Ljg3NSAxIC44NzVoMTRjLjU1MiAwIDEtLjM5MiAxLS44NzVWMTEuNWgtMS4yNXY2LjI1SDUuMjVWMTEuNXoiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg=="}),
    showRecent: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTguOGMtMy4yMTMgMC02LjIxLTEuODI3LTguMjUyLTQuOTQxLS43MzEtMS4wODItLjczMS0yLjYzNi0uMDEtMy43MDJDNS43ODkgNy4wMjcgOC43ODggNS4yIDEyIDUuMnM2LjIxIDEuODI3IDguMjUxIDQuOTQxYy43MyAxLjA3OS43MzEgMi42MjguMDA2IDMuNzEtMi4wNTIgMy4xMjUtNS4wNDggNC45NDktOC4yNTggNC45NDltNy4xNzQtNS42N2MuNDM0LS42NDEuNDM0LTEuNjE5IDAtMi4yNkMxNy4zNTIgOC4wODggMTQuNzQ4IDYuNSAxMiA2LjVzLTUuMzUyIDEuNTg5LTcuMTc1IDQuMzdjLS40MzQuNjQxLS40MzQgMS42MTkgMCAyLjI2IDEuODIzIDIuNzgxIDQuNDI2IDQuMzcgNy4xNzQgNC4zN3M1LjM1My0xLjU4OSA3LjE3NS00LjM3TTEyIDE1LjEyNWEzLjEyNSAzLjEyNSAwIDEgMCAwLTYuMjUgMy4xMjUgMy4xMjUgMCAwIDAgMCA2LjI1bTAtMS4yNWExLjg3NSAxLjg3NSAwIDEgMSAwLTMuNzUgMS44NzUgMS44NzUgMCAwIDEgMCAzLjc1IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4="}),
    filter: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzQ1NGQ1YSIgZD0iTTQuNTAxIDYuMzQ1aDE1djEuNTloLTE1em0yLjY1IDQuODYxaDkuN3YxLjU5aC05Ljd6bTEuNzEyIDQuODYxaDYuMjc4djEuNTlIOC44NjN6Ii8+PC9zdmc+"}),
    arrowDown: Object.freeze({"mode":"mask","src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iIzgxODY4ZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJtMjQuMDEgMTIuNTQtNy4xNyAxMS4xNTNhMSAxIDAgMCAxLTEuNjgyIDBMNy45OSAxMi41NEExIDEgMCAwIDEgOC44MzIgMTFoMTQuMzM2YTEgMSAwIDAgMSAuODQyIDEuNTQiLz48L3N2Zz4="}),
    star: Object.freeze({"mode":"background","src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMKADAAQAAAABAAAAMAAAAADbN2wMAAAEEElEQVRoBe1ZTUhVQRT+5vl6apY/FUVERfpwE7VsIbaISp8KLdqEuxAXQYQRSUSrllIQEkFEC1e1CNqVhkWLwkW0aRFBKpFh0Z+lZj+aTt+53mf3vt7PjO9eNXgDl5k7c+Y73zln7vxdoJAKHih44L/2gAqLvb6HMszhBvGLEMER1YipMHRFwgB1MDU6oHGITwufjrD0hBIB3Y8KzOAVSVe5xL9gFXaogxgP2pBwIjCLUx7ywrkK83VB80fgEdD3sR7TjvfX+tgqTDAK1eoAPvvq83wJPgK/0UlOfvJCUqMc8215UvZ3DzQCnHk2cqjI2F/tV+O+Kc5EEUahER/Sti+iMtgIaJwlh/TkhZzm1Dovswiq6bsEFgH9AFs49odIsCS9KrdW4SdiiKv9GM0qZ9gYXARmcC4neSElBopsQCmQCND72/ELL8kpZshrGsWoZRReG8pnFMsrAvo5Ypw2a0m+y4K8kIlJH+krGBnZGTTkjIAeQCkmUUOsOGeYOPMarh6SxzkctjIv4pNPmiXeGwLI9zPEfJiIkg9xMh5WdfiRDdxngNbs2od2Au7hRizuEt1MYJ9cNsBA2xQ1A+8cwyKOgQNIoEcputJNPmK6j81z6E02rsi8CM1cRxY4pn4DT9xwrkjuDrdZPPWS8xmgEhhDFPUUGPQKrZDyoHBTzfjo5eMzQBq45R3hvLCX1j7zCi5rWbgUkbxwS0m+b8Dbph+ikmvmHX5Add76JS8rDHDpa1H78DWd7n8ikBRyOkTQwPf+ZN0y5P3c/DVkIi98MkYgSdZZaEZwk5E4nKxbklzhNrahVe3kDitLymmA9HXXh+s04mgWrOCaFHo4obd75/tM4BmHkLeDA5RAG+u6vfUhlbtJvs2EvOg3MkAECag5hZ3koDsv76EkYosO0WWKbzSEvGDucJqiimJvfd5lxe1dAmWmnk/qM45AsgNk9xk0eQEXTMG2TPYGzGG3pQ5z8VnsMheel7Q3QNsrsSBl7ZzFGGCtxNgAbR9dewMQagSsh5DVLKTv8nIKwd9vpkSoglPpREpdxle7CEStvT/KdeNtRu3pGix12BkwZ2iA4jEwwkWvlMfSEp6hpSx1JslUh4sVNcH0yOT6gN+TaBcv16+mHMa7eTlwjYPvGOf7M8Tb5MFMLebS4ZO3jUB6cOWckjp5M1qtmnAphbyjUOqkTWRY0UlDfSerBVaW07TdR9zLQ4Wmf/+mTxweF0jmiu0vJOcXlMZxXiLIbfaGBUiFcRpaufCeo2BsAE9oUd7QyH+uGAmPMb/I8X2Zh41vOXRkbSbuGp78TlDoNJ2zjvl3NKHcdE9kbICw0L088GvuV8pxS9XzuivApB/zGmsSrXTOC14uPAoQugBV8EDBAyvZA38AXKnq4QftIlkAAAAASUVORK5CYII="})
  })
});

// Chrome assets captured from the live docs.qq.com document shell
// (DWUJIRExVTVRaVEFm, 2026-08-27). These are inline SVGs so the topic
// chrome has no runtime dependency on docs.qq.com, CDN URLs, or icon fonts.
const TDOCS_CHROME_ICONS = Object.freeze({
  home: `<svg viewBox="0 0 24 24" fill="none"><path d="M4.52853 9.04885L11.0285 3.36721C11.5887 2.87759 12.4113 2.8776 12.9715 3.36722L19.4715 9.04885C19.8068 9.34193 20 9.77163 20 10.2242V18.4575C20 19.3094 19.3284 20 18.5 20H13.7143V15.201C13.7143 14.6331 13.2666 14.1727 12.7143 14.1727H11.2857C10.7334 14.1727 10.2857 14.6331 10.2857 15.201V20H5.5C4.67157 20 4 19.3094 4 18.4575V10.2242C4 9.77163 4.19323 9.34193 4.52853 9.04885Z" fill="#454D5A"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none"><path d="M13 5V11H19V13H13V19H11V13H5V11H11V5H13Z" fill="#464D5A"/></svg>`,
  status: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#81868F"/><path d="M5.162 8.206 7.239 10.283 11.815 5.706" stroke="#81868F" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  star: `<svg viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 .5a.5.5 0 0 1 .449.279l1.94 3.932 4.34.631a.5.5 0 0 1 .278.853l-3.14 3.061.74 4.323a.5.5 0 0 1-.725.527L8 12.065l-3.882 2.04a.5.5 0 0 1-.725-.526l.741-4.323-3.14-3.061a.5.5 0 0 1 .277-.853l4.34-.63L7.55.778A.5.5 0 0 1 8.002.5ZM8 2.13 6.391 5.39a.5.5 0 0 1-.376.273l-3.598.523L5.02 8.724a.5.5 0 0 1 .144.442L4.55 12.75l3.218-1.692a.5.5 0 0 1 .465 0l3.218 1.692-.615-3.583a.5.5 0 0 1 .144-.442l2.603-2.538-3.597-.523a.5.5 0 0 1-.377-.273L8 2.13Z" fill="#81868F"/></svg>`,
  folder: `<svg viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 3C2 2.44772 2.44771 2 3 2H6.43533C6.71445 2 6.98087 2.11665 7.17018 2.32176L8.71914 4H14.0004C14.5527 4 15.0004 4.44772 15.0004 5V12.0007C15.0004 12.553 14.5527 13.0007 14.0004 13.0007H3C2.44771 13.0007 2 12.553 2 12.0007V3ZM6.43533 3H3V12.0007H14.0004V5H8.71914C8.44002 5 8.17361 4.88335 7.9843 4.67824L6.43533 3Z" fill="#81868F"/></svg>`,
  more: `<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 7H4.5V5.5H19.5V7ZM19.5 18.5015H4.5V17.0015H19.5V18.5015ZM4.5 12.7506H19.5V11.2506H4.5V12.7506Z" fill="#454D5A"/></svg>`,
  ai: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5Z" fill="#1E6FFF"/><path d="M17.4337 8.90589L17.4571 8.64214C16.4767 8.73806 15.6435 9.6552 15.46 9.94172C15.4592 9.97877 15.4577 10.1782 15.4568 10.2227C15.8919 9.69166 16.6619 8.97687 17.4337 8.90589Z" fill="#2FD6FF"/><path d="M12.0744 13.2833C11.2746 11.1615 9.26184 11.2229 8.14021 12.2985L7.4812 13.4675C8.49924 13.0618 11.02 12.8067 12.0744 13.2833Z" fill="#2FD6FF"/><path d="M10.9336 7.44336C11.9645 7.40212 12.9262 7.9744 13.1445 9.03613C13.5689 11.1069 13.8732 12.5695 14.2529 14.4756C14.2533 14.4727 14.2535 14.4697 14.2539 14.4668C14.3766 15.0978 15.2709 15.1271 15.4404 14.5215C15.5137 13.3859 15.4739 11.8613 15.4648 10.5742C15.8834 10.0617 16.7388 9.71869 17.3799 9.63281C17.2847 11.4257 17.354 13.5311 17.2891 14.0225C17.2872 14.0296 17.2833 14.0368 17.2812 14.0439C17.1864 15.3362 16.5057 16.5323 14.9473 16.5879C13.5333 16.638 12.7177 15.6857 12.5127 13.8252L11.6357 9.51562C11.5665 9.17938 11.2772 8.95148 10.9297 8.95117C10.5865 8.95137 10.2622 9.17175 10.125 9.49219L8.77246 12.5928C9.43884 11.8874 11.297 11.9297 12.1777 13.4189C10.6134 13.1373 8.68056 14.0524 7.55957 15.8857C7.42927 16.0989 7.2029 16.2401 6.95312 16.2402H5.64844C6.68802 13.8565 7.69771 11.4538 8.7207 9.05957C9.10827 8.15356 9.9893 7.51944 10.9336 7.44336Z" fill="#1E6FFF"/></svg>`,
  presentation: `<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 4.75052C4 4.33631 4.33579 4.00052 4.75 4.00052H20.25C20.6642 4.00052 21 4.33631 21 4.75052V16.2505C21 16.6647 20.6642 17.0005 20.25 17.0005H4.75C4.33579 17.0005 4 16.6647 4 16.2505V4.75052ZM5.5 5.50052V15.5005H19.5V5.50052H5.5ZM16 20H9V18.5H16V20ZM11 8.3831V12.6169C11 13.0056 11.424 13.2456 11.7572 13.0457L15.2854 10.9287C15.6091 10.7345 15.6091 10.2655 15.2854 10.0713L11.7572 7.95435C11.424 7.75439 11 7.99445 11 8.3831Z" fill="#454D5A"/></svg>`,
  collaborator: `<svg viewBox="0 0 24 24" fill="none"><path d="M6.04785 14.0264C9.40388 10.9101 14.5961 10.9101 17.9521 14.0264C18.6205 14.647 19 15.5186 19 16.4307V18.7783C18.9998 19.1768 18.6768 19.4998 18.2783 19.5H5.72168C5.32318 19.4998 5.00016 19.1768 5 18.7783V16.4307C5 15.5186 5.37948 14.647 6.04785 14.0264ZM16.9316 15.126C14.1511 12.5441 9.84886 12.5441 7.06836 15.126C6.7063 15.4623 6.5 15.9352 6.5 16.4307V18H17.5V16.4307C17.5 15.9352 17.2937 15.4626 16.9316 15.126ZM12 4C13.933 4 15.5 5.567 15.5 7.5C15.5 9.43297 13.933 11 12 11C10.0671 10.9999 8.50004 9.43291 8.5 7.5C8.5 5.56706 10.0671 4.00009 12 4ZM12 5.5C10.8954 5.50009 10 6.39559 10 7.5C10 8.60442 10.8955 9.49991 12 9.5C13.1045 9.5 14 8.60458 14 7.5C14 6.39543 13.1046 5.5 12 5.5Z" fill="#454D5A"/></svg>`,
  wechat: `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#01BD6F"/><path fill-rule="evenodd" d="M7.14 5.987c0 .29.228.52.516.52s.516-.242.516-.52c0-.29-.228-.52-.516-.52s-.516.23-.516.52zm-2.409 0c0 .29.228.52.516.52s.516-.242.516-.52c0-.29-.228-.52-.516-.52s-.516.23-.516.52zm-2.065.855c0-1.722 1.712-3.108 3.814-3.108 1.901 0 3.484 1.132 3.755 2.623h-.213c-1.913 0-3.472 1.271-3.472 2.831 0 .266.047.52.13.763h-.213c-.425 0-.85-.069-1.24-.173-.035-.012-.071-.012-.106-.012a.402.402 0 0 0-.201.058l-.838.474c-.024.011-.047.023-.071.023a.13.13 0 0 1-.13-.127c0-.027.007-.048.016-.072l.007-.02c.012-.011.118-.393.177-.624 0-.012.003-.026.006-.04s.006-.029.006-.04a.26.26 0 0 0-.106-.208c-.815-.566-1.323-1.41-1.323-2.346zm8.171 1.779c0 .237.187.427.421.427a.43.43 0 0 0 .421-.427c0-.237-.187-.427-.421-.427s-.421.19-.421.427zm-2.075 0c0 .237.187.427.421.427a.43.43 0 0 0 .421-.427c0-.237-.187-.427-.421-.427s-.421.19-.421.427zm4.57.848c0 .782-.415 1.495-1.071 1.973a.167.167 0 0 0-.081.175c0 .023 0 .047.011.07l.106.404.032.121c0 .019.004.035.007.049s.005.022.005.033a.104.104 0 0 1-.104.105c-.017 0-.027-.006-.041-.014l-.696-.406a.37.37 0 0 0-.161-.047c-.034 0-.069 0-.092.012a3.6 3.6 0 0 1-1.013.14c-1.715 0-3.097-1.168-3.097-2.616s1.381-2.616 3.097-2.616 3.097 1.168 3.097 2.616z" fill="#fff"/></svg>`,
  arrow: `<svg viewBox="0 0 6 5" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.65006 4.80116C2.81654 5.06628 3.18346 5.06628 3.34994 4.80116L5.92866 0.694234C6.11499 0.397484 5.91463 0 5.57872 0H0.421278C0.0853699 0 -0.114986 0.397485 0.0713419 0.694234L2.65006 4.80116Z" fill="#81868F"/></svg>`,
  undo: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" d="M9 10.9a.2.2 0 0 1-.302.173L4.276 8.474a.2.2 0 0 1-.01-.339l4.423-2.93a.2.2 0 0 1 .31.167v2.252l5 .001c3.149 0 5.626 2.306 5.626 5.375 0 3.033-2.4 5.505-5.404 5.62l-.221.005H7v-1.25h7A4.375 4.375 0 0 0 18.375 13c0-2.289-1.788-4.02-4.158-4.12L14 8.875H9z"/></svg>`,
  redo: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" d="M15 10.9a.2.2 0 0 0 .302.173l4.422-2.599a.2.2 0 0 0 .01-.339l-4.423-2.93a.2.2 0 0 0-.31.167v2.252l-5 .001c-3.149 0-5.626 2.306-5.626 5.375 0 3.033 2.4 5.505 5.404 5.62l.221.005h7v-1.25h-7A4.375 4.375 0 0 1 5.625 13c0-2.289 1.788-4.02 4.158-4.12L10 8.875h5z"/></svg>`,
  format: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M5.5 5h13a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-4.23l-1.52 1.489V14h.75v4.078L10.5 20v-6h1v-2h.008l-.001-.001 1.02-.999H5.5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5m.75 1.25v3.5h11.5v-3.5z" clip-rule="evenodd"/></svg>`,
  clear: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" d="M5 18.25h14v1.25H5zM7.167 17l-2.92-2.92a.487.487 0 0 1 .013-.688l8.405-8.405a.487.487 0 0 1 .688-.013l5.4 5.4c.166.166.18.427.045.62l-.058.068L12.802 17h-1.689l2.93-2.93-4.387-4.388-4.028 4.028L8.918 17z"/><path fill="#454D5A" fill-rule="evenodd" d="M7 15.75h6L12 17H8z" clip-rule="evenodd"/></svg>`,
  insert: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.375" stroke="#454D5A" stroke-width="1.25"/><path fill="#454D5A" fill-rule="evenodd" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18m0 1.25a7.75 7.75 0 1 0 0 15.5 7.75 7.75 0 0 0 0-15.5m.61 7.119V8h-1.25v3.369L8 11.37v1.25l3.36-.001V16h1.25v-3.381l3.39.001v-1.25z" clip-rule="evenodd"/></svg>`,
  fontPlus: `<svg viewBox="0 0 25 24" fill="none"><path fill="#464D5A" fill-rule="evenodd" d="M19.027 7.251v-2.25h-1.5v2.25h-2.25v1.5h2.25v2.25h1.5v-2.25h2.25v-1.5zm-8.645-2.249h1.788l5.107 14h-1.615L14.22 15.06H8.304l-1.446 3.942H5.276zm.883 1.984 2.405 6.574H8.854z" clip-rule="evenodd"/></svg>`,
  fontMinus: `<svg viewBox="0 0 25 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M12.17 5.002h-1.788l-3.12 8.558h-.019v.049l-1.967 5.393h1.582l1.446-3.942h5.915l1.443 3.942h1.615zm1.5 8.558-2.405-6.574-2.411 6.574zm7.606-5.708h-6v1.5h6z" clip-rule="evenodd"/></svg>`,
  pinyin: `<svg viewBox="0 0 24 24" fill="none"><path fill="#464D5A" fill-rule="evenodd" d="M12.705 7.651h-1.41L8.4 15.222h1.325l.69-1.898h3.17l.69 1.898H15.6zm.51 4.655h-2.43l1.2-3.319h.042z" clip-rule="evenodd"/><path fill="#454D5A" fill-rule="evenodd" d="M12 19.25a7.25 7.25 0 1 0 0-14.5 7.25 7.25 0 0 0 0 14.5m0 1.25a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17" clip-rule="evenodd"/></svg>`,
  bold: `<svg viewBox="0 0 25 25" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M8.71 7.503h4.095a2.134 2.134 0 1 1 0 4.268H8.71zm-1.3 4.342V6.203h5.395a3.434 3.434 0 0 1 2.296 5.988 3.68 3.68 0 0 1-1.56 7.012H7.41v-7.358m1.3 1.3v4.758h4.831a2.38 2.38 0 0 0 0-4.758z" clip-rule="evenodd"/></svg>`,
  italic: `<svg viewBox="0 0 25 25" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M10.595 5.908h6.5v1.25h-2.29l-3.471 10.367h2.76v1.25h-7v-1.25h2.658l3.472-10.367h-2.63z" clip-rule="evenodd"/></svg>`,
  underline: `<svg viewBox="0 0 25 25" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M18.856 18.573v1.25h-13v-1.25zM9.256 4.91v7.5a3.1 3.1 0 0 0 2.925 3.095l.175.005a3.1 3.1 0 0 0 3.095-2.924l.005-.176v-7.5h1.4v7.5a4.5 4.5 0 1 1-9 0v-7.5z" clip-rule="evenodd"/></svg>`,
  strike: `<svg viewBox="0 0 25 25" fill="none"><path fill="#454D5A" d="M8.92 11.16a2.971 2.971 0 0 1-.886-2.273 3.3 3.3 0 0 1 .514-1.817c.38-.55.9-.982 1.505-1.249a4.6 4.6 0 0 1 2.019-.454 5.24 5.24 0 0 1 3.836 1.662L15.1 8a4.15 4.15 0 0 0-3.028-1.29 2.85 2.85 0 0 0-1.848.61c-.46.364-.722.932-.706 1.527-.007.371.107.734.323 1.032.2.278.455.51.747.682.274.18.633.34 1.096.548l.045.02.072.032zM15.666 13.378a3.28 3.28 0 0 1 .686 2.199 3.6 3.6 0 0 1-.545 1.94 3.7 3.7 0 0 1-1.545 1.353 5.26 5.26 0 0 1-2.342.496 6 6 0 0 1-2.544-.537 6.2 6.2 0 0 1-2.019-1.476l.909-1.033a5.4 5.4 0 0 0 1.676 1.27 4.6 4.6 0 0 0 2.019.465 3.3 3.3 0 0 0 2.13-.64 2.32 2.32 0 0 0 .505-2.84 2.13 2.13 0 0 0-.727-.722q-.61-.354-1.252-.64L15.1 13.378z"/><path fill="#454D5A" d="M5.357 12.367h14v1.5h-14z"/></svg>`,
  superscript: `<svg viewBox="0 0 25 25" fill="none"><path fill="#454D5A" d="M21.42 11.205V10.18h-2.576q.202-.302.467-.53.265-.226.545-.424t.556-.4.495-.449q.218-.247.35-.567t.132-.765q0-.428-.152-.773a1.7 1.7 0 0 0-1.004-.94 2 2 0 0 0-.712-.127q-.49 0-.867.18a1.7 1.7 0 0 0-.627.505q-.249.324-.373.756-.125.433-.11.937h1.059q0-.235.043-.475t.144-.437a.9.9 0 0 1 .268-.319.68.68 0 0 1 .409-.122q.358 0 .587.24.23.24.23.668 0 .27-.113.479-.112.21-.28.378a2.6 2.6 0 0 1-.37.307q-.203.138-.381.273-.35.26-.665.512t-.549.55a2.4 2.4 0 0 0-.37.677 2.6 2.6 0 0 0-.136.891z"/><path fill="#464D5A" fill-rule="evenodd" d="m15.27 18.399-9-11 1.3-1.064 9 11z" clip-rule="evenodd"/><path fill="#464D5A" fill-rule="evenodd" d="m7.57 18.399 9-11-1.3-1.064-9 11z" clip-rule="evenodd"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M6.25 5.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5m0 5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5M5 17a1.25 1.25 0 1 1 2.5 0A1.25 1.25 0 0 1 5 17m15-9.6V6H9v1.4zm0 5.3v-1.4H9v1.4zm0 3.9V18H9v-1.4z" clip-rule="evenodd"/></svg>`,
  numbered: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M7.74 8.28V9H5.39v-.72h.79V6.165h-.685v-.55c.4-.075.66-.175.92-.335h.655v3zm.05 4.97V14H5.21v-.51c.93-.845 1.555-1.52 1.555-2.06 0-.34-.19-.525-.485-.525-.255 0-.455.17-.63.36l-.485-.48c.365-.385.705-.575 1.235-.575.72 0 1.22.46 1.22 1.17 0 .64-.55 1.345-1.12 1.92.185-.025.44-.05.605-.05zm-1.395 5.82c.74 0 1.375-.39 1.375-1.085 0-.48-.305-.78-.72-.905v-.025c.4-.16.6-.45.6-.82 0-.665-.505-1.025-1.275-1.025-.44 0-.81.17-1.155.46l.45.545c.225-.195.415-.31.665-.31.275 0 .425.14.425.395 0 .295-.2.49-.835.49v.625c.78 0 .95.19.95.51 0 .28-.225.425-.57.425-.29 0-.55-.145-.775-.36l-.41.56c.27.315.685.52 1.275.52M20 7.4V6H9v1.4zm0 5.3v-1.4H9v1.4zm0 3.9V18H9v-1.4z" clip-rule="evenodd"/></svg>`,
  todo: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="m15.78 6.298 1.3-1.3L6 5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V11.28l-1.3 1.3V17.7H6.3V14l-.003-4L6.3 6.3zm3.877 1.443a.65.65 0 0 0-.92-.92l-7.106 7.107-2.369-2.369a.65.65 0 1 0-.919.92l2.935 2.934a.5.5 0 0 0 .707 0z" clip-rule="evenodd"/></svg>`,
  outdent: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" d="M5 5.75h14V7H5zM8 15l-3-3 3-3zM10 9.5h9v1.25h-9zM10 13.25h9v1.25h-9zM19 17H5v1.25h14z"/></svg>`,
  indent: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M19 5.75H5V7h14zM5 15l3-3-3-3zm14-5.5h-9v1.25h9zm0 3.75h-9v1.25h9zM5 17h14v1.25H5z" clip-rule="evenodd"/></svg>`,
  spacing: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" d="M7.6 8H9L7 5 5 8h1.4v8H5l2 3 2-3H7.6zM20 6.25h-9.5V7.5H20zM10.5 11.38H20v1.25h-9.5zM20 16.5h-9.5v1.25H20z"/></svg>`,
  alignLeft: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M5 6h14v1.4H5zm0 5.3h8v1.4H5zm0 5.3h14V18H5z" clip-rule="evenodd"/></svg>`,
  alignCenter: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" d="M5 6h14v1.4H5zM8 11.3h8v1.4H8zM19 16.6H5V18h14z"/></svg>`,
  alignRight: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M5 6h14v1.4H5zm6 5.3h8v1.4h-8zM19 16.6H5V18h14z" clip-rule="evenodd"/></svg>`,
  justify: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M5 6h14v1.4H5zm0 5.3h14v1.4H5zm14 5.3H5V18h14z" clip-rule="evenodd"/></svg>`,
  distribute: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M5 19h1.25V5H5zm12.75 0H19V5h-1.25zM7.5 16h9v1.25h-9zm9-4H7.5v1.25h9zM14 10V8.6h-4V10L7 8l3-2v1.4h4V6l3 2z" clip-rule="evenodd"/></svg>`,
  quote: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M5 6h1.199v13H5zm5 11c1.956-.957 4.164-4.128 4.164-6.968 0-1.755-1.1-3.032-2.414-3.032-1.375 0-2.078 1.053-2.078 2.074 0 1.15.764 2.043 1.925 2.043.337 0 .642-.128.825-.255 0 1.404-1.444 4.255-3.094 5.117zm5.822 0c1.956-.957 4.165-4.128 4.165-6.968 0-1.755-1.1-3.032-2.414-3.032-1.375 0-2.078 1.053-2.078 2.074 0 1.15.764 2.043 1.925 2.043.336 0 .642-.128.825-.255 0 1.404-1.445 4.255-3.095 5.117z" clip-rule="evenodd"/></svg>`,
  block: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M5.25 10.75v-4.5h13v4.5zM4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm0 8.4h16v1.25H4zm0 3.35h8V19H4z" clip-rule="evenodd"/></svg>`,
  paragraph: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M21 6.29H5v1.5h16zM5 13.04h6v-1.5H5zm0 5.25h6v-1.5H5zm12.5-6.42-3 1.717V17l3 1.717 3-1.717v-3.413zm.497-1.444a1 1 0 0 0-.994 0l-3.5 2.003a1 1 0 0 0-.503.868v3.993a1 1 0 0 0 .503.867l3.5 2.004a1 1 0 0 0 .994 0l3.5-2.004A1 1 0 0 0 22 17.29v-3.993a1 1 0 0 0-.503-.868zM19 15.29a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" clip-rule="evenodd"/></svg>`,
  style: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M6.25 18.25V5.75h11.5V13H19V5.5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6v-1.25z" clip-rule="evenodd"/><path fill="#454D5A" d="m19.828 14.506-1.54 1.539c.587.91.491 2.152-.286 2.955-1.96 2.025-4.813.552-4.991-.736-.077-.556.256-.514.613-.468.24.03.491.063.635-.085.138-.143.116-.342.09-.586-.043-.384-.097-.88.445-1.44a2.214 2.214 0 0 1 2.783-.343l1.544-1.543zm-2.545 1.875a1.22 1.22 0 0 0-1.771 0c-.284.293-.15.6-.144.97.01.56-.272 1.102-.791 1.338.89.511 1.987.358 2.706-.384a1.4 1.4 0 0 0 0-1.924"/></svg>`,
  adjust: `<svg viewBox="0 0 24 24" fill="none"><path fill="#444D5B" fill-rule="evenodd" d="M11.222 18.222c0 .43-.348.778-.778.778H5.778A.78.78 0 0 1 5 18.222v-4.666c0-.43.348-.778.778-.778h4.666c.43 0 .778.348.778.778zM6.25 17.75h3.722v-3.722H6.25zm4.972-7.306c0 .43-.348.778-.778.778H5.778A.78.78 0 0 1 5 10.444V5.778c0-.43.348-.778.778-.778h4.666c.43 0 .778.348.778.778zM6.25 9.973h3.722V6.25H6.25zM18.222 19c.43 0 .778-.348.778-.778v-4.666a.78.78 0 0 0-.778-.778h-4.666a.78.78 0 0 0-.778.778v4.666c0 .43.348.778.778.778zm-.472-1.25h-3.723v-3.722h3.723z" clip-rule="evenodd"/><path fill="#454D5A" fill-rule="evenodd" d="m19.65 5.58-.738-.738-1.61 1.609a2.31 2.31 0 0 0-2.905.36c-.566.584-.51 1.1-.465 1.501.028.255.05.463-.094.612-.15.154-.41.12-.661.089-.373-.048-.72-.093-.64.487.186 1.345 3.161 2.882 5.207.768.811-.837.91-2.132.299-3.082z" clip-rule="evenodd"/></svg>`,
  beautify: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M6.25 18.25V5.75h11.5V13H19V5.5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6v-1.25zM15 9.5H8.5v1.25H15zm-3 3.75H8.5v1.25H12z" clip-rule="evenodd"/><path fill="#454D5A" d="m16.734 13.928 1.023 1.977 1.977 1.023-1.977 1.022-1.023 1.978-1.022-1.978-1.978-1.022 1.978-1.023z"/></svg>`,
  image: `<svg viewBox="0 0 25 25" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M5.564 6.828v5.167c2.382.163 4.554.795 6.22 1.878 1.637 1.063 2.79 2.567 3.134 4.455h4.147v-11.5zm-1.25 11.75v-12a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1m6.79-3.657c-1.431-.93-3.355-1.512-5.54-1.673v5.08h8.078c-.323-1.405-1.218-2.55-2.538-3.407m5.826-4.082a1.185 1.185 0 1 1-2.37 0 1.185 1.185 0 0 1 2.37 0m1.25 0a2.435 2.435 0 1 1-4.87 0 2.435 2.435 0 0 1 4.87 0" clip-rule="evenodd"/></svg>`,
  pdf: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M4.1 3.375c-.4 0-.725.325-.725.725v10.8c0 .4.325.725.725.725h4.275V19.9c0 .4.325.725.725.725h10.8c.4 0 .725-.325.725-.725V9.1c0-.4-.325-.725-.725-.725h-4.275V4.1c0-.4-.325-.725-.725-.725zm10.275 5v-3.75h-9.75v9.75h3.75V9.1c0-.4.325-.725.725-.725zm-4.75 11v-9.75h9.75v9.75z" clip-rule="evenodd"/></svg>`,
  quick: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M17.625 3.377c0-.744-.986-1.006-1.355-.36L9.923 14.125h3.452v6.999c0 .743.986 1.005 1.354.36l6.348-11.109h-3.452zm-5.548 9.498 4.298-7.521v6.271h2.548l-4.298 7.522v-6.272zM8 12v1.25H3V12h5M6 8H5v1.25h5V8H6m0 8H5v1.25h5V16H6" clip-rule="evenodd"/></svg>`,
  plugin: `<svg viewBox="0 0 25 25" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M14.523 7.298v-3.2h1.526v3.2h2.507a1 1 0 0 1 1 1v6.8a3.2 3.2 0 0 1-3.2 3.2h-8.6a3.2 3.2 0 0 1-3.2-3.2v-6.8a1 1 0 0 1 1-1h2.508v-3.2h1.5v3.2zm1.833 9.7h-8.6a1.9 1.9 0 0 1-1.894-1.751l-.006-.149V8.6h12.4v6.5a1.9 1.9 0 0 1-1.752 1.894zm-1.3 2.192h-6v1.3h6z" clip-rule="evenodd"/></svg>`,
  print: `<svg viewBox="0 0 25 25" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M8.306 5.644v2.15h7.5v-2.15zm8.75 2.15v-2.4a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v2.4h-2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2h2a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1zm-11.75 7.75v-6.5h13.5v6.5h-1.75v-1.75a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v1.75zm3-1.5v4.5h7.5v-4.5z" clip-rule="evenodd"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none"><path fill="#454D5A" fill-rule="evenodd" d="M15.847 6.908a6.244 6.244 0 0 0-8.986 0c-2.481 2.545-2.481 6.67 0 9.214a6.24 6.24 0 0 0 8.628.34l2.26 2.318a.72.72 0 0 0 1.036 0 .765.765 0 0 0 0-1.063l-2.299-2.359c1.82-2.548 1.608-6.147-.639-8.45M7.83 15.13c-1.947-1.997-1.947-5.233 0-7.23a4.9 4.9 0 0 1 7.05 0c1.948 1.997 1.948 5.233 0 7.23a4.9 4.9 0 0 1-7.05 0" clip-rule="evenodd"/></svg>`,
  toolSwitch: `<svg viewBox="0 0 24 24" fill="none"><path stroke="#464D5A" stroke-width="1.35" d="M6.343 15 12 9.343 17.657 15"/></svg>`
});

function renderTdocsChromeIcon(name, size = 24, className = '') {
  const svg = TDOCS_CHROME_ICONS[name];
  if (!svg) return '';
  return `<span aria-hidden="true" class="qqdocs-chrome-icon ${className}" style="width:${size}px;height:${size}px">${svg}</span>`;
}

function renderOfficialIcon(name, size = 16, className = '') {
  const asset = ICONS.uiIcons[name];
  if (!asset) return '';
  const common = `display:inline-block;width:${size}px;height:${size}px;flex:0 0 ${size}px;background-position:center;background-repeat:no-repeat;background-size:contain;`;
  const paint = asset.mode === 'mask'
    ? `background-color:currentColor;-webkit-mask-image:url('${asset.src}');mask-image:url('${asset.src}');-webkit-mask-position:center;mask-position:center;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-size:contain;mask-size:contain;`
    : `background-image:url('${asset.src}');`;
  return `<i aria-hidden="true" class="qqdocs-official-icon ${className}" style="${common}${paint}"></i>`;
}

function renderOfficialFileIcon(type = 'sheet', size = 24) {
  const src = ICONS.pngIcons[type] || ICONS.pngIcons.sheet;
  return `<i aria-hidden="true" class="qqdocs-official-file-icon" style="display:inline-block;width:${size}px;height:${size}px;flex:0 0 ${size}px;background:url('${src}') center/contain no-repeat;"></i>`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ICONS, TDOCS_CHROME_ICONS, renderTdocsChromeIcon, renderOfficialIcon, renderOfficialFileIcon };
}


  // 腾讯文档官方原型对齐的伪装核心引擎
const DisguiseEngine = (function () {
  let domObserver = null;
  let renderPassQueued = false;
  let routeListenersAttached = false;
  let postImageInteractionsAttached = false;

  const PAGE_SCOPE_CLASSES = [
    'qqdocs-page-secondary',
    'qqdocs-page-home',
    'qqdocs-page-list',
    'qqdocs-page-search',
    'qqdocs-page-topic',
    'qqdocs-page-categories',
    'qqdocs-page-tags',
    'qqdocs-page-badges',
    'qqdocs-page-users',
    'qqdocs-page-groups',
    'qqdocs-page-group',
    'qqdocs-page-user',
    'qqdocs-page-preferences',
    'qqdocs-page-bookmarks',
    'qqdocs-page-notifications',
    'qqdocs-page-messages',
    'qqdocs-page-about',
    'qqdocs-page-static',
    'qqdocs-page-auth',
    'qqdocs-page-review',
    'qqdocs-page-chat',
    'qqdocs-page-error',
    'qqdocs-page-generic'
  ];

  const POST_IMAGE_TOGGLE_WRAPPER = 'qqdocs-image-toggle';
  const POST_IMAGE_TOGGLE_HIDDEN = 'qqdocs-image-toggle--hidden';
  const POST_IMAGE_TOGGLE_SHOWN = 'qqdocs-image-toggle--shown';
  const POST_IMAGE_TOGGLE_OVERLAY = 'qqdocs-image-toggle-overlay';
  const POST_IMAGE_BOUND_ATTRIBUTE = 'data-qqdocs-image-toggle-bound';
  const POST_IMAGE_WRAPPER_ATTRIBUTE = 'data-qqdocs-image-toggle-wrapper';

  const POST_BODY_EMOJI_SELECTOR = [
    '.post-stream .cooked img.emoji',
    '.post-stream .cooked img.emoticon',
    '.post-stream .cooked img[data-emoji]',
    '.post-stream .cooked img[data-emoticon]',
    '.post-stream .cooked [data-emoji] > img',
    '.post-stream .cooked [data-emoticon] > img',
    '.post-stream .cooked [data-emoji-image]',
    '.post-stream .cooked [data-emoji-image] > img'
  ].join(', ');
  // Post metadata can contain the same emoji renderers as the cooked body,
  // but it is a separate, deliberately narrow scope. Metadata also contains
  // identity/avatar markup, so only the known emoji markers below qualify.
  const POST_META_EMOJI_SELECTOR = [
    '.post-stream .topic-meta-data img.emoji',
    '.post-stream .topic-meta-data img.emoticon',
    '.post-stream .topic-meta-data img[data-emoji]',
    '.post-stream .topic-meta-data img[data-emoticon]',
    '.post-stream .topic-meta-data [data-emoji] > img',
    '.post-stream .topic-meta-data [data-emoticon] > img',
    '.post-stream .topic-meta-data img[data-emoji-image]',
    '.post-stream .topic-meta-data [data-emoji-image] > img'
  ].join(', ');
  // Reaction summaries live in the post action bar rather than .cooked. Keep
  // this scope anchored to Discourse's reaction-list container so SVG action
  // icons, counters, avatars, and other controls are never treated as emoji.
  const POST_REACTION_EMOJI_SELECTOR = [
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji img.emoji',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji img.emoticon',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji img[data-emoji]',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji img[data-emoticon]',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji [data-emoji] > img',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji [data-emoticon] > img',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji [data-emoji-image]',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji [data-emoji-image] > img',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img.emoji',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img.emoticon',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img[data-emoji]',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img[data-emoticon]',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji [data-emoji] > img',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji [data-emoticon] > img',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji [data-emoji-image]',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji [data-emoji-image] > img'
  ].join(', ');
  const POST_BOOST_EMOJI_SELECTOR = [
    '.post-stream button.discourse-boosts__cooked img.emoji',
    '.post-stream button.discourse-boosts__cooked img.emoticon',
    '.post-stream button.discourse-boosts__cooked img[data-emoji]',
    '.post-stream button.discourse-boosts__cooked img[data-emoticon]',
    '.post-stream button.discourse-boosts__cooked [data-emoji] > img',
    '.post-stream button.discourse-boosts__cooked [data-emoticon] > img',
    '.post-stream button.discourse-boosts__cooked [data-emoji-image] > img'
  ].join(', ');
  const POST_EMOJI_SELECTOR = `${POST_BODY_EMOJI_SELECTOR}, ${POST_META_EMOJI_SELECTOR}, ${POST_REACTION_EMOJI_SELECTOR}, ${POST_BOOST_EMOJI_SELECTOR}`;
  const POST_EMOJI_WRAPPER = 'qqdocs-emoji-wrapper';
  const POST_REACTION_EMOJI_WRAPPER = 'qqdocs-emoji-wrapper--reaction';
  const POST_EMOJI_LABEL = 'qqdocs-emoji-label';
  const POST_EMOJI_BOUND_ATTRIBUTE = 'data-qqdocs-emoji-bound';
  const POST_EMOJI_WRAPPER_ATTRIBUTE = 'data-qqdocs-emoji-wrapper';
  const POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE = 'data-qqdocs-emoji-aria-hidden-added';

  // The map intentionally contains common Discourse/Unicode aliases only. A
  // site-specific shortcode remains readable through the shortcode fallback.
  const COMMON_EMOJI_DESCRIPTIONS = Object.freeze({
    // Faces and emotions
    grinning: '咧嘴笑',
    grinning_face: '咧嘴笑',
    grin: '露齿笑',
    smile: '微笑',
    smiling_face: '微笑',
    blush: '害羞',
    smiling_face_with_smiling_eyes: '害羞',
    innocent: '天真',
    smiling_face_with_halo: '天真',
    slight_smile: '淡淡微笑',
    slightly_smiling_face: '淡淡微笑',
    upside_down_face: '颠倒脸',
    rofl: '大笑',
    rolling_on_the_floor_laughing: '大笑',
    joy: '喜极而泣',
    face_with_tears_of_joy: '喜极而泣',
    laugh: '笑',
    laughing: '大笑',
    grinning_face_with_smiling_eyes: '大笑',
    satisfied: '满意',
    beaming_face_with_smiling_eyes: '满意',
    sweat_smile: '汗笑',
    grinning_face_with_sweat: '汗笑',
    wink: '眨眼',
    winking_face: '眨眼',
    yum: '好吃',
    face_savoring_food: '好吃',
    stuck_out_tongue: '吐舌',
    face_with_tongue: '吐舌',
    stuck_out_tongue_winking_eye: '眨眼吐舌',
    winking_face_with_tongue: '眨眼吐舌',
    stuck_out_tongue_closed_eyes: '闭眼吐舌',
    squinting_face_with_tongue: '闭眼吐舌',
    money_mouth_face: '财迷',
    hugs: '拥抱',
    hugging: '拥抱',
    smiling_face_with_open_hands: '拥抱',
    hugging_face: '拥抱',
    kissing_heart: '飞吻',
    face_blowing_a_kiss: '飞吻',
    kissing: '亲吻',
    kissing_face: '亲吻',
    kissing_smiling_eyes: '微笑亲吻',
    kissing_face_with_smiling_eyes: '微笑亲吻',
    kissing_closed_eyes: '闭眼亲吻',
    kissing_face_with_closed_eyes: '闭眼亲吻',
    heart_eyes: '花痴',
    smiling_face_with_heart_eyes: '花痴',
    star_struck: '星星眼',
    zany_face: '滑稽',
    crazy_face: '疯狂',
    woozy_face: '迷糊',
    sweat: '冷汗',
    downcast_face_with_sweat: '冷汗',
    thinking: '思考',
    thinking_face: '思考',
    neutral_face: '面无表情',
    expressionless: '无表情',
    unamused: '不满',
    pensive: '沉思',
    confused: '困惑',
    relieved: '如释重负',
    relieved_face: '如释重负',
    relaxed: '放松',
    smirk: '得意',
    smirking_face: '得意',
    no_mouth: '无语',
    face_without_mouth: '无语',
    zipper_mouth_face: '闭嘴',
    shushing_face: '嘘',
    lying_face: '说谎',
    rolling_eyes: '翻白眼',
    face_with_rolling_eyes: '翻白眼',
    grimacing: '龇牙',
    grimacing_face: '龇牙',
    frowning: '皱眉',
    frowning_face: '皱眉',
    worried: '担心',
    worried_face: '担心',
    angry: '生气',
    angry_face: '生气',
    rage: '暴怒',
    enraged_face: '暴怒',
    disappointed: '失望',
    disappointed_face: '失望',
    cry: '哭泣',
    crying_face: '哭泣',
    sob: '痛哭',
    loudly_crying_face: '痛哭',
    fearful: '害怕',
    fearful_face: '害怕',
    scared: '害怕',
    scream: '尖叫',
    face_screaming_in_fear: '尖叫',
    astonished: '惊讶',
    astonished_face: '惊讶',
    flushed: '脸红',
    weary: '疲惫',
    weary_face: '疲惫',
    tired_face: '疲倦',
    sleepy: '困倦',
    sleepy_face: '困倦',
    sleeping: '睡觉',
    sleeping_face: '睡觉',
    drooling_face: '流口水',
    dizzy_face: '晕眩',
    nauseated_face: '恶心',
    vomiting_face: '呕吐',
    face_vomiting: '呕吐',
    sneezing_face: '打喷嚏',
    mask: '生病',
    face_with_medical_mask: '生病',
    thermometer_face: '发烧',
    face_with_thermometer: '发烧',
    exploding_head: '爆炸头',
    cowboy_hat_face: '牛仔帽',
    clown_face: '小丑',
    imp: '小恶魔',
    smiling_imp: '恶魔',
    smiling_face_with_horns: '恶魔',
    angry_face_with_horns: '小恶魔',
    skull: '骷髅',
    skull_and_crossbones: '骷髅头',
    ghost: '幽灵',
    alien: '外星人',
    robot: '机器人',
    poop: '便便',
    hankey: '便便',
    shit: '便便',
    // Hands, gestures, and body parts
    wave: '挥手',
    raised_back_of_hand: '举手背',
    raised_hand: '举手',
    hand: '举手',
    raised_hand_with_fingers_splayed: '举手',
    open_hands: '张开双手',
    palms_up_together: '双手向上',
    point_up: '指向上方',
    index_pointing_up: '指向上方',
    point_up_2: '指向上方',
    backhand_index_pointing_up: '指向上方',
    point_down: '指向下方',
    backhand_index_pointing_down: '指向下方',
    point_left: '指向左方',
    backhand_index_pointing_left: '指向左方',
    point_right: '指向右方',
    backhand_index_pointing_right: '指向右方',
    thumbsup: '点赞',
    '+1': '点赞',
    thumbs_up: '点赞',
    thumbsdown: '点踩',
    '-1': '点踩',
    thumbs_down: '点踩',
    ok_hand: '好的手势',
    pinched_fingers: '捏指',
    pinching_hand: '捏合',
    v: '胜利手势',
    victory_hand: '胜利手势',
    crossed_fingers: '祈求好运',
    fingers_crossed: '祈求好运',
    love_you_gesture: '我爱你手势',
    metal: '摇滚手势',
    sign_of_the_horns: '摇滚手势',
    call_me_hand: '打电话手势',
    handshake: '握手',
    clap: '鼓掌',
    clapping_hands: '鼓掌',
    pray: '祈祷',
    folded_hands: '祈祷',
    muscle: '肌肉',
    flexed_biceps: '展示肌肉',
    fist: '拳头',
    punch: '出拳',
    facepunch: '出拳',
    oncoming_fist: '出拳',
    raised_fist: '举拳',
    left_facing_fist: '左拳',
    right_facing_fist: '右拳',
    writing_hand: '写字',
    nail_care: '美甲',
    ear: '耳朵',
    eyes: '双眼',
    eye: '眼睛',
    lips: '嘴唇',
    tongue: '舌头',
    nose: '鼻子',
    brain: '大脑',
    // Hearts, symbols, and celebration
    heart: '红心',
    red_heart: '红心',
    orange_heart: '橙心',
    yellow_heart: '黄心',
    green_heart: '绿心',
    blue_heart: '蓝心',
    purple_heart: '紫心',
    black_heart: '黑心',
    white_heart: '白心',
    brown_heart: '棕心',
    broken_heart: '心碎',
    sparkling_heart: '闪耀的心',
    growing_heart: '成长的心',
    heartpulse: '心跳',
    heartbeat: '心跳',
    beating_heart: '心跳',
    revolving_hearts: '旋转的心',
    two_hearts: '两颗心',
    couple_with_heart: '情侣心',
    gift_heart: '爱心礼物',
    cupid: '丘比特',
    fire: '火焰',
    sparkles: '闪光',
    star: '星星',
    star2: '发光星星',
    glowing_star: '发光星星',
    dizzy: '头晕',
    boom: '爆炸',
    collision: '碰撞',
    anger: '怒气',
    sweat_drops: '汗滴',
    sweat_droplets: '汗滴',
    dash: '飞奔',
    dashing_away: '飞奔',
    100: '满分',
    hundred_points: '满分',
    exclamation: '感叹号',
    red_exclamation_mark: '感叹号',
    question: '问号',
    red_question_mark: '问号',
    grey_exclamation: '灰色感叹号',
    white_exclamation_mark: '灰色感叹号',
    grey_question: '灰色问号',
    white_question_mark: '灰色问号',
    warning: '警告',
    white_check_mark: '白色对勾',
    check_mark_button: '白色对勾',
    heavy_check_mark: '粗体对勾',
    check_mark: '粗体对勾',
    x: '叉号',
    cross_mark: '叉号',
    heavy_multiplication_x: '粗体叉号',
    bangbang: '双感叹号',
    interrobang: '问叹号',
    tada: '庆祝',
    party_popper: '庆祝',
    confetti_ball: '彩纸球',
    balloon: '气球',
    gift: '礼物',
    birthday: '生日',
    trophy: '奖杯',
    medal_sports: '奖牌',
    sports_medal: '奖牌',
    crown: '王冠',
    gem: '宝石',
    gem_stone: '宝石',
    rainbow: '彩虹',
    // Food, drink, and everyday objects
    apple: '苹果',
    green_apple: '青苹果',
    pear: '梨',
    tangerine: '橘子',
    orange: '橘子',
    lemon: '柠檬',
    banana: '香蕉',
    watermelon: '西瓜',
    grapes: '葡萄',
    strawberry: '草莓',
    peach: '桃子',
    cherries: '樱桃',
    pineapple: '菠萝',
    tomato: '番茄',
    corn: '玉米',
    ear_of_corn: '玉米',
    mushroom: '蘑菇',
    pizza: '披萨',
    hamburger: '汉堡',
    fries: '薯条',
    french_fries: '薯条',
    hotdog: '热狗',
    ramen: '拉面',
    steaming_bowl: '拉面',
    rice: '米饭',
    cooked_rice: '米饭',
    curry: '咖喱饭',
    curry_rice: '咖喱饭',
    sushi: '寿司',
    cake: '蛋糕',
    shortcake: '蛋糕',
    birthday_cake: '生日蛋糕',
    cookie: '饼干',
    chocolate_bar: '巧克力',
    candy: '糖果',
    lollipop: '棒棒糖',
    icecream: '冰淇淋',
    ice_cream: '冰淇淋',
    coffee: '咖啡',
    tea: '茶',
    teacup_without_handle: '茶',
    beer: '啤酒',
    beers: '碰杯',
    clinking_beer_mugs: '碰杯',
    cocktail: '鸡尾酒',
    tropical_drink: '鸡尾酒',
    wine_glass: '红酒',
    champagne: '香槟',
    bottle_with_popping_cork: '香槟',
    fork_and_knife: '刀叉',
    plate_with_cutlery: '餐盘',
    bulb: '灯泡',
    light_bulb: '灯泡',
    flashlight: '手电筒',
    book: '书',
    books: '书籍',
    memo: '备忘录',
    pencil2: '铅笔',
    pencil: '铅笔',
    pen: '钢笔',
    notebook: '笔记本',
    bookmark: '书签',
    pushpin: '图钉',
    paperclip: '回形针',
    scissors: '剪刀',
    lock: '锁',
    unlock: '开锁',
    key: '钥匙',
    hammer: '锤子',
    wrench: '扳手',
    gear: '齿轮',
    link: '链接',
    package: '包裹',
    moneybag: '钱袋',
    money_bag: '钱袋',
    dollar: '美元',
    dollar_banknote: '美元',
    yen: '日元',
    yen_banknote: '日元',
    euro: '欧元',
    euro_banknote: '欧元',
    pound: '英镑',
    pound_banknote: '英镑',
    chart_with_upwards_trend: '上涨趋势',
    chart_increasing: '上涨趋势',
    calendar: '日历',
    computer: '电脑',
    laptop: '电脑',
    keyboard: '键盘',
    printer: '打印机',
    iphone: '手机',
    mobile_phone: '手机',
    calling: '电话',
    telephone_receiver: '电话',
    // Animals and nature
    dog: '狗',
    dog_face: '狗',
    cat: '猫',
    cat_face: '猫',
    mouse: '老鼠',
    mouse_face: '老鼠',
    hamster: '仓鼠',
    rabbit: '兔子',
    rabbit_face: '兔子',
    fox_face: '狐狸',
    fox: '狐狸',
    bear: '熊',
    panda_face: '熊猫',
    panda: '熊猫',
    koala: '考拉',
    tiger: '老虎',
    tiger_face: '老虎',
    lion: '狮子',
    cow: '奶牛',
    cow_face: '奶牛',
    pig: '猪',
    pig_face: '猪',
    frog: '青蛙',
    monkey_face: '猴子',
    monkey: '猴子',
    see_no_evil: '捂眼猴',
    hear_no_evil: '捂耳猴',
    speak_no_evil: '捂嘴猴',
    chicken: '小鸡',
    penguin: '企鹅',
    bird: '鸟',
    baby_chick: '小鸡宝宝',
    unicorn: '独角兽',
    bee: '蜜蜂',
    honeybee: '蜜蜂',
    bug: '虫子',
    butterfly: '蝴蝶',
    snail: '蜗牛',
    turtle: '乌龟',
    octopus: '章鱼',
    fish: '鱼',
    whale: '鲸鱼',
    dolphin: '海豚',
    shark: '鲨鱼',
    sun_with_face: '太阳脸',
    sun: '太阳',
    crescent_moon: '弯月',
    full_moon: '满月',
    cloud: '云',
    umbrella: '雨伞',
    snowflake: '雪花',
    zap: '闪电',
    high_voltage: '闪电',
    // Places and transport
    rocket: '火箭',
    airplane: '飞机',
    car: '汽车',
    automobile: '汽车',
    taxi: '出租车',
    bus: '公交车',
    train: '火车',
    locomotive: '火车',
    bicycle: '自行车',
    ship: '轮船',
    anchor: '锚',
    house: '房子',
    office: '办公楼',
    office_building: '办公楼',
    hospital: '医院',
    school: '学校',
    tent: '帐篷',
    church: '教堂',
    fountain: '喷泉',
    map: '地图',
    world_map: '地图',
    globe_with_meridians: '地球',
    globe_showing_europe_africa: '地球',
    // Activities and clothing
    soccer: '足球',
    soccer_ball: '足球',
    basketball: '篮球',
    football: '橄榄球',
    american_football: '橄榄球',
    baseball: '棒球',
    tennis: '网球',
    medal_military: '军功章',
    military_medal: '军功章',
    performing_arts: '表演艺术',
    art: '艺术',
    artist_palette: '艺术',
    microphone: '麦克风',
    guitar: '吉他',
    headphones: '耳机',
    t_shirt: 'T恤',
    jeans: '牛仔裤',
    shoe: '鞋子',
    running_shoe: '鞋子',
    watch: '手表',
    eyeglasses: '眼镜',
    sunglasses: '墨镜',
    umbrella_on_ground: '收起的雨伞'
  });

  const POST_IMAGE_EXCLUDED_ANCESTORS = [
    '.avatar',
    '.avatar-flair',
    '.emoji',
    '.emoticon',
    '.user-badge',
    '.badge',
    '.badge-card',
    '.badge-icon',
    '.post-avatar',
    '.topic-avatar',
    '.user-card',
    '.post-controls',
    '.topic-map',
    '[data-emoji]',
    '[data-user-card]'
  ];

  const POST_IMAGE_EXCLUDED_CLASS_PATTERN = /(?:^|[\s_-])(avatar|emoji|emoticon|badge|icon|reaction|retort|flair)(?:$|[\s_-])/i;

  // These containers/classes are identity or control UI that may coexist in
  // .topic-meta-data. They must never be converted merely because a nested
  // image happens to carry an emoji-like attribute.
  const POST_META_EMOJI_EXCLUDED_ANCESTORS = [
    '.avatar',
    '.avatar-flair',
    '.user-badge',
    '.badge',
    '.badge-card',
    '.badge-icon',
    '.post-avatar',
    '.topic-avatar',
    '.user-card',
    '.post-controls',
    '.topic-map',
    '[data-user-card]'
  ];

  function isTopicDetailActive() {
    return Boolean(document.querySelector('.post-stream'));
  }

  function isPostImageExcluded(image) {
    if (!image || image.tagName !== 'IMG') return true;

    const cooked = image.closest('.cooked');
    if (!cooked || !cooked.closest('.post-stream')) return true;
    if (image.closest(POST_IMAGE_EXCLUDED_ANCESTORS.join(', '))) return true;

    const className = typeof image.className === 'string' ? image.className : '';
    if (POST_IMAGE_EXCLUDED_CLASS_PATTERN.test(className)) return true;

    const alt = normalizeStatText(image.getAttribute('alt')).toLowerCase();
    const title = normalizeStatText(image.getAttribute('title')).toLowerCase();
    if (/^:[\w+.-]+:$/.test(alt) || /emoji|emoticon|avatar|badge|icon|头像|表情|徽章|图标/.test(`${alt} ${title}`)) return true;

    const src = normalizeStatText(image.currentSrc || image.getAttribute('src') || image.getAttribute('data-src')).toLowerCase();

    // Tiny transparent pixels are tracking/layout helpers, not post content.
    const width = Number(image.getAttribute('width') || image.width || 0);
    const height = Number(image.getAttribute('height') || image.height || 0);
    if (width > 0 && height > 0 && width <= 16 && height <= 16 && /(?:pixel|spacer|blank|transparent|tracking)/.test(`${src} ${alt} ${title}`)) {
      return true;
    }

    return false;
  }

  function getPostImageFromToggle(toggle) {
    if (!toggle) return null;
    const media = Array.from(toggle.children).find((child) => child.tagName === 'IMG' || child.tagName === 'PICTURE');
    return media?.tagName === 'IMG' ? media : media?.querySelector('img');
  }

  function setPostImageToggleState(toggle, isVisible) {
    if (!toggle) return;
    const overlay = toggle.querySelector(`.${POST_IMAGE_TOGGLE_OVERLAY}`);
    const image = getPostImageFromToggle(toggle);
    const alt = normalizeStatText(image?.getAttribute('alt'));
    const imageDescription = alt ? `图片：${alt}，` : '图片，';
    const label = `${imageDescription}${isVisible ? '双击隐藏图片' : '双击显示图片'}`;

    toggle.classList.toggle(POST_IMAGE_TOGGLE_HIDDEN, !isVisible);
    toggle.classList.toggle(POST_IMAGE_TOGGLE_SHOWN, isVisible);
    toggle.dataset.qqdocsImageVisible = String(isVisible);

    if (overlay) {
      overlay.hidden = isVisible;
      overlay.textContent = isVisible ? '双击隐藏图片' : '双击显示图片';
      overlay.setAttribute('aria-label', label);
      overlay.setAttribute('title', label);
    }
  }

  function findPostImageToggle(eventTarget) {
    if (!(eventTarget instanceof Element)) return null;
    const toggle = eventTarget.closest(`.${POST_IMAGE_TOGGLE_WRAPPER}`);
    if (!toggle || !toggle.closest('.cooked') || !toggle.closest('.post-stream')) return null;
    return toggle;
  }

  function handlePostImageClick(event) {
    if (!isTopicDetailActive()) return;
    const toggle = findPostImageToggle(event.target);
    if (!toggle) return;

    // A lightbox is normally opened from a delegated click handler. Suppress
    // both clicks that precede dblclick so a deliberate double-click never
    // navigates away or opens the native lightbox first.
    event.preventDefault();
    event.stopPropagation();
  }

  function handlePostImageDoubleClick(event) {
    if (!isTopicDetailActive()) return;
    const toggle = findPostImageToggle(event.target);
    if (!toggle) return;

    event.preventDefault();
    event.stopPropagation();
    setPostImageToggleState(toggle, !toggle.classList.contains(POST_IMAGE_TOGGLE_SHOWN));
  }

  function handlePostImageKeydown(event) {
    if (!isTopicDetailActive()) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    // The surrounding lightbox anchor can remain in the tab order. Treat a
    // keyboard activation anywhere on the target as the same toggle action so
    // Enter/Space cannot accidentally navigate while the image is concealed.
    const toggle = event.target instanceof Element ? findPostImageToggle(event.target) : null;
    if (!toggle) return;

    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) setPostImageToggleState(toggle, !toggle.classList.contains(POST_IMAGE_TOGGLE_SHOWN));
  }

  function attachPostImageInteractions() {
    if (postImageInteractionsAttached) return;
    postImageInteractionsAttached = true;
    document.addEventListener('click', handlePostImageClick, true);
    document.addEventListener('dblclick', handlePostImageDoubleClick, true);
    document.addEventListener('keydown', handlePostImageKeydown, true);
  }

  function createPostImageToggle(image) {
    if (isPostImageExcluded(image) || image.hasAttribute(POST_IMAGE_BOUND_ATTRIBUTE)) return;

    // Keep <picture>'s source/img relationship valid by wrapping the whole
    // picture element. For ordinary images only the image node is wrapped.
    const media = image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;
    const parent = media.parentNode;
    if (!parent || parent.closest(`.${POST_IMAGE_TOGGLE_WRAPPER}`)) return;

    const toggle = document.createElement('span');
    toggle.className = `${POST_IMAGE_TOGGLE_WRAPPER} ${POST_IMAGE_TOGGLE_HIDDEN}`;
    toggle.setAttribute(POST_IMAGE_WRAPPER_ATTRIBUTE, 'true');
    toggle.setAttribute('role', 'group');

    const overlay = document.createElement('span');
    overlay.className = POST_IMAGE_TOGGLE_OVERLAY;
    overlay.setAttribute('role', 'button');
    overlay.tabIndex = 0;
    overlay.setAttribute('aria-label', '双击显示图片');
    overlay.setAttribute('title', '双击显示图片');

    parent.insertBefore(toggle, media);
    toggle.append(media, overlay);
    image.setAttribute(POST_IMAGE_BOUND_ATTRIBUTE, 'true');
    setPostImageToggleState(toggle, false);
  }

  function unwrapPostImageToggle(toggle) {
    if (!toggle || !toggle.hasAttribute(POST_IMAGE_WRAPPER_ATTRIBUTE)) return;
    const media = Array.from(toggle.children).find((child) => child.tagName === 'IMG' || child.tagName === 'PICTURE');
    const image = media?.tagName === 'IMG' ? media : media?.querySelector('img');

    if (media && toggle.parentNode) toggle.parentNode.insertBefore(media, toggle);
    if (image) image.removeAttribute(POST_IMAGE_BOUND_ATTRIBUTE);
    toggle.remove();
  }

  function cleanupPostImageToggles() {
    document.querySelectorAll(`.${POST_IMAGE_TOGGLE_WRAPPER}[${POST_IMAGE_WRAPPER_ATTRIBUTE}]`).forEach(unwrapPostImageToggle);
    document.body?.classList.remove('qqdocs-image-toggle-enabled');
  }

  function syncPostImageToggles() {
    const active = isTopicDetailActive();
    if (!active) {
      cleanupPostImageToggles();
      return;
    }

    attachPostImageInteractions();
    document.body?.classList.add('qqdocs-image-toggle-enabled');

    document.querySelectorAll('.post-stream .cooked img').forEach((image) => {
      if (image.hasAttribute(POST_IMAGE_BOUND_ATTRIBUTE) && !image.closest(`.${POST_IMAGE_TOGGLE_WRAPPER}`)) {
        image.removeAttribute(POST_IMAGE_BOUND_ATTRIBUTE);
      }
      createPostImageToggle(image);
    });

    document.querySelectorAll(`.${POST_IMAGE_TOGGLE_WRAPPER}[${POST_IMAGE_WRAPPER_ATTRIBUTE}]`).forEach((toggle) => {
      const image = getPostImageFromToggle(toggle);
      if (!image || isPostImageExcluded(image)) {
        unwrapPostImageToggle(toggle);
        return;
      }
      if (!toggle.classList.contains(POST_IMAGE_TOGGLE_HIDDEN) && !toggle.classList.contains(POST_IMAGE_TOGGLE_SHOWN)) {
        setPostImageToggleState(toggle, false);
      }
    });
  }

  function isPostEmoji(image) {
    if (!image || image.tagName !== 'IMG') return false;

    const cooked = image.closest('.cooked');
    if (!cooked || !cooked.closest('.post-stream')) return false;
    // Metadata has its own selector and validator below. Keeping it out of
    // this body-only predicate makes the .topic-meta-data boundary explicit.
    if (image.closest('.topic-meta-data')) return false;

    // Discourse currently uses img.emoji; the data-* variants cover older
    // renderers and custom emoji markup without broadening this to ordinary
    // content images.
    if (image.matches('img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]')) {
      return true;
    }

    return Boolean(image.closest('[data-emoji], [data-emoticon], [data-emoji-image]'));
  }

  function isPostMetaEmoji(image) {
    if (!image || image.tagName !== 'IMG') return false;

    const metadata = image.closest('.post-stream .topic-meta-data');
    if (!metadata) return false;

    // Keep avatar, badge, user-card, and control images out even if a site
    // decorates them with a generic emoji/data-* class or attribute.
    if (image.closest(POST_META_EMOJI_EXCLUDED_ANCESTORS.join(', '))) return false;

    const className = typeof image.className === 'string' ? image.className : '';
    if (/(?:^|[\s_-])(avatar|badge|icon|reaction|retort|flair)(?:$|[\s_-])/i.test(className)) {
      return false;
    }

    return image.matches(
      'img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]'
    ) || Boolean(image.closest('[data-emoji], [data-emoticon], [data-emoji-image]'));
  }

  function isPostReactionEmoji(image) {
    if (!image || image.tagName !== 'IMG') return false;

    const reactionList = image.closest(
      '.post-stream nav.post-controls .discourse-reactions-list-emoji'
    );
    if (!reactionList) return false;

    // Keep the operation-bar scope just as narrow as the query selector:
    // ordinary images or SVG-backed action controls must not be wrapped.
    return image.matches(
      'img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]'
    ) || Boolean(image.closest('[data-emoji], [data-emoticon], [data-emoji-image]'));
  }

  function isPostBoostEmoji(image) {
    if (!image || image.tagName !== 'IMG') return false;
    if (!image.closest('.post-stream button.discourse-boosts__cooked')) return false;

    return image.matches(
      'img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]'
    ) || Boolean(image.closest('[data-emoji], [data-emoticon], [data-emoji-image]'));
  }

  function isTopicEmoji(image) {
    return isPostEmoji(image) || isPostMetaEmoji(image) || isPostReactionEmoji(image) || isPostBoostEmoji(image);
  }

  function normalizeEmojiAttribute(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function extractEmojiShortcode(value) {
    const normalized = normalizeEmojiAttribute(value);
    if (!normalized || /^(?:emoji|emoticon|表情|表情包)$/i.test(normalized)) return '';

    const colonMatch = normalized.match(/:([A-Za-z0-9][A-Za-z0-9_+.-]*):/);
    if (colonMatch) return colonMatch[1];

    // Some older Discourse renderers put the shortcode in title/data-name
    // without colons. Keep this deliberately narrow to avoid using alt text
    // such as a sentence as a shortcode.
    const bareMatch = normalized.match(/^([A-Za-z0-9][A-Za-z0-9_+.-]*)$/);
    return bareMatch ? bareMatch[1] : '';
  }

  function extractReasonableEmojiName(value) {
    const normalized = normalizeEmojiAttribute(value);
    if (!normalized || /^(?:emoji|emoticon|表情|表情包)$/i.test(normalized)) return '';
    if (/^:[^:\s]+:$/.test(normalized)) return '';

    // A few renderers expose a localized accessible name instead of a
    // shortcode. Accept short human-readable names, but never use a raw
    // Unicode glyph or a long sentence as the label.
    if (/^[\u3400-\u9fff\u3040-\u30ffA-Za-z0-9][\u3400-\u9fff\u3040-\u30ffA-Za-z0-9 _+.-]{0,39}$/.test(normalized)) {
      return normalized;
    }
    return '';
  }

  function getEmojiDescription(image) {
    const metadataValues = [
      image?.getAttribute('alt'),
      image?.getAttribute('title'),
      image?.getAttribute('data-emoji'),
      image?.getAttribute('data-emoji-name'),
      image?.getAttribute('data-emoji-shortcode'),
      image?.getAttribute('data-name'),
      image?.getAttribute('aria-label')
    ];

    // alt is the canonical Discourse source; title and data-* values are
    // fallbacks for custom/older emoji renderers.
    for (const value of metadataValues) {
      const shortcode = extractEmojiShortcode(value);
      if (shortcode) return COMMON_EMOJI_DESCRIPTIONS[shortcode.toLowerCase()] || shortcode;
    }

    for (const value of metadataValues) {
      const localizedName = extractReasonableEmojiName(value);
      if (localizedName) return localizedName;
    }

    // If attributes are missing, the emoji asset filename is normally its
    // shortcode (e.g. /emoji/twitter/rofl.png). This is still scoped to an
    // already identified emoji image, so ordinary content assets are ignored.
    const source = normalizeEmojiAttribute(
      image?.getAttribute('data-src') || image?.getAttribute('src') || image?.currentSrc
    );
    const filenameMatch = source.match(/\/([^/?#]+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i);
    const filename = filenameMatch ? filenameMatch[1] : '';
    const shortcode = extractEmojiShortcode(filename);
    if (shortcode) return COMMON_EMOJI_DESCRIPTIONS[shortcode.toLowerCase()] || shortcode;

    return '表情';
  }

  function getPostEmojiMedia(wrapper) {
    if (!wrapper) return null;
    return Array.from(wrapper.children).find((child) => child.tagName === 'IMG' || child.tagName === 'PICTURE') || null;
  }

  function getPostEmojiImage(wrapper) {
    const media = getPostEmojiMedia(wrapper);
    if (!media) return null;
    return media.tagName === 'IMG' ? media : media.querySelector('img');
  }

  function updatePostEmojiLabel(wrapper, image) {
    if (!wrapper || !image) return;
    const description = getEmojiDescription(image);
    const labelText = `[emoji:${description}]`;
    const label = wrapper.querySelector(`.${POST_EMOJI_LABEL}`);
    const isReactionWrapper = wrapper.classList.contains(POST_REACTION_EMOJI_WRAPPER);

    if (isReactionWrapper) {
      // The wrapper is purely visual inside an existing reaction button. It
      // must not create a nested accessible name/focus target; the button's
      // original aria-label remains the sole accessible name and action.
      if (wrapper.getAttribute('aria-hidden') !== 'true') wrapper.setAttribute('aria-hidden', 'true');
      wrapper.removeAttribute('aria-label');
      wrapper.removeAttribute('role');
      wrapper.removeAttribute('tabindex');
      wrapper.removeAttribute('title');
    } else {
      if (wrapper.getAttribute('aria-label') !== labelText) wrapper.setAttribute('aria-label', labelText);
      if (wrapper.getAttribute('title') !== labelText) wrapper.setAttribute('title', labelText);
    }
    if (wrapper.dataset.qqdocsEmojiDescription !== description) {
      wrapper.dataset.qqdocsEmojiDescription = description;
    }
    if (label) {
      if (label.textContent !== labelText) label.textContent = labelText;
      if (label.getAttribute('aria-label') !== labelText) label.setAttribute('aria-label', labelText);
    }
  }

  function createPostEmojiLabel(image) {
    const isReactionEmoji = isPostReactionEmoji(image);
    const isBoostEmoji = isPostBoostEmoji(image);
    const isButtonEmoji = isReactionEmoji || isBoostEmoji;
    const isMetaEmoji = isPostMetaEmoji(image);
    if ((!isPostEmoji(image) && !isMetaEmoji && !isButtonEmoji) || image.hasAttribute(POST_EMOJI_BOUND_ATTRIBUTE)) return;

    const media = image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;
    const parent = media.parentNode;
    if (!parent || parent.closest(`.${POST_EMOJI_WRAPPER}`)) return;

    const wrapper = document.createElement('span');
    wrapper.className = POST_EMOJI_WRAPPER;
    wrapper.setAttribute(POST_EMOJI_WRAPPER_ATTRIBUTE, 'true');
    if (isButtonEmoji) {
      wrapper.classList.add(POST_REACTION_EMOJI_WRAPPER);
      wrapper.setAttribute('aria-hidden', 'true');
      // Do not set role or tabindex here. This span sits inside a native
      // reaction/boost button and must never become a nested focusable control.
    } else {
      wrapper.setAttribute('role', 'img');
      wrapper.tabIndex = 0;
    }

    const label = document.createElement('span');
    label.className = POST_EMOJI_LABEL;
    label.setAttribute('aria-hidden', 'true');

    parent.insertBefore(wrapper, media);
    wrapper.append(media, label);

    // Keep the original alt/title untouched. The body wrapper provides one
    // stable accessible name while the child image remains the original DOM
    // node. Reaction wrappers are already aria-hidden as a whole, so do not
    // alter the image's own accessibility attributes inside a button.
    if (!isButtonEmoji && !image.hasAttribute('aria-hidden')) {
      image.setAttribute('aria-hidden', 'true');
      image.setAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE, 'true');
    }
    image.setAttribute(POST_EMOJI_BOUND_ATTRIBUTE, 'true');
    updatePostEmojiLabel(wrapper, image);
  }

  function unwrapPostEmojiLabel(wrapper) {
    if (!wrapper || !wrapper.hasAttribute(POST_EMOJI_WRAPPER_ATTRIBUTE)) return;
    const media = getPostEmojiMedia(wrapper);
    const image = getPostEmojiImage(wrapper);

    if (media && wrapper.parentNode) wrapper.parentNode.insertBefore(media, wrapper);
    if (image) {
      image.removeAttribute(POST_EMOJI_BOUND_ATTRIBUTE);
      if (image.getAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE) === 'true') {
        image.removeAttribute('aria-hidden');
        image.removeAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE);
      }
    }
    wrapper.remove();
  }

  function cleanupPostEmojiLabels() {
    document.querySelectorAll(`.${POST_EMOJI_WRAPPER}[${POST_EMOJI_WRAPPER_ATTRIBUTE}]`).forEach(unwrapPostEmojiLabel);
    document.body?.classList.remove('qqdocs-emoji-label-enabled');
  }

  function syncPostEmojiLabels() {
    const active = isTopicDetailActive();
    if (!active) {
      cleanupPostEmojiLabels();
      return;
    }

    document.body?.classList.add('qqdocs-emoji-label-enabled');

    document.querySelectorAll(POST_EMOJI_SELECTOR).forEach((image) => {
      if (image.hasAttribute(POST_EMOJI_BOUND_ATTRIBUTE) && !image.closest(`.${POST_EMOJI_WRAPPER}`)) {
        image.removeAttribute(POST_EMOJI_BOUND_ATTRIBUTE);
        if (image.getAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE) === 'true') {
          image.removeAttribute('aria-hidden');
          image.removeAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE);
        }
      }
      createPostEmojiLabel(image);
    });

    document.querySelectorAll(`.${POST_EMOJI_WRAPPER}[${POST_EMOJI_WRAPPER_ATTRIBUTE}]`).forEach((wrapper) => {
      const image = getPostEmojiImage(wrapper);
      if (!image || !isTopicEmoji(image)) {
        unwrapPostEmojiLabel(wrapper);
        return;
      }

      const shouldBeReactionWrapper = isPostReactionEmoji(image) || isPostBoostEmoji(image);
      const isReactionWrapper = wrapper.classList.contains(POST_REACTION_EMOJI_WRAPPER);
      if (shouldBeReactionWrapper !== isReactionWrapper) {
        unwrapPostEmojiLabel(wrapper);
        createPostEmojiLabel(image);
        return;
      }

      updatePostEmojiLabel(wrapper, image);
    });
  }

  // 1. Favicon 伪装
  function applyFavicon() {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    let links = Array.from(head.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']"));
    if (!links.length) {
      const link = document.createElement('link');
      link.rel = 'icon';
      head.appendChild(link);
      links = [link];
    }

    links.forEach((link) => {
      link.type = 'image/x-icon';
      link.href = ICONS.favicon;
    });
  }

  // 2. Title 动态劫持
  function hijackTitle() {
    const originalTitleDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'title') ||
      Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'title');

    function getFormattedTitle(rawTitle) {
      if (!rawTitle) return '腾讯文档';

      let clean = rawTitle.replace(/\s*-\s*LINUX DO.*$/i, '').trim();
      clean = clean.replace(/(?:\s*-\s*腾讯文档)+\s*$/g, '').trim();
      clean = clean.replace(/^\(\d+\)\s*/, '');

      if (!clean || clean === '腾讯文档' || clean === 'LINUX DO' || clean.includes('新的理想型社区')) {
        return '腾讯文档';
      }
      return `${clean} - 腾讯文档`;
    }

    try {
      Object.defineProperty(document, 'title', {
        get: function () {
          return originalTitleDesc ? originalTitleDesc.get.call(this) : '腾讯文档';
        },
        set: function (newTitle) {
          const transformed = getFormattedTitle(newTitle);
          if (originalTitleDesc) {
            originalTitleDesc.set.call(this, transformed);
          } else {
            document.getElementsByTagName('title')[0].textContent = transformed;
          }
        },
        configurable: true
      });
    } catch (e) {
      console.warn('[Docs QQ] Title hijack failed:', e);
    }

    document.title = document.title;
  }

  // 3. 顶部 Header (100% 官方 DOM 结构还原)
  function renderHeader() {
    const headerTitle = document.querySelector('.d-header .title');
    if (headerTitle && !headerTitle.querySelector('.desktop-top-bar-left')) {
      const brand = document.createElement('div');
      brand.className = 'desktop-top-bar-left';
      brand.innerHTML = `
        <a title="腾讯文档" href="/" class="desktop-logo-pc">
          ${ICONS.officialLogoSvg}
        </a>
      `;
      headerTitle.innerHTML = '';
      headerTitle.appendChild(brand);

    }

    /*
     * Discourse 新版会用 .home-logo-wrapper-outlet 单独包住 .title。
     * 搜索框若跟着插入这个 244px 的插槽，就会落到 Logo 下方并产生重叠。
     * 无论是首次创建还是站点热更新后，都把它校正为 .contents 的直接子节点。
     */
    const headerContents = headerTitle && headerTitle.closest('.d-header .contents');
    const logoSlot = headerTitle && (headerTitle.closest('.home-logo-wrapper-outlet') || headerTitle);
    let searchInput = document.querySelector('.desktop-search-input-pc');

    if (!searchInput && headerContents) {
      searchInput = document.createElement('div');
      searchInput.className = 'dui-input desktop-search-input desktop-search-input-pc';
      searchInput.innerHTML = `
        ${renderOfficialIcon('search', 14)}
        <input class="dui-input-input" type="search" placeholder="搜索文档、模板、文库、工具 (Ctrl+F)">
      `;
      searchInput.querySelector('input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
        }
      });
    }

    if (searchInput && headerContents && logoSlot && logoSlot.parentNode === headerContents) {
      if (searchInput.parentNode !== headerContents || searchInput.previousElementSibling !== logoSlot) {
        headerContents.insertBefore(searchInput, logoSlot.nextSibling);
      }
    }

    const headerIcons = document.querySelector('.d-header-icons');
    if (headerIcons && !document.querySelector('.desktop-top-bar-right')) {
      const rightWrap = document.createElement('li');
      rightWrap.className = 'desktop-top-bar-right';
      rightWrap.innerHTML = `
        <div class="desktop-vip-center">
          <button class="desktop-top-bar-button desktop-vip-center-button" type="button">
            ${renderOfficialIcon('vip', 16)}
            <span>会员中心</span>
          </button>
        </div>
        <button class="desktop-top-bar-button" type="button">
          ${renderOfficialIcon('manageDevice', 16)}
          <span>· 2</span>
        </button>
        <button class="desktop-top-bar-button" type="button">
          ${renderOfficialIcon('template', 16)}
          <span>模板</span>
        </button>
        <button class="desktop-top-bar-button" type="button">
          ${renderOfficialIcon('toolkit', 16)}
        </button>
        <button class="desktop-top-bar-button" type="button">
          ${renderOfficialIcon('aiTop', 16)}
        </button>
        <button class="desktop-top-bar-button desktop-notification-panel-button" type="button">
          ${renderOfficialIcon('notification', 16)}
          <span class="desktop-notification-badge">18</span>
        </button>
      `;
      headerIcons.insertBefore(rightWrap, headerIcons.firstChild);
    }
  }

  // 4. 左侧 Sidebar (Fixed 定位挂载至 body)
  function renderSidebar() {
    if (!document.querySelector('.desktop-layout-sidebar-pc')) {
      const sidebar = document.createElement('aside');
      sidebar.className = 'desktop-layout-sidebar-pc';
      sidebar.innerHTML = `
        <button class="dui-button desktop-create-button-pc" onclick="location.href='/new-topic'">
          ${renderOfficialIcon('create', 16)}
          <span>新建</span>
        </button>
        <button class="desktop-upload-button-pc">
          ${renderOfficialIcon('upload', 16)}
          <span>上传</span>
        </button>

        <nav class="desktop-sidebar-nav-list">
          <a class="desktop-node-link-router desktop-link-active" href="/">
            ${renderOfficialIcon('home', 20)}
            <span>首页</span>
          </a>
          <a class="desktop-node-link-router" href="/latest">
            ${renderOfficialIcon('cloud', 20)}
            <span>云盘</span>
          </a>
          <a class="desktop-node-link-router" href="/top">
            ${renderOfficialIcon('aiSidebar', 20)}
            <span>AI 助手</span>
          </a>
          <a class="desktop-node-link-router" href="/categories">
            ${renderOfficialIcon('space', 20)}
            <span>空间</span>
          </a>
          <a class="desktop-node-link-router" href="/my/activity">
            ${renderOfficialIcon('trash', 20)}
            <span>回收站</span>
          </a>
        </nav>

        <div class="desktop-enterprise-edition-entry">
          <div class="desktop-promo-card">
            <div class="desktop-promo-header">
              ${renderOfficialIcon('enterprise', 18)}
              <div class="desktop-promo-title">企业版 · 团队协作更高效</div>
            </div>
            <div class="desktop-promo-subtitle">权限管控 · 离职归还 · 操作审计</div>
            <div class="desktop-promo-button">免费体验</div>
          </div>
        </div>

        <div class="desktop-storage-panel">
          <span>已使用 4.99 MB / 1.0 GB</span>
          <a href="javascript:void(0);">查看 &gt;</a>
        </div>
      `;
      document.body.appendChild(sidebar);
    }
  }

  // 5. 列表页表头与数据行 (内联矢量 SVG 图标)
  function renderTopicList() {
    // 清理残余可能干扰布局的节点
    document.querySelectorAll('.welcome-banner, .global-notice, .list-controls, .top-notices, .alert, .community-rule, #site-text-logo').forEach(el => el.style.display = 'none');

    const isTopicDetailPage = document.querySelector('.post-stream, #topic-title');
    const tabsHeader = document.querySelector('.desktop-home-page-tab-header-pc');

    // 如果在详情页，隐藏列表页 Tab
    if (isTopicDetailPage) {
      if (tabsHeader) tabsHeader.style.display = 'none';
      return;
    } else {
      if (tabsHeader) tabsHeader.style.display = 'flex';
    }

    const container = document.querySelector('.list-container, .topic-list-container, #main-container');
    const topicList = document.querySelector('.topic-list');
    if (container && !document.querySelector('.desktop-home-page-tab-header-pc')) {
      const tabs = document.createElement('header');
      tabs.className = 'desktop-home-page-tab-header-pc';
      tabs.innerHTML = `
        <div class="desktop-tab-group">
          <a class="desktop-tab-link desktop-link-active" href="/">最近</a>
          <a class="desktop-tab-link" href="/categories">空间</a>
          <a class="desktop-tab-link" href="/my/activity">收藏</a>
        </div>
        <aside class="desktop-page-header-extra-pc">
          <button type="button" class="desktop-header-action-btn">
            ${renderOfficialIcon('showRecent', 16)}
            <span>显示</span>
          </button>
          <button type="button" class="desktop-header-action-btn">
            ${renderOfficialIcon('filter', 16)}
            <span>筛选</span>
            ${renderOfficialIcon('arrowDown', 12)}
          </button>
        </aside>
      `;
      if (topicList) {
        topicList.parentNode.insertBefore(tabs, topicList);
      } else {
        container.insertBefore(tabs, container.firstChild);
      }
    }

    // 重构 Discourse 原生 5 列表头
    const thead = document.querySelector('.topic-list thead');
    if (thead && !thead.hasAttribute('data-qqdocs-styled')) {
      thead.setAttribute('data-qqdocs-styled', 'true');
      thead.innerHTML = `
        <tr>
          <th class="default" style="width: 50%;">名称</th>
          <th class="posters" style="width: 13%;">所有者</th>
          <th class="posts" style="width: 12%;">位置</th>
          <th class="views" style="width: 13%;">最近查看 ▾</th>
          <th class="activity" style="width: 12%; text-align: right;">文档大小</th>
        </tr>
      `;
    }

    const topicRows = document.querySelectorAll('.topic-list-item:not([data-qqdocs-styled="true"])');
    topicRows.forEach((row, idx) => {
      row.setAttribute('data-qqdocs-styled', 'true');

      // 提取分类名
      const catBadge = row.querySelector('.badge-category__name');
      const catName = catBadge ? catBadge.textContent.trim() : (idx % 2 === 0 ? '-' : 'AI文档助手');

      // 清理旧的图标节点
      const oldIcons = row.querySelectorAll('.sc-file-icon-container, .qqdocs-row-icon-wrap');
      oldIcons.forEach(el => el.remove());

      // 1. 标题列 (注入单选圆圈与高清内联 SVG 图标)
      const titleLink = row.querySelector('.main-link .title, .main-link .raw-link');
      if (titleLink) {
        let iconType = 'sheet';
        if (idx % 4 === 1) iconType = 'doc';
        else if (idx % 4 === 2) iconType = 'slide';

        const iconContainer = document.createElement('span');
        iconContainer.className = 'qqdocs-row-icon-wrap';
        iconContainer.innerHTML = `
          ${renderOfficialFileIcon(iconType, 24)}
        `;

        titleLink.parentNode.insertBefore(iconContainer, titleLink);

        if (!titleLink.querySelector('svg') && (row.classList.contains('visited') || idx % 4 === 0)) {
          const star = document.createElement('span');
          star.style.marginLeft = '6px';
          star.innerHTML = renderOfficialIcon('star', 16);
          titleLink.appendChild(star);
        }
      }

      // 2. 所有者列 (提取作者用户名)
      const posterCol = row.querySelector('.posters');
      if (posterCol) {
        const firstUser = posterCol.querySelector('a');
        const username = firstUser ? (firstUser.getAttribute('data-user-card') || firstUser.title || '李媛婷') : '李媛婷';
        posterCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px; font-weight: 400; line-height: 16px;">${username}</span>`;
      }

      // 3. 位置列 (原 posts 列重塑为位置)
      const postsCol = row.querySelector('.posts');
      if (postsCol) {
        postsCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px; font-weight: 400; line-height: 16px;">${catName}</span>`;
      }

      // 4. 最近查看列 (原 views 列重塑为时间)
      const viewsCol = row.querySelector('.views');
      if (viewsCol) {
        const times = ['16:11', '15:55', '昨天 16:45', '08-21 12:05', '08-19 16:12', '08-17 09:12', '08-10 09:39', '08-06 14:09'];
        viewsCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px; font-weight: 400; line-height: 16px;">${times[idx % times.length]}</span>`;
      }

      // 5. 文档大小列 (原 activity 列重塑为仿真大小)
      const actCol = row.querySelector('.activity');
      if (actCol) {
        const sizes = ['928.59 KB', '117.26 KB', '343.27 KB', '621.74 KB', '495.62 KB', '551.69 KB', '95.69 MB', '3.91 MB'];
        actCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px; font-weight: 400; line-height: 16px;">${sizes[idx % sizes.length]}</span>`;
      }
    });
  }

  function renderSearchResults() {
    const searchContainer = document.querySelector('.search-container');
    document.body?.classList.toggle('qqdocs-search-page', Boolean(searchContainer));
    if (!searchContainer) return;

    const entries = searchContainer.querySelector('.search-results .fps-result-entries');
    if (!entries) return;

    let header = searchContainer.querySelector('.qqdocs-search-list-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'qqdocs-search-list-header';
      header.setAttribute('aria-hidden', 'true');
      header.innerHTML = '<span>名称</span><span>所有者</span><span>位置</span><span>最近查看 ▾</span><span>匹配内容</span>';
    }
    if (header.nextElementSibling !== entries) entries.parentNode.insertBefore(header, entries);

    entries.querySelectorAll('.fps-result:not([data-qqdocs-search-styled="true"])').forEach((result) => {
      result.setAttribute('data-qqdocs-search-styled', 'true');

      const topic = result.querySelector('.fps-topic');
      const topicId = Number(topic?.getAttribute('data-topic-id')) || 0;
      const iconTypes = ['sheet', 'doc', 'slide'];
      const iconType = iconTypes[Math.abs(topicId) % iconTypes.length];

      if (!result.querySelector('.qqdocs-search-row-icon')) {
        const icon = document.createElement('span');
        icon.className = 'qqdocs-search-row-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = renderOfficialFileIcon(iconType, 24);
        result.insertBefore(icon, result.firstChild);
      }

      const authorLink = result.querySelector('.author a[data-user-card], .author a');
      if (authorLink && !authorLink.querySelector('.qqdocs-search-owner')) {
        const username = authorLink.getAttribute('data-user-card') ||
          authorLink.querySelector('img.avatar')?.getAttribute('title') ||
          '—';
        const owner = document.createElement('span');
        owner.className = 'qqdocs-search-owner';
        owner.textContent = username;
        authorLink.appendChild(owner);
      }
    });
  }

  const TOPIC_STAT_DEFINITIONS = {
    views: {
      label: '浏览量',
      markers: ['view', 'views', 'visit', 'visits', '浏览', '访问']
    },
    likes: {
      label: '赞',
      markers: ['like', 'likes', 'liked', 'heart', '赞']
    },
    users: {
      label: '用户',
      markers: ['user', 'users', 'participant', 'participants', 'poster', 'member', '用户', '参与者', '成员']
    }
  };

  function normalizeStatText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function getNodeMetadata(node) {
    if (!node) return '';
    const className = typeof node.className === 'string' ? node.className : '';
    return normalizeStatText([
      className,
      node.getAttribute?.('data-stat'),
      node.getAttribute?.('data-type'),
      node.getAttribute?.('data-topic-stat'),
      node.getAttribute?.('aria-label'),
      node.getAttribute?.('title')
    ].filter(Boolean).join(' ')).toLowerCase();
  }

  function getTopicStatKey(node) {
    const metadata = getNodeMetadata(node);
    const text = normalizeStatText(node?.textContent).toLowerCase();
    const source = `${metadata} ${text}`;
    const keys = Object.keys(TOPIC_STAT_DEFINITIONS);
    let bestKey = null;
    let bestScore = 0;

    keys.forEach((key) => {
      const definition = TOPIC_STAT_DEFINITIONS[key];
      let score = 0;
      definition.markers.forEach((marker) => {
        if (metadata.includes(marker)) score += marker.length > 2 ? 8 : 6;
        else if (text.includes(marker)) score += marker.length > 2 ? 3 : 2;
      });
      if (score > bestScore) {
        bestKey = key;
        bestScore = score;
      }
    });

    // Avoid treating generic words in an unrelated node as a statistic.
    return bestScore > 0 && source ? bestKey : null;
  }

  function firstTopicStatText(node, selectors) {
    for (const selector of selectors) {
      const child = node?.querySelector(selector);
      const text = normalizeStatText(child?.textContent || child?.getAttribute?.('data-value'));
      if (text) return text;
    }
    return '';
  }

  function extractNumericText(text) {
    const normalized = normalizeStatText(text);
    const match = normalized.match(/[+-]?(?:\d[\d,.]*)(?:\s*[万亿kKmMbB])?/);
    return match ? normalizeStatText(match[0]) : '';
  }

  function removeStatValueFromLabel(label, value) {
    const normalizedLabel = normalizeStatText(label);
    const normalizedValue = normalizeStatText(value);
    if (!normalizedLabel || !normalizedValue) return normalizedLabel;
    const escapedValue = normalizedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return normalizeStatText(normalizedLabel
      .replace(new RegExp(escapedValue, 'g'), '')
      .replace(/^[\s:：|·-]+|[\s:：|·-]+$/g, ''));
  }

  function getTopicStatCandidates(topicMap) {
    const selectors = [
      '.topic-map__stats-item',
      '[class*="topic-map__stats-item"]',
      '.topic-map__stat',
      '[class*="topic-map__stat-"]',
      '[data-topic-stat]',
      '[data-stat]',
      '.topic-map__stats > *'
    ];
    const seen = new Set();
    const candidates = [];

    selectors.forEach((selector) => {
      topicMap.querySelectorAll(selector).forEach((node) => {
        if (!seen.has(node)) {
          seen.add(node);
          candidates.push(node);
        }
      });
    });

    return candidates;
  }

  function extractUserCount(topicMap) {
    const countSelectors = [
      '[data-users-count]',
      '[data-user-count]',
      '[data-count]',
      '.topic-map__users-count',
      '.topic-map__user-count',
      '[class*="users-count"]',
      '[class*="user-count"]'
    ];
    for (const selector of countSelectors) {
      const countNode = topicMap.querySelector(selector);
      if (!countNode) continue;
      const attributeCount = countNode.getAttribute?.('data-users-count') ||
        countNode.getAttribute?.('data-user-count') || countNode.getAttribute?.('data-count');
      const countText = normalizeStatText(attributeCount || countNode.textContent);
      if (countText) return extractNumericText(countText) || countText;
    }

    const userSelectors = [
      '.topic-map__user',
      '.topic-map__user-link',
      '.topic-map__users-list [data-user-card]',
      '.topic-map__users-list .poster',
      '.topic-map__users [data-user-card]',
      '.topic-map__users .poster'
    ];
    const users = new Set();
    userSelectors.forEach((selector) => {
      topicMap.querySelectorAll(selector).forEach((node) => {
        const identity = node.getAttribute?.('data-user-card') || node.getAttribute?.('href') || node.textContent;
        if (normalizeStatText(identity)) users.add(normalizeStatText(identity));
      });
    });
    return users.size ? String(users.size) : '';
  }

  function extractTopicStat(node, key) {
    const definition = TOPIC_STAT_DEFINITIONS[key];
    const value = firstTopicStatText(node, [
      '.topic-map__value',
      '.number',
      '.value',
      '[class*="__value"]',
      '[class*="-value"]',
      '[class*="number"]',
      '[data-value]',
      '[data-stat-value]',
      '[data-count]'
    ]) || extractNumericText(node.textContent);
    const nestedLabel = firstTopicStatText(node, [
      '.topic-map__label',
      '.label',
      'dt',
      'small',
      '[class*="__label"]',
      '[class*="-label"]'
    ]);
    const attributeLabel = removeStatValueFromLabel(node.getAttribute?.('aria-label') || node.getAttribute?.('title'), value);
    const textLabel = removeStatValueFromLabel(node.textContent, value);
    const label = nestedLabel || attributeLabel || textLabel || definition.label;
    const statValue = key === 'users' && !value ? extractUserCount(node) : value;

    if (!statValue) return null;
    return { key, label, value: normalizeStatText(statValue) };
  }

  function readTopicMapStats() {
    const maps = Array.from(document.querySelectorAll('.topic-map'));
    maps.sort((first, second) => {
      const firstIsBottom = first.classList.contains('--bottom') ? 1 : 0;
      const secondIsBottom = second.classList.contains('--bottom') ? 1 : 0;
      return secondIsBottom - firstIsBottom;
    });

    const stats = new Map();
    maps.forEach((topicMap) => {
      const candidates = getTopicStatCandidates(topicMap);
      candidates.forEach((candidate) => {
        const key = getTopicStatKey(candidate);
        if (!key || stats.has(key)) return;
        const stat = extractTopicStat(candidate, key);
        if (stat) stats.set(key, stat);
      });

      if (!stats.has('users')) {
        const usersSection = topicMap.querySelector('.topic-map__users, .topic-map__users-list');
        const userCount = usersSection ? extractUserCount(usersSection) : '';
        if (userCount) {
          stats.set('users', {
            key: 'users',
            label: firstTopicStatText(topicMap, ['.topic-map__users .topic-map__label', '.topic-map__users .label']) || TOPIC_STAT_DEFINITIONS.users.label,
            value: userCount
          });
        }
      }
    });

    return ['views', 'likes', 'users'].map((key) => stats.get(key)).filter(Boolean);
  }

  function renderTopicStatistics(shell) {
    const statsContainer = shell?.querySelector('.qqdocs-topic-stats');
    if (!statsContainer) return;

    const stats = readTopicMapStats();
    const signature = stats.map((stat) => `${stat.key}\u0000${stat.value}\u0000${stat.label}`).join('\u0001');
    const hasStats = stats.length > 0;
    if (statsContainer.dataset.qqdocsStatsSignature === signature && statsContainer.hidden === !hasStats) return;

    const fragment = document.createDocumentFragment();
    stats.forEach((stat) => {
      const item = document.createElement('span');
      item.className = `qqdocs-topic-stat qqdocs-topic-stat--${stat.key}`;
      item.setAttribute('data-stat-key', stat.key);

      const value = document.createElement('strong');
      value.className = 'qqdocs-topic-stat-value';
      value.textContent = stat.value;

      const label = document.createElement('span');
      label.className = 'qqdocs-topic-stat-label';
      label.textContent = stat.label;

      item.append(value, label);
      fragment.appendChild(item);
    });

    statsContainer.replaceChildren(fragment);
    statsContainer.dataset.qqdocsStatsSignature = signature;
    statsContainer.hidden = !hasStats;
    statsContainer.setAttribute('aria-hidden', String(!hasStats));
  }

  // 6. 详情页腾讯文档编辑器外壳
  function renderTopicDetail() {
    const postStream = document.querySelector('.post-stream');
    const oldToolbar = document.querySelector('.qqdocs-doc-toolbar');
    if (oldToolbar) oldToolbar.remove();

    if (!postStream) {
      // Ember 路由跳转（如大纲跳到未加载楼层）会短暂移除 .post-stream 并重建，
      // 此时仍在 /t/ 帖子路由内，必须保留伪装外壳与大纲，否则闪退成原生界面。
      if (!/^\/t\//.test(window.location.pathname)) {
        document.querySelector('.qqdocs-editor-shell')?.remove();
        removeTopicOutline();
      }
      return;
    }

    const rawTitle = document.querySelector('#topic-title h1, #topic-title [data-topic-title]')?.textContent || '在线文档';
    const topicTitle = normalizeStatText(rawTitle) || '在线文档';

    // Remove the outline shell left by pre-update userscript versions.
    document.querySelectorAll('[class*="outline"]').forEach((node) => {
      const className = typeof node.className === 'string' ? node.className : '';
      if (className.indexOf('qqdocs-') !== -1 && className.toLowerCase().indexOf('outline') !== -1) node.remove();
    });

    let shell = document.querySelector('.qqdocs-editor-shell');
    // Rebuild a shell injected by an older userscript version during hot update.
    if (shell && (
      !shell.querySelector('.qqdocs-editor-divider') ||
      !shell.querySelector('.qqdocs-topic-stats') ||
      !shell.querySelector('button.qqdocs-editor-home')
    )) {
      shell.remove();
      shell = null;
    }
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'qqdocs-editor-shell';
      shell.innerHTML = `
        <div class="qqdocs-editor-titlebar">
          <div class="qqdocs-editor-title-left">
            <button class="qqdocs-editor-home" type="button" aria-label="返回上一页" title="返回上一页">${renderTdocsChromeIcon('home', 28)}</button>
            <span class="qqdocs-editor-plus" aria-hidden="true">${renderTdocsChromeIcon('plus', 24)}</span>
            <span class="qqdocs-editor-divider" aria-hidden="true"></span>
            <strong class="qqdocs-editor-title-text"></strong>
            <span class="qqdocs-topic-stats" role="group" aria-label="主题统计" aria-live="polite"></span>
            <span class="qqdocs-editor-readonly"><span>只能查看</span>${renderTdocsChromeIcon('arrow', 6)}</span>
            <span class="qqdocs-editor-star">${renderTdocsChromeIcon('star', 16)}</span>
            <span class="qqdocs-editor-folder">${renderTdocsChromeIcon('folder', 16)}</span>
          </div>
          <div class="qqdocs-editor-title-actions" aria-hidden="true">
            <span class="qqdocs-editor-action">${renderTdocsChromeIcon('more', 24)}</span>
            <span class="qqdocs-editor-action">${renderTdocsChromeIcon('ai', 24)}</span>
            <span class="qqdocs-editor-action qqdocs-editor-presentation">${renderTdocsChromeIcon('presentation', 24)}</span>
            <span class="qqdocs-editor-collaborator">${renderTdocsChromeIcon('collaborator', 24)}</span>
            <span class="qqdocs-editor-share">分享</span>
            <span class="qqdocs-editor-account">${renderTdocsChromeIcon('collaborator', 24)}${renderTdocsChromeIcon('wechat', 14)}</span>
          </div>
        </div>
        <div class="qqdocs-editor-tabs" aria-hidden="true">
          <span class="is-active">开始</span><span>插入</span><span>页面</span><span>引用</span>
          <span>审阅</span><span>视图</span><span>效率工具</span><span>公文助手</span><span>会员专享</span>
        </div>
        <div class="qqdocs-editor-ribbon" aria-hidden="true">
          <div class="qqdocs-ribbon-group qqdocs-ribbon-history">
            <span>${renderTdocsChromeIcon('undo', 24)}</span><span>${renderTdocsChromeIcon('redo', 24)}</span>
            <span>${renderTdocsChromeIcon('format', 24)}</span><span>${renderTdocsChromeIcon('clear', 24)}</span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-insert-group">
            <span class="qqdocs-ribbon-labeled">${renderTdocsChromeIcon('insert', 24)}<small>插入</small></span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-font">
            <span class="qqdocs-ribbon-select">微软雅黑${renderTdocsChromeIcon('arrow', 6)}</span>
            <span class="qqdocs-ribbon-size">11${renderTdocsChromeIcon('arrow', 6)}</span>
            <span>${renderTdocsChromeIcon('fontPlus', 24)}</span><span>${renderTdocsChromeIcon('fontMinus', 24)}</span>
            <span>${renderTdocsChromeIcon('pinyin', 24)}</span><span>${renderTdocsChromeIcon('style', 24)}</span>
            <span>${renderTdocsChromeIcon('bold', 24)}</span><span>${renderTdocsChromeIcon('italic', 24)}</span><span>${renderTdocsChromeIcon('underline', 24)}</span>
            <span>${renderTdocsChromeIcon('strike', 24)}</span><span>${renderTdocsChromeIcon('superscript', 24)}</span><span>${renderTdocsChromeIcon('fontPlus', 20)}</span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-paragraph">
            <span>${renderTdocsChromeIcon('list', 24)}</span><span>${renderTdocsChromeIcon('numbered', 24)}</span><span>${renderTdocsChromeIcon('todo', 24)}</span>
            <span>${renderTdocsChromeIcon('outdent', 24)}</span><span>${renderTdocsChromeIcon('indent', 24)}</span><span>${renderTdocsChromeIcon('spacing', 24)}</span>
            <span>${renderTdocsChromeIcon('alignLeft', 20)}</span><span>${renderTdocsChromeIcon('alignCenter', 20)}</span><span>${renderTdocsChromeIcon('alignRight', 20)}</span>
            <span>${renderTdocsChromeIcon('justify', 20)}</span><span>${renderTdocsChromeIcon('distribute', 20)}</span><span>${renderTdocsChromeIcon('quote', 24)}</span>
            <span>${renderTdocsChromeIcon('block', 24)}</span><span>${renderTdocsChromeIcon('paragraph', 24)}</span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-styles">
            <span class="is-selected">正文</span><span>标题 1</span><span>标题 2</span><span>标题 3</span><span>标题 4</span><span>标题 5</span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-tools">
            <span>${renderTdocsChromeIcon('beautify', 24)}生成图片</span><span>${renderTdocsChromeIcon('image', 24)}PDF转换</span>
            <span>${renderTdocsChromeIcon('plugin', 24)}插件</span><span>${renderTdocsChromeIcon('print', 24)}打印</span>
          </div>
          <div class="qqdocs-ribbon-search">${renderTdocsChromeIcon('search', 24)}${renderTdocsChromeIcon('arrow', 6)}</div>
        </div>
      `;
      document.body.appendChild(shell);
    }

    const shellTitle = shell.querySelector('.qqdocs-editor-title-text');
    if (shellTitle && shellTitle.textContent !== topicTitle) shellTitle.textContent = topicTitle;

    const homeButton = shell.querySelector('button.qqdocs-editor-home');
    if (homeButton && homeButton.dataset.qqdocsHistoryBackBound !== 'true') {
      homeButton.dataset.qqdocsHistoryBackBound = 'true';
      homeButton.addEventListener('click', () => window.history.back());
    }
    renderTopicStatistics(shell);
    renderTopicOutline();
  }

  // 6.1 详情页左侧大纲面板（复刻腾讯文档"大纲"导航）
  const TOPIC_OUTLINE_HIDDEN_KEY = 'qqdocs.toc.hidden';
  const TOPIC_OUTLINE_COLLAPSED_KEY = 'qqdocs.toc.collapsed';
  let topicOutlinePostObserver = null;
  const topicOutlineObservedPosts = new WeakSet();
  const topicOutlineVisibleRatios = new Map();
  // postId -> { number, author, summary }。Discourse 会把 postStream.posts 换
  // 成目标楼附近的新窗口，本地缓存保证已点亮的楼层信息不回退。
  const topicOutlinePostCache = new Map();
  let topicOutlineCacheTopicKey = '';

  function removeTopicOutline() {
    document.querySelector('.qqdocs-toc-panel')?.remove();
    document.querySelector('.qqdocs-toc-fab')?.remove();
    if (topicOutlinePostObserver) {
      topicOutlinePostObserver.disconnect();
      topicOutlinePostObserver = null;
    }
    topicOutlineObservedPosts.clear?.();
    topicOutlineVisibleRatios.clear();
  }

  // Tampermonkey 沙箱中 window.Discourse 等页面全局只能经 unsafeWindow 访问。
  function getPageWindow() {
    try {
      if (typeof unsafeWindow !== 'undefined' && unsafeWindow !== window) return unsafeWindow;
    } catch (e) { /* 无 unsafeWindow 授权时退回 window */ }
    return window;
  }

  function getTopicControllerModel() {
    try {
      const pageWindow = getPageWindow();
      const container = pageWindow.Discourse && pageWindow.Discourse.__container__;
      return container?.lookup?.('controller:topic')?.model || null;
    } catch (e) {
      return null;
    }
  }

  function buildOutlineSummary(cooked, maxChars) {
    if (!cooked) return '';
    const scratch = document.createElement('div');
    scratch.innerHTML = String(cooked);
    const text = normalizeStatText(scratch.textContent || '');
    return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
  }

  // Ember 数据不可达时的兜底：直接从已渲染的楼层 DOM 提取条目，
  // 跟随虚拟滚动逐步补全（楼层总数未知，只列当前已渲染楼层）。
  function collectOutlineEntriesFromDom() {
    const posts = document.querySelectorAll('.post-stream .topic-post[data-post-number]');
    if (!posts.length) return null;
    const entries = Array.from(posts).map((post) => {
      const number = Number(post.getAttribute('data-post-number'));
      const author = normalizeStatText(post.querySelector('.names .first a, .names a')?.textContent || '');
      return {
        number,
        loaded: true,
        author,
        summary: buildOutlineSummary(post.querySelector('.cooked')?.innerHTML, 36),
        replyTo: 0
      };
    });
    return { title: document.querySelector('#topic-title h1')?.textContent?.trim() || '', entries };
  }

  function getTopicIdKey() {
    const model = getTopicControllerModel();
    const fromModel = Number(model?.id);
    if (Number.isFinite(fromModel) && fromModel > 0) return String(fromModel);
    // 路由跳转瞬间 model 可能还没解析完，退回从地址栏取主题 id。
    return window.location.pathname.match(/^\/t\/[^/]+\/(\d+)/)?.[1] || '';
  }

  function syncOutlinePostCache(loadedPosts) {
    if (!Array.isArray(loadedPosts)) return;
    loadedPosts.forEach((post) => {
      const id = Number(post?.id);
      if (!Number.isFinite(id) || id <= 0) return;
      // 实时数据覆盖缓存，楼层被编辑后大纲同步更新。
      topicOutlinePostCache.set(id, {
        number: Number(post?.post_number) || 0,
        author: normalizeStatText(post?.name || post?.username || ''),
        summary: buildOutlineSummary(post?.cooked, 36)
      });
    });
  }

  function collectOutlineEntries() {
    const model = getTopicControllerModel();
    const postStream = model?.postStream;
    const stream = postStream?.stream; // Discourse 内部存的是 post id 数组，按楼层顺序排列
    const loadedPosts = postStream?.posts;
    if (!Array.isArray(stream) || !stream.length) return collectOutlineEntriesFromDom();

    // 换主题时清空缓存，避免把上一个帖子的楼层信息带到新帖子。
    const topicKey = getTopicIdKey();
    if (topicKey && topicOutlineCacheTopicKey !== topicKey) {
      topicOutlineCacheTopicKey = topicKey;
      topicOutlinePostCache.clear();
    }

    // Discourse 跳转到未加载楼层时会把 postStream.posts 替换成目标楼附近的
    // 新窗口，之前点亮的楼层数据会被丢掉。这里先把实时数据并入本地缓存，
    // 再由缓存合成条目，已见过的楼层信息就不会退回"加载中"。
    syncOutlinePostCache(loadedPosts);

    const entries = stream.map((rawId, index) => {
      const cached = topicOutlinePostCache.get(Number(rawId)) || null;
      // 已见过的楼层用真实 post_number；其余用顺序号近似，加载后自动修正。
      const number = Number(cached?.number) || index + 1;
      return {
        number,
        loaded: Boolean(cached),
        author: cached?.author || '',
        summary: cached?.summary || ''
      };
    });

    return { title: document.querySelector('#topic-title h1')?.textContent?.trim() || '', entries };
  }

  function renderOutlineHeadlineMarkup(entry) {
    const row = document.createElement('div');
    row.className = 'qqdocs-toc-headline' + (entry.loaded ? ' is-loaded' : '');
    row.dataset.postNumber = String(entry.number);
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `跳转到第 ${entry.number} 楼`);

    const triangle = document.createElement('div');
    triangle.className = 'qqdocs-toc-headline-triangle';
    triangle.setAttribute('aria-hidden', 'true');
    triangle.style.display = 'none';
    row.appendChild(triangle);

    const text = document.createElement('div');
    text.className = 'qqdocs-toc-headline-text is-floor';
    text.style.paddingLeft = '16px';

    const inner = document.createElement('span');
    inner.className = 'qqdocs-toc-headline-inner-text';
    if (entry.loaded) {
      inner.textContent = `#${entry.number} ${entry.author}${entry.summary ? ` ${entry.summary}` : ''}`.trim();
      row.title = inner.textContent;
    } else {
      inner.textContent = `#${entry.number} 加载中…`;
    }
    text.appendChild(inner);
    row.appendChild(text);
    return row;
  }

  function renderOutlineTitleMarkup(title) {
    const row = document.createElement('div');
    row.className = 'qqdocs-toc-headline is-loaded is-title-row';
    row.dataset.postNumber = '1';
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', '回到顶部');

    const triangle = document.createElement('div');
    triangle.className = 'qqdocs-toc-headline-triangle';
    triangle.setAttribute('aria-hidden', 'true');
    triangle.style.display = 'none';
    row.appendChild(triangle);

    const text = document.createElement('div');
    text.className = 'qqdocs-toc-headline-text is-title';
    const inner = document.createElement('span');
    inner.className = 'qqdocs-toc-headline-inner-text';
    inner.textContent = title || '在线文档';
    row.title = inner.textContent;
    text.appendChild(inner);
    row.appendChild(text);
    return row;
  }

  function syncTopicOutlineList(panel, data) {
    const list = panel.querySelector('.qqdocs-toc-headlines');
    if (!list) return;

    const signature = `${data.title}\u0002${data.entries
      .map((entry) => `${entry.number}:${entry.loaded ? `${entry.author}\u0000${entry.summary}` : ''}`)
      .join('\u0001')}`;
    if (panel.dataset.qqdocsOutlineSignature === signature) return;
    panel.dataset.qqdocsOutlineSignature = signature;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(renderOutlineTitleMarkup(data.title));
    data.entries.forEach((entry) => fragment.appendChild(renderOutlineHeadlineMarkup(entry)));
    list.replaceChildren(fragment);
    applyTopicOutlineActiveState();
  }

  function applyTopicOutlineActiveState() {
    const list = document.querySelector('.qqdocs-toc-panel .qqdocs-toc-headlines');
    if (!list) return;

    let bestNumber = 0;
    let bestRatio = 0;
    topicOutlineVisibleRatios.forEach((ratio, number) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestNumber = number;
      }
    });

    list.querySelectorAll('.qqdocs-toc-headline.is-active').forEach((row) => row.classList.remove('is-active'));
    if (!bestNumber) return;

    const activeRow = list.querySelector(`.qqdocs-toc-headline[data-post-number="${bestNumber}"]`);
    if (!activeRow) return;
    activeRow.classList.add('is-active');
    if (activeRow.scrollIntoView) activeRow.scrollIntoView({ block: 'nearest' });
  }

  function ensureTopicOutlineObserver() {
    if (!topicOutlinePostObserver) {
      topicOutlinePostObserver = new IntersectionObserver((records) => {
        records.forEach((record) => {
          const number = Number(record.target?.getAttribute('data-post-number'));
          if (!Number.isFinite(number)) return;
          if (record.isIntersecting && record.intersectionRatio > 0.08) {
            topicOutlineVisibleRatios.set(number, record.intersectionRatio);
          } else {
            topicOutlineVisibleRatios.delete(number);
          }
        });
        applyTopicOutlineActiveState();
      }, { threshold: [0, 0.08, 0.25, 0.5, 0.75, 1] });
    }

    document.querySelectorAll('.post-stream .topic-post[data-post-number]').forEach((post) => {
      if (topicOutlineObservedPosts.has(post)) return;
      topicOutlineObservedPosts.add(post);
      topicOutlinePostObserver.observe(post);
    });
  }

  // 从当前地址提取帖子路由基座（/t/<slug>/<topicId>），用于构造楼层锚点。
  function getTopicRouteBase() {
    const match = window.location.pathname.match(/^\/t\/[^/]+\/\d+/);
    return match ? match[0] : null;
  }

  // 走 Discourse 的 SPA 路由跳转到指定楼层，与原生点击楼层锚点链接
  // （转圈加载→滚动到位，不整页刷新）的行为完全一致。
  function routeToPostNumber(number) {
    const base = getTopicRouteBase();
    if (!base) return false;
    const url = `${base}/${number}`;
    try {
      const pageWindow = getPageWindow();
      const container = pageWindow.Discourse && pageWindow.Discourse.__container__;
      const urlService = container?.lookup?.('service:url');
      if (typeof urlService?.routeTo === 'function') {
        urlService.routeTo(url);
        return true;
      }
      const amdRequire = pageWindow.require;
      if (typeof amdRequire === 'function') {
        const urlModule = amdRequire('discourse/lib/url');
        const routeTo = urlModule?.default?.routeTo || urlModule?.routeTo;
        if (typeof routeTo === 'function') {
          routeTo.call(urlModule?.default || urlModule, url);
          return true;
        }
      }
    } catch (e) { /* 继续走旧兜底 */ }
    return false;
  }

  function jumpToOutlinePost(number) {
    if (!Number.isFinite(number) || number <= 0) return;
    // 滚动容器上的 scroll-margin 不可靠（smooth 会被 Discourse 的滚动管理打断），
    // 这里手动计算目标位置，避开顶部编辑器外壳的 150px。
    const target = document.querySelector(`.post-stream .topic-post[data-post-number="${number}"]`)
      || document.getElementById(`post_${number}`);
    if (target) {
      const editorTop = parseInt(getComputedStyle(document.body).getPropertyValue('--qqdocs-editor-top'), 10) || 150;
      const top = target.getBoundingClientRect().top + window.scrollY - editorTop - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      return;
    }
    // 未加载楼层：SPA 路由加载（原生锚点行为），失败再退回 Ember action。
    if (routeToPostNumber(number)) return;
    try {
      const pageWindow = getPageWindow();
      const container = pageWindow.Discourse && pageWindow.Discourse.__container__;
      container?.lookup?.('controller:topic')?.send?.('jumpToPost', number);
    } catch (e) {
      /* 未加载楼层跳转失败时静默忽略 */
    }
  }

  function bindTopicOutlineEvents(panel, fab) {
    const collapsedAtBind = panel.dataset.qqdocsOutlineBound === 'true';
    if (collapsedAtBind) return;
    panel.dataset.qqdocsOutlineBound = 'true';

    const applyVisibility = () => {
      const hidden = panel.classList.contains('is-hidden');
      fab.classList.toggle('is-hidden', !hidden);
      try {
        window.localStorage.setItem(TOPIC_OUTLINE_HIDDEN_KEY, hidden ? '1' : '0');
      } catch (e) { /* 隐私模式等场景忽略 */ }
    };
    const applyCollapsed = () => {
      const collapsed = panel.classList.contains('is-collapsed');
      panel.querySelector('.qqdocs-toc-collapse')?.setAttribute('aria-expanded', String(!collapsed));
      try {
        window.localStorage.setItem(TOPIC_OUTLINE_COLLAPSED_KEY, collapsed ? '1' : '0');
      } catch (e) { /* 忽略 */ }
    };

    panel.addEventListener('click', (event) => {
      const close = event.target.closest?.('.qqdocs-toc-close');
      if (close) {
        panel.classList.add('is-hidden');
        applyVisibility();
        return;
      }
      const collapse = event.target.closest?.('.qqdocs-toc-collapse');
      if (collapse) {
        panel.classList.toggle('is-collapsed');
        applyCollapsed();
        return;
      }
      const row = event.target.closest?.('.qqdocs-toc-headline');
      if (row) {
        // 未加载楼层走异步路由加载，先给该行一个转圈反馈。
        if (!row.classList.contains('is-loaded')) {
          row.classList.add('is-jumping');
          window.setTimeout(() => row.classList.remove('is-jumping'), 3500);
        }
        jumpToOutlinePost(Number(row.dataset.postNumber));
      }
    });

    fab.addEventListener('click', () => {
      panel.classList.remove('is-hidden');
      applyVisibility();
    });

    try {
      if (window.localStorage.getItem(TOPIC_OUTLINE_HIDDEN_KEY) === '1') panel.classList.add('is-hidden');
      if (window.localStorage.getItem(TOPIC_OUTLINE_COLLAPSED_KEY) === '1') panel.classList.add('is-collapsed');
    } catch (e) { /* 忽略 */ }
    applyVisibility();
    applyCollapsed();
  }

  function renderTopicOutline() {
    const postStream = document.querySelector('.post-stream');
    if (!postStream) {
      removeTopicOutline();
      return;
    }

    const data = collectOutlineEntries();
    if (!data || !data.entries.length) {
      removeTopicOutline();
      return;
    }

    let panel = document.querySelector('.qqdocs-toc-panel');
    let fab = document.querySelector('.qqdocs-toc-fab');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'qqdocs-toc-panel';
      panel.innerHTML = `
        <div class="qqdocs-toc-header">
          <div class="qqdocs-toc-title">大纲</div>
          <div class="qqdocs-toc-button-common">
            <div class="qqdocs-toc-btn qqdocs-toc-collapse" role="button" aria-label="折叠大纲" title="折叠/展开"></div>
            <div class="qqdocs-toc-btn qqdocs-toc-close" role="button" aria-label="关闭大纲" title="关闭"></div>
          </div>
        </div>
        <div class="qqdocs-toc-body">
          <div class="qqdocs-toc-headlines"></div>
        </div>
      `;
      document.body.appendChild(panel);
    }
    if (!fab) {
      fab = document.createElement('div');
      fab.className = 'qqdocs-toc-fab';
      fab.setAttribute('role', 'button');
      fab.setAttribute('aria-label', '展开大纲');
      fab.title = '大纲';
      document.body.appendChild(fab);
    }

    bindTopicOutlineEvents(panel, fab);
    syncTopicOutlineList(panel, data);
    ensureTopicOutlineObserver();
  }


  // 详情页样式必须有明确的页面作用域，避免列表页或弹窗被误伤。
  // 路由内模型重载期间 .post-stream 会短暂消失，此时按 /t/ 路径保持作用域。
  function isTopicRoute() {
    return /^\/t\//.test(window.location.pathname);
  }

  function syncTopicDetailScope() {
    if (!document.body) return;
    const inTopic = Boolean(document.querySelector('.post-stream')) || isTopicRoute();
    document.body.classList.toggle('qqdocs-topic-detail', inTopic);
  }

  function classifyCurrentPage() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';

    if (document.querySelector('.post-stream') || isTopicRoute()) return 'topic';
    if (path === '/search' || path.startsWith('/search/')) return 'search';
    if (path === '/') return 'home';
    if (path === '/categories') return 'categories';
    if (path === '/tags') return 'tags';
    if (path === '/badges' || path.startsWith('/badges/')) return 'badges';
    if (path === '/u') return 'users';
    if (path === '/g') return 'groups';
    if (path.startsWith('/g/')) return 'group';
    if (/^\/u\/[^/]+\/preferences(?:\/|$)/.test(path)) return 'preferences';
    if (/^\/u\/[^/]+\/activity\/bookmarks(?:\/|$)/.test(path) || path === '/bookmarks') return 'bookmarks';
    if (/^\/u\/[^/]+\/notifications(?:\/|$)/.test(path) || path === '/notifications') return 'notifications';
    if (/^\/u\/[^/]+\/messages(?:\/|$)/.test(path) || path === '/my/messages') return 'messages';
    if (path.startsWith('/u/')) return 'user';
    if (path === '/about') return 'about';
    if (/^\/(?:guidelines|faq|tos|privacy)$/.test(path)) return 'static';
    if (/^\/(?:login|signup|password-reset|session)/.test(path)) return 'auth';
    if (path.startsWith('/review')) return 'review';
    if (path.startsWith('/chat')) return 'chat';
    if (path === '/404' || document.body?.classList.contains('error-page') || document.querySelector('.page-not-found')) return 'error';
    if (document.querySelector('.topic-list, .topic-list-container')) return 'list';
    return 'generic';
  }

  function syncWorkspaceNavigation(pageKind) {
    const path = window.location.pathname;
    const sidebar = document.querySelector('.desktop-layout-sidebar-pc');
    if (sidebar) {
      const links = Array.from(sidebar.querySelectorAll('.desktop-node-link-router'));
      links.forEach((link) => link.classList.remove('desktop-link-active'));

      let activeHref = '/';
      if (pageKind === 'categories' || pageKind === 'tags' || pageKind === 'groups' || pageKind === 'group' || pageKind === 'users') {
        activeHref = '/categories';
      } else if (pageKind === 'list' || path.startsWith('/c/') || path.startsWith('/tag/')) {
        activeHref = '/latest';
      } else if (path.startsWith('/top')) {
        activeHref = '/top';
      } else if (['user', 'preferences', 'bookmarks', 'notifications', 'messages'].includes(pageKind)) {
        activeHref = '/my/activity';
      }
      sidebar.querySelector(`.desktop-node-link-router[href="${activeHref}"]`)?.classList.add('desktop-link-active');
    }

    const tabs = document.querySelector('.desktop-home-page-tab-header-pc');
    if (tabs) {
      const links = Array.from(tabs.querySelectorAll('.desktop-tab-link'));
      links.forEach((link) => link.classList.remove('desktop-link-active'));
      let activeHref = '/';
      if (['categories', 'tags', 'groups', 'group', 'users'].includes(pageKind)) activeHref = '/categories';
      else if (['user', 'bookmarks', 'notifications', 'messages', 'preferences'].includes(pageKind)) activeHref = '/my/activity';
      tabs.querySelector(`.desktop-tab-link[href="${activeHref}"]`)?.classList.add('desktop-link-active');
    }
  }

  function replaceText(selector, text) {
    const element = document.querySelector(selector);
    if (element && element.textContent !== text) element.textContent = text;
  }

  function renderSecondaryPageLabels(pageKind) {
    const path = window.location.pathname;
    if (pageKind === 'categories') {
      replaceText('.category-list-header th.category', '空间名称');
      replaceText('.category-list-header th.topics', '近期动态');
      document.title = '团队空间';
    } else if (pageKind === 'tags') {
      replaceText('.tags-index .tags-controls h2', '模板标签');
      document.title = '模板标签';
    } else if (pageKind === 'badges') {
      replaceText('.badges h1, .badges h2', '模板中心');
      document.title = '模板中心';
    } else if (pageKind === 'groups') {
      replaceText('.groups-index > h1', '团队空间');
      document.title = '团队空间';
    } else if (pageKind === 'users') {
      replaceText('.users-directory > h1', '协作者');
      document.title = '协作者';
    } else if (pageKind === 'about') {
      replaceText('.about__header h1', '团队空间');
      replaceText('.about__header .short-description', '成员、权限与协作概览');
      replaceText('.about__left-side > h2', '空间说明');
      replaceText('.about__admins > h2', '空间管理员');
      replaceText('.about__moderators > h2', '协作管理员');
      document.title = '团队空间概览';
    } else if (pageKind === 'static') {
      const titleByPath = {
        '/guidelines': '共享空间规范',
        '/faq': '帮助中心',
        '/tos': '服务条款',
        '/privacy': '隐私设置'
      };
      document.title = titleByPath[path] || '帮助中心';
    } else if (pageKind === 'preferences') {
      document.title = '帐户设置';
    } else if (pageKind === 'bookmarks') {
      document.title = '收藏文档';
    } else if (pageKind === 'notifications') {
      document.title = '消息通知';
    } else if (pageKind === 'messages') {
      document.title = '协作消息';
    } else if (pageKind === 'error') {
      replaceText('.page-not-found .title', '文档暂时无法打开');
      replaceText('.page-not-found-search h2', '搜索其他文档');
      document.title = '文档未找到';
    }
  }

  function syncPageScope() {
    if (!document.body) return;
    const pageKind = classifyCurrentPage();
    document.body.classList.add('qqdocs-page');
    PAGE_SCOPE_CLASSES.forEach((className) => document.body.classList.remove(className));
    document.body.classList.add(`qqdocs-page-${pageKind}`);
    document.body.classList.toggle('qqdocs-page-secondary', !['home', 'list', 'search', 'topic'].includes(pageKind));
    document.body.dataset.qqdocsPage = pageKind;
    syncWorkspaceNavigation(pageKind);
    renderSecondaryPageLabels(pageKind);
  }

  function runRenderPass() {
    applyFavicon();
    syncPageScope();
    syncTopicDetailScope();
    renderHeader();
    renderSidebar();
    renderTopicList();
    renderSearchResults();
    renderTopicDetail();
    syncWorkspaceNavigation(classifyCurrentPage());
    syncPostImageToggles();
    syncPostEmojiLabels();
  }

  function queueRenderPass() {
    if (renderPassQueued) return;
    renderPassQueued = true;
    const flush = () => {
      renderPassQueued = false;
      runRenderPass();
    };
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(flush);
    else window.setTimeout(flush, 0);
  }

  function attachRouteListeners() {
    if (routeListenersAttached) return;
    routeListenersAttached = true;
    window.addEventListener('popstate', queueRenderPass);
    window.addEventListener('hashchange', queueRenderPass);
  }

  function handleDomMutations(records) {
    // Child-list and text mutations cover Discourse's normal re-rendering and
    // virtualized post/reaction replacement. Attribute observation fills the
    // remaining case where the same emoji image or its data-* marker wrapper
    // gets a new shortcode/source. Our own wrapper mutations may enqueue one
    // coalesced pass, but all sync operations remain idempotent.
    const shouldRender = records.some((record) => {
      if (record.type !== 'attributes') return true;

      const target = record.target;
      if (!target || target.nodeType !== 1) return false;
      return Boolean(target.closest('.post-stream .cooked, .post-stream .topic-meta-data, .post-stream nav.post-controls .discourse-reactions-list-emoji, .post-stream button.discourse-boosts__cooked'));
    });

    if (shouldRender) queueRenderPass();
  }

  function init() {
    applyFavicon();
    hijackTitle();
    attachRouteListeners();
    runRenderPass();

    if (domObserver) domObserver.disconnect();
    domObserver = new MutationObserver(handleDomMutations);

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        'alt',
        'title',
        'src',
        'data-src',
        'data-emoji',
        'data-emoji-name',
        'data-emoji-shortcode',
        'data-name',
        'aria-label',
        'class'
      ]
    });
  }

  return { init: init };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DisguiseEngine };
}


  // DOM 就绪时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DisguiseEngine.init());
  } else {
    DisguiseEngine.init();
  }
})();
