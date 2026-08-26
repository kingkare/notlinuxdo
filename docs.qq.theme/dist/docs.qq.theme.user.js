// ==UserScript==
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
  const css = "\n/* --- variables.css --- */\n/* 腾讯文档 2026 官方 Design Token 变量 */\n:root {\n  --text-ultrastrong: rgba(0, 0, 0, 0.9);\n  --text-strong: rgba(0, 0, 0, 0.76);\n  --text-medium: rgba(0, 0, 0, 0.56);\n  --text-weak: rgba(0, 0, 0, 0.26);\n  --text-link: #175ceb;\n  --text-white: #fff;\n  --text-vip: #e59837;\n\n  --accent-default: #1e6fff;\n  --accent-hover: #175ceb;\n  --accent-pressed: #134ae0;\n  --accent-disabled: #c2d8ff;\n\n  --bg-lv1-default: #fff;\n  --bg-lv2-default: #fff;\n  --bg-lv3-default: #fff;\n  --bg-lv4-default: #fff;\n  --bg-lv3-medium: #f3f5f7;\n\n  --border-weak: rgba(0, 0, 0, 0.04);\n  --border-medium: rgba(0, 0, 0, 0.08);\n  --border-strong: rgba(0, 0, 0, 0.12);\n\n  --feedback-hover: rgba(51, 77, 102, 0.06);\n  --feedback-active: rgba(51, 77, 102, 0.08);\n\n  --sidebar-width: 244px;\n  /* 腾讯文档桌面端实测：顶部栏高 60px，左侧栏宽 244px。 */\n  --topbar-height: 60px;\n\n  --font-family: -apple-system, \"PingFang SC\", \"Microsoft YaHei\", \"Source Han Sans SC\", \"Noto Sans CJK SC\", \"WenQuanYi Micro Hei\", sans-serif;\n}\n\n/* --- global.css --- */\n/* 全局基础重置与工作台布局 (彻底解决 #main-outlet-wrapper 居中与重复偏移) */\n\nhtml, body {\n  background-color: #ffffff !important;\n  color: var(--text-ultrastrong) !important;\n  font-family: var(--font-family) !important;\n  font-size: 13px !important;\n  line-height: 1.5 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow-x: hidden !important;\n  width: 100vw !important;\n}\n\n/* 1. 彻底隐藏 Linux Do 原生的所有 Banner、Notice、公告、原生侧栏与导航条 */\n.welcome-banner,\n.custom-search-banner-wrap,\n.global-notice,\n.alert,\n.alert-info,\n.alert-update-topics,\n.above-main-container-outlet,\n.list-controls,\n.navigation-container,\n.navigation-controls,\n.nav-pills,\n.categories-admin-dropdown,\n.category-breadcrumb,\n.category-boxes,\n.top-notices,\n.community-rule,\n#site-text-logo,\n.sidebar-wrapper,\n#d-sidebar,\n.d-sidebar-wrapper,\n.topic-list-bottom,\n.nav-tabs,\n.select-kit,\n.loading-container {\n  display: none !important;\n}\n\n/* 2. 重置 Discourse 外层包装容器 #main-outlet-wrapper (去除原版的 max-width: 1110px 和 margin: 0 auto) */\n#main-outlet-wrapper,\n#main-outlet-wrapper.wrap {\n  display: block !important;\n  margin: 0 0 0 var(--sidebar-width) !important;\n  padding: 0 !important;\n  width: calc(100vw - var(--sidebar-width)) !important;\n  max-width: calc(100vw - var(--sidebar-width)) !important;\n  box-sizing: border-box !important;\n  min-height: calc(100vh - var(--topbar-height)) !important;\n  grid-template-columns: 1fr !important;\n}\n\n/* 3. #main-outlet 与主容器直接贴紧左侧栏，消除任何多余空白 */\n#main-outlet {\n  margin: 0 !important;\n  width: 100% !important;\n  max-width: 100% !important;\n  padding: 16px 28px !important;\n  box-sizing: border-box !important;\n  background: #ffffff !important;\n  display: block !important;\n}\n\n#main-container,\n#main-container.container,\n#main-outlet > .container,\n#main-outlet > .container.list-container,\n#main-outlet > .ember-view,\n.topic-list-container {\n  width: 100% !important;\n  max-width: 100% !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  box-sizing: border-box !important;\n  display: block !important;\n}\n\n/* 4. 滚动条轻量化 */\n::-webkit-scrollbar {\n  width: 6px;\n  height: 6px;\n}\n::-webkit-scrollbar-track {\n  background: transparent;\n}\n::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.12);\n  border-radius: 3px;\n}\n::-webkit-scrollbar-thumb:hover {\n  background: rgba(0, 0, 0, 0.22);\n}\n\n/* 5. 浮动模式切换小按钮 (Alt+Q) */\n.qqdocs-toggle-badge {\n  position: fixed;\n  right: 16px;\n  bottom: 16px;\n  z-index: 999999;\n  background: #ffffff;\n  border: 1px solid var(--border-medium);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n  padding: 5px 12px;\n  border-radius: 20px;\n  font-size: 12px;\n  color: var(--text-medium);\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  user-select: none;\n  transition: all 0.2s ease;\n}\n.qqdocs-toggle-badge:hover {\n  color: var(--accent-default);\n  border-color: var(--accent-default);\n}\n\n/* --- header.css --- */\n/* 腾讯文档官方原生 Header 样式 */\n.d-header {\n  background: var(--bg-lv3-medium) !important;\n  border-bottom: 0 !important;\n  box-shadow: none !important;\n  height: var(--topbar-height) !important;\n  padding: 0 !important;\n  position: sticky !important;\n  top: 0 !important;\n  z-index: 1100 !important;\n  width: 100vw !important;\n  max-width: 100vw !important;\n  box-sizing: border-box !important;\n}\n\n.d-header .wrap {\n  max-width: 100% !important;\n  width: 100% !important;\n  height: 100% !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n}\n\n.d-header .contents {\n  height: 100% !important;\n  display: flex !important;\n  align-items: center !important;\n  width: 100% !important;\n  justify-content: flex-start !important;\n  flex-flow: row nowrap !important;\n  min-width: 0 !important;\n  position: relative !important;\n}\n\n/* Discourse 2026 的 Logo outlet 本身也是 flex item，必须固定为侧栏宽度。 */\n.d-header .home-logo-wrapper-outlet {\n  display: flex !important;\n  align-items: center !important;\n  width: var(--sidebar-width) !important;\n  min-width: var(--sidebar-width) !important;\n  height: 100% !important;\n  flex: 0 0 var(--sidebar-width) !important;\n  overflow: visible !important;\n  order: 0 !important;\n}\n\n/* 彻底隐藏原论坛左侧边栏折叠按钮、Logo与右侧原生各种按钮 */\n.header-sidebar-toggle,\n.btn-sidebar-toggle,\n.d-header .title a img,\n.d-header .title a .title-text,\n.d-header-icons .hamburger-dropdown,\n.d-header-icons .language-switcher,\n.d-header-icons .search-dropdown,\n.d-header-icons .chat-header-icon,\n.d-header-icons .header-dropdown-toggle:not(#current-user):not(.desktop-top-bar-right) {\n  display: none !important;\n}\n\n/* 官方左侧 Logo 容器 */\n.d-header .title {\n  display: flex !important;\n  align-items: center !important;\n  width: var(--sidebar-width) !important;\n  min-width: var(--sidebar-width) !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  flex-shrink: 0 !important;\n  position: static !important;\n  overflow: visible !important;\n  box-sizing: border-box !important;\n  order: 0 !important;\n}\n\n.desktop-top-bar-left {\n  display: flex !important;\n  align-items: center !important;\n  width: 100% !important;\n}\n\n.desktop-logo-pc {\n  display: inline-flex !important;\n  align-items: center !important;\n  text-decoration: none !important;\n  width: 100% !important;\n  height: 24px !important;\n  padding-left: 32px !important;\n  box-sizing: border-box !important;\n  flex-shrink: 0 !important;\n}\n.desktop-logo-pc svg {\n  display: block !important;\n  width: 180px !important;\n  height: 24px !important;\n  max-width: 180px !important;\n  flex: 0 0 180px !important;\n}\n\n/* 搜索框 (DUI 官方规范) */\n.d-header .desktop-search-input-pc {\n  position: relative !important;\n  display: flex !important;\n  align-items: center !important;\n  background: #ffffff !important;\n  border: 1px solid var(--border-medium) !important;\n  border-radius: 8px !important;\n  height: 38px !important;\n  width: clamp(220px, calc(100vw - var(--sidebar-width) - 558px), 960px) !important;\n  max-width: 960px !important;\n  min-width: 220px !important;\n  padding: 0 14px !important;\n  box-sizing: border-box !important;\n  transition: all 0.2s ease !important;\n  margin: 0 !important;\n  flex: 0 1 clamp(220px, calc(100vw - var(--sidebar-width) - 558px), 960px) !important;\n  order: 1 !important;\n  overflow: hidden !important;\n}\n.d-header .desktop-search-input-pc:focus-within {\n  background: #ffffff !important;\n  border: 1px solid var(--accent-default) !important;\n  box-shadow: 0 0 0 2px rgba(30, 111, 255, 0.15) !important;\n}\n.d-header .desktop-search-input-pc input {\n  border: none !important;\n  outline: none !important;\n  background: transparent !important;\n  font-size: 12px !important;\n  color: var(--text-ultrastrong) !important;\n  width: 100% !important;\n  padding-left: 6px !important;\n}\n.d-header .desktop-search-input-pc input::placeholder {\n  color: var(--text-weak) !important;\n}\n\n/* 接管原生 panel (右侧按钮组容器) */\n.d-header .panel {\n  display: flex !important;\n  align-items: center !important;\n  margin-left: auto !important;\n  float: none !important;\n  height: 100% !important;\n  min-width: 0 !important;\n  padding: 0 16px 0 24px !important;\n  box-sizing: border-box !important;\n  flex: 0 0 auto !important;\n  order: 2 !important;\n}\n\n/* 顶部右侧功能按钮组 */\n.d-header-icons {\n  display: flex !important;\n  align-items: center !important;\n}\n\n.desktop-top-bar-right {\n  display: flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n}\n\n.desktop-top-bar-button {\n  background: transparent !important;\n  border: none !important;\n  outline: none !important;\n  cursor: pointer !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 4px !important;\n  font-size: 13px !important;\n  color: var(--text-strong) !important;\n  padding: 4px 8px !important;\n  border-radius: 4px !important;\n  transition: background-color 0.15s ease !important;\n  user-select: none !important;\n  text-decoration: none !important;\n}\n.desktop-top-bar-button:hover {\n  background-color: var(--feedback-hover) !important;\n  color: var(--text-ultrastrong) !important;\n}\n\n.desktop-vip-center-button {\n  color: var(--text-vip) !important;\n  font-weight: 500 !important;\n}\n.desktop-vip-center-button:hover {\n  color: #c97f26 !important;\n}\n\n.desktop-notification-badge {\n  background: #f54a45 !important;\n  color: #fff !important;\n  font-size: 10px !important;\n  font-weight: 600 !important;\n  padding: 0 4px !important;\n  height: 14px !important;\n  line-height: 14px !important;\n  border-radius: 7px !important;\n  margin-left: 2px !important;\n}\n\n/* 窄屏时先收起文字型次要入口，始终给品牌和搜索框保留独立空间。 */\n@media (max-width: 1180px) {\n  .desktop-top-bar-button span:not(.desktop-notification-badge) {\n    display: none !important;\n  }\n\n  .desktop-top-bar-right {\n    gap: 2px !important;\n  }\n\n  .d-header .panel {\n    padding-left: 12px !important;\n  }\n}\n\n@media (max-width: 760px) {\n  .d-header .title {\n    width: 72px !important;\n    min-width: 72px !important;\n  }\n\n  .desktop-logo-pc {\n    padding-left: 20px !important;\n  }\n\n  .desktop-logo-pc svg {\n    width: 28px !important;\n    max-width: 28px !important;\n    flex-basis: 28px !important;\n  }\n\n  .d-header .desktop-search-input-pc {\n    min-width: 120px !important;\n    width: auto !important;\n    flex: 1 1 auto !important;\n  }\n}\n\n/* 用户头像 */\n.d-header-icons #current-user .avatar {\n  width: 28px !important;\n  height: 28px !important;\n  border-radius: 50% !important;\n  border: 1px solid var(--border-weak) !important;\n}\n\n/* --- sidebar.css --- */\n/* 腾讯文档官方原生 Sidebar 样式 (Fixed 固定左侧) */\n.desktop-layout-sidebar-pc {\n  position: fixed !important;\n  left: 0 !important;\n  top: var(--topbar-height) !important;\n  width: var(--sidebar-width) !important;\n  min-width: var(--sidebar-width) !important;\n  max-width: var(--sidebar-width) !important;\n  background: var(--bg-lv3-medium) !important;\n  border-right: 0 !important;\n  padding: 16px 12px !important;\n  display: flex !important;\n  flex-direction: column !important;\n  height: calc(100vh - var(--topbar-height)) !important;\n  box-sizing: border-box !important;\n  user-select: none !important;\n  z-index: 1000 !important;\n}\n\n/* 顶部操作按钮 */\n.desktop-create-button-pc {\n  background-color: var(--accent-default) !important;\n  color: #ffffff !important;\n  height: 36px !important;\n  border-radius: 4px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 6px !important;\n  font-size: 14px !important;\n  font-weight: 500 !important;\n  cursor: pointer !important;\n  border: none !important;\n  width: 100% !important;\n  margin-bottom: 8px !important;\n  transition: background-color 0.15s ease !important;\n  text-decoration: none !important;\n}\n.desktop-create-button-pc:hover {\n  background-color: var(--accent-hover) !important;\n}\n\n.desktop-upload-button-pc {\n  background-color: #ffffff !important;\n  color: var(--text-ultrastrong) !important;\n  border: 1px solid var(--border-medium) !important;\n  height: 32px !important;\n  border-radius: 4px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 6px !important;\n  font-size: 13px !important;\n  cursor: pointer !important;\n  width: 100% !important;\n  margin-bottom: 16px !important;\n  transition: all 0.15s ease !important;\n  text-decoration: none !important;\n}\n.desktop-upload-button-pc:hover {\n  background-color: var(--feedback-hover) !important;\n  border-color: var(--border-strong) !important;\n}\n\n/* 导航链接 */\n.desktop-sidebar-nav-list {\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 2px !important;\n  flex: 1 !important;\n}\n\n.desktop-node-link-router {\n  display: flex !important;\n  align-items: center !important;\n  gap: 10px !important;\n  padding: 8px 12px !important;\n  border-radius: 4px !important;\n  font-size: 13px !important;\n  color: var(--text-strong) !important;\n  text-decoration: none !important;\n  cursor: pointer !important;\n  transition: all 0.15s ease !important;\n}\n.desktop-node-link-router:hover {\n  background-color: var(--feedback-hover) !important;\n  color: var(--text-ultrastrong) !important;\n}\n.desktop-node-link-router.desktop-link-active {\n  background-color: var(--bg-lv3-medium) !important;\n  color: var(--text-ultrastrong) !important;\n  font-weight: 600 !important;\n}\n\n/* 企业版卡片 */\n.desktop-enterprise-edition-entry {\n  margin-top: auto !important;\n  margin-bottom: 12px !important;\n}\n.desktop-promo-card {\n  background: linear-gradient(180deg, #f0f5ff 0%, #f7f9fc 100%) !important;\n  border: 1px solid #e1eaff !important;\n  border-radius: 6px !important;\n  padding: 12px !important;\n}\n.desktop-promo-header {\n  display: flex !important;\n  align-items: center !important;\n  gap: 6px !important;\n  margin-bottom: 4px !important;\n}\n.desktop-promo-title {\n  font-size: 12px !important;\n  font-weight: 600 !important;\n  color: var(--text-ultrastrong) !important;\n}\n.desktop-promo-subtitle {\n  font-size: 11px !important;\n  color: var(--text-weak) !important;\n  margin-bottom: 8px !important;\n}\n.desktop-promo-button {\n  background: var(--accent-default) !important;\n  color: #fff !important;\n  font-size: 11px !important;\n  padding: 4px 0 !important;\n  text-align: center !important;\n  border-radius: 12px !important;\n  cursor: pointer !important;\n  font-weight: 500 !important;\n}\n\n/* 空间容量进度条 */\n.desktop-storage-panel {\n  padding: 6px 2px !important;\n  font-size: 11px !important;\n  color: var(--text-weak) !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n}\n.desktop-storage-panel a {\n  color: var(--text-weak) !important;\n  text-decoration: none !important;\n}\n.desktop-storage-panel a:hover {\n  color: var(--accent-default) !important;\n}\n\n/* --- topic-list.css --- */\n/* 腾讯文档官方原生列表页样式 (深度适配 Discourse 原生 Table 结构) */\n\n.list-container,\n.topic-list-container,\n#main-container,\n#main-outlet .container.list-container,\n#main-outlet > .ember-view {\n  width: 100% !important;\n  max-width: 100% !important;\n  background: #ffffff !important;\n  border: none !important;\n  box-shadow: none !important;\n  box-sizing: border-box !important;\n  padding: 0 !important;\n  margin: 0 !important;\n}\n\n/* 顶部 Tab 切换头 (最近 / 空间 / 收藏) */\n.desktop-home-page-tab-header-pc {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  border-bottom: 1px solid var(--border-weak) !important;\n  padding-bottom: 8px !important;\n  margin-bottom: 12px !important;\n  width: 100% !important;\n}\n\n.desktop-tab-group {\n  display: flex !important;\n  align-items: center !important;\n  gap: 24px !important;\n}\n\n.desktop-tab-link {\n  font-size: 14px !important;\n  color: var(--text-strong) !important;\n  cursor: pointer !important;\n  padding-bottom: 8px !important;\n  position: relative !important;\n  font-weight: 500 !important;\n  text-decoration: none !important;\n}\n.desktop-tab-link:hover {\n  color: var(--text-ultrastrong) !important;\n}\n.desktop-tab-link.desktop-link-active {\n  color: var(--text-ultrastrong) !important;\n  font-weight: 600 !important;\n}\n.desktop-tab-link.desktop-link-active::after {\n  content: '';\n  position: absolute;\n  bottom: -9px;\n  left: 0;\n  width: 100%;\n  height: 2px;\n  background-color: var(--text-ultrastrong);\n}\n\n.desktop-page-header-extra-pc {\n  display: flex !important;\n  align-items: center !important;\n  gap: 16px !important;\n}\n\n.desktop-header-action-btn {\n  display: flex !important;\n  align-items: center !important;\n  gap: 4px !important;\n  font-size: 12px !important;\n  color: var(--text-strong) !important;\n  cursor: pointer !important;\n  background: transparent !important;\n  border: none !important;\n}\n.desktop-header-action-btn:hover {\n  color: var(--text-ultrastrong) !important;\n}\n\n/* 表格主体 */\n.topic-list {\n  width: 100% !important;\n  border-collapse: collapse !important;\n  table-layout: fixed !important;\n  margin: 0 !important;\n}\n\n/* 表头重构 */\n.topic-list thead {\n  display: table-header-group !important;\n}\n\n.topic-list thead tr {\n  border-bottom: 1px solid var(--border-weak) !important;\n}\n\n.topic-list th {\n  color: var(--text-weak) !important;\n  font-size: 12px !important;\n  font-weight: normal !important;\n  text-align: left !important;\n  padding: 10px 8px !important;\n  background: transparent !important;\n  border: none !important;\n}\n\n/* 列宽分配 (与腾讯文档完全一致) */\n.topic-list th.default,\n.topic-list th.topic-list-data:nth-child(1),\n.topic-list td.main-link {\n  width: 50% !important;\n}\n.topic-list th.posters,\n.topic-list td.posters {\n  width: 13% !important;\n}\n.topic-list th.posts,\n.topic-list td.posts {\n  width: 12% !important;\n}\n.topic-list th.views,\n.topic-list td.views {\n  width: 13% !important;\n}\n.topic-list th.activity,\n.topic-list td.activity {\n  width: 12% !important;\n  text-align: right !important;\n}\n\n/* 行样式 */\n.topic-list-item {\n  border-bottom: 1px solid #f7f8fa !important;\n  /* 行高调为 56px */\n  height: 56px !important;\n  transition: background-color 0.1s ease !important;\n}\n.topic-list-item:hover {\n  background-color: #f7f8fa !important;\n}\n\n.topic-list-item .main-link {\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n}\n\n.topic-list-item .link-top-line {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  width: 100% !important;\n  overflow: hidden !important;\n}\n\n.topic-list-item .title {\n  color: var(--text-ultrastrong) !important;\n  font-size: 14px !important;\n  font-weight: 400 !important;\n  text-decoration: none !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  white-space: nowrap !important;\n  display: inline !important;\n}\n.topic-list-item .title:hover {\n  color: var(--accent-default) !important;\n}\n\n/* 隐藏未读蓝点、标题下方的论坛分类条与摘要 */\n.topic-list-item .link-bottom-line,\n.topic-list-item .topic-statuses,\n.topic-list-item .topic-excerpt,\n.topic-list-item .unread-indicator,\n.topic-list-item .badge-notification.unread-posts {\n  display: none !important;\n}\n\n/* 腾讯文档单选圆圈双保险隐藏（如果有旧DOM） */\n.qqdocs-select-circle {\n  display: none !important;\n}\n\n/* 图标容器 */\n.qqdocs-row-icon-wrap {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  margin-right: 8px !important;\n  flex-shrink: 0 !important;\n  vertical-align: middle !important;\n}\n\n.qqdocs-doc-svg {\n  width: 20px !important;\n  height: 20px !important;\n  min-width: 20px !important;\n  min-height: 20px !important;\n  flex-shrink: 0 !important;\n  display: inline-block !important;\n  vertical-align: middle !important;\n}\n\n/* 所有者列 */\n.topic-list-item .posters {\n  font-size: 12px !important;\n  color: var(--text-strong) !important;\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n}\n.topic-list-item .posters img.avatar,\n.topic-list-item .posters a:not(:first-child) {\n  display: none !important;\n}\n\n/* 位置列 */\n.topic-list-item .posts {\n  font-size: 12px !important;\n  color: var(--text-weak) !important;\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n  text-align: left !important;\n}\n\n/* 最近查看列 */\n.topic-list-item .views {\n  font-size: 12px !important;\n  color: var(--text-weak) !important;\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n  text-align: left !important;\n}\n\n/* 文档大小列 */\n.topic-list-item .activity {\n  font-size: 12px !important;\n  color: var(--text-weak) !important;\n  text-align: right !important;\n  padding: 0 8px !important;\n  vertical-align: middle !important;\n}\n\n/* --- topic-detail.css --- */\n/* 腾讯文档在线 Word 文档阅读视图 (详情页伪装) */\n\n/* 顶部虚拟 Word 在线工具栏 */\n.qqdocs-doc-toolbar {\n  background: #ffffff !important;\n  border-bottom: 1px solid var(--border-medium) !important;\n  padding: 8px 16px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  user-select: none !important;\n  font-size: 12px !important;\n  color: var(--text-strong) !important;\n  margin-bottom: 20px !important;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;\n  border-radius: 4px !important;\n}\n\n.qqdocs-doc-toolbar-left {\n  display: flex !important;\n  align-items: center !important;\n  gap: 16px !important;\n}\n\n.qqdocs-doc-menu {\n  display: flex !important;\n  gap: 14px !important;\n  font-weight: 500 !important;\n  padding-right: 14px !important;\n  border-right: 1px solid var(--border-medium) !important;\n}\n.qqdocs-doc-menu span {\n  cursor: pointer !important;\n}\n.qqdocs-doc-menu span:hover {\n  color: var(--accent-default) !important;\n}\n\n.qqdocs-doc-tools {\n  display: flex !important;\n  align-items: center !important;\n  gap: 6px !important;\n}\n.qqdocs-tool-btn {\n  padding: 3px 8px !important;\n  border-radius: 4px !important;\n  background: var(--bg-lv3-medium) !important;\n  cursor: pointer !important;\n  font-size: 12px !important;\n}\n.qqdocs-tool-btn:hover {\n  background: #e4e7eb !important;\n  color: var(--accent-default) !important;\n}\n\n/* 详情页主容器 */\n.topic-container {\n  max-width: 920px !important;\n  margin: 0 auto !important;\n}\n\n/* 帖子标题栏重构为在线文档标题 */\n#topic-title {\n  padding: 16px 0 12px 0 !important;\n  margin-bottom: 12px !important;\n  border-bottom: 1px solid var(--border-weak) !important;\n}\n\n#topic-title h1 {\n  font-size: 22px !important;\n  font-weight: 600 !important;\n  color: var(--text-ultrastrong) !important;\n  line-height: 1.4 !important;\n  margin: 0 !important;\n}\n\n#topic-title .topic-category,\n#topic-title .badge-wrapper,\n#topic-title .topic-status {\n  display: none !important;\n}\n\n/* 首楼作为文档正文 (白色 A4 纸卡片质感) */\n.topic-post:first-child {\n  background: #ffffff !important;\n  border: 1px solid var(--border-medium) !important;\n  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;\n  border-radius: 6px !important;\n  padding: 24px 32px !important;\n  margin-bottom: 24px !important;\n}\n\n.topic-post:first-child .topic-body {\n  border-top: none !important;\n  padding: 0 !important;\n}\n\n.topic-post:first-child .topic-meta-data {\n  padding-bottom: 14px !important;\n  margin-bottom: 18px !important;\n  border-bottom: 1px dashed var(--border-medium) !important;\n}\n\n/* 正文排版 */\n.cooked {\n  font-size: 14px !important;\n  line-height: 1.8 !important;\n  color: #1f2329 !important;\n}\n\n.cooked p {\n  margin-bottom: 12px !important;\n}\n\n/* 隐藏正文下方论坛的点赞头像群弹幕 */\n.post-retort__reactions,\n.who-liked,\n.topic-post:first-child .post-controls .reactions,\n.topic-post:first-child .post-controls .show-more-actions {\n  display: none !important;\n}\n\n/* 楼下回复 (伪装为“协同批注 / 评论讨论”) */\n.topic-post:not(:first-child) {\n  margin-top: 16px !important;\n  background: #fafbfc !important;\n  border: 1px solid var(--border-medium) !important;\n  border-radius: 6px !important;\n  padding: 14px 20px !important;\n  position: relative !important;\n}\n\n.topic-post:not(:first-child)::before {\n  content: \"💬 协同批注\";\n  position: absolute;\n  top: -10px;\n  right: 16px;\n  background: #eef4ff;\n  color: var(--accent-default);\n  font-size: 11px;\n  padding: 1px 8px;\n  border-radius: 10px;\n  font-weight: 500;\n  border: 1px solid rgba(30, 111, 255, 0.2);\n}\n\n/* 操作按钮重构 */\nnav.post-controls .actions button {\n  background: transparent !important;\n  color: var(--text-medium) !important;\n  border-radius: 4px !important;\n  padding: 4px 8px !important;\n  font-size: 12px !important;\n}\nnav.post-controls .actions button:hover {\n  background: var(--bg-lv3-medium) !important;\n  color: var(--accent-default) !important;\n}\n\n/* --- composer.css --- */\n/* 腾讯文档 - 发帖与回复弹窗伪装 */\n#reply-control {\n  background: var(--qqdocs-bg-card) !important;\n  border-top: 1px solid var(--qqdocs-border-color) !important;\n  box-shadow: var(--qqdocs-shadow-lg) !important;\n  border-radius: var(--qqdocs-radius-lg) var(--qqdocs-radius-lg) 0 0 !important;\n}\n\n#reply-control .composer-fields {\n  border-bottom: 1px solid var(--qqdocs-border-color) !important;\n  padding: 8px 16px !important;\n}\n\n#reply-control .title-input input {\n  border: 1px solid var(--qqdocs-border-color) !important;\n  border-radius: var(--qqdocs-radius-md) !important;\n  padding: 8px 12px !important;\n  font-size: 14px !important;\n}\n#reply-control .title-input input:focus {\n  border-color: var(--qqdocs-brand-color) !important;\n  box-shadow: 0 0 0 2px var(--qqdocs-brand-focus) !important;\n}\n\n/* 编辑器工具栏 */\n.d-editor .d-editor-button-bar {\n  background: var(--qqdocs-bg-hover) !important;\n  border-bottom: 1px solid var(--qqdocs-border-color) !important;\n  padding: 4px 8px !important;\n  border-radius: var(--qqdocs-radius-md) var(--qqdocs-radius-md) 0 0 !important;\n}\n\n.d-editor .d-editor-button-bar button {\n  color: var(--qqdocs-text-secondary) !important;\n  border-radius: var(--qqdocs-radius-sm) !important;\n}\n.d-editor .d-editor-button-bar button:hover {\n  background: #e2e5eb !important;\n  color: var(--qqdocs-brand-color) !important;\n}\n\n/* 文本输入框 */\n.d-editor-textarea-wrapper {\n  background: #ffffff !important;\n  border: 1px solid var(--qqdocs-border-color) !important;\n  border-radius: 0 0 var(--qqdocs-radius-md) var(--qqdocs-radius-md) !important;\n}\n\n.d-editor-textarea-wrapper textarea {\n  font-family: var(--qqdocs-font-family) !important;\n  font-size: 14px !important;\n  line-height: 1.6 !important;\n  padding: 12px !important;\n}\n\n/* 提交按钮重构 (腾讯蓝主按钮) */\n#reply-control .submit-panel .btn-primary,\n.btn-primary.create {\n  background-color: var(--qqdocs-brand-color) !important;\n  color: #ffffff !important;\n  border: none !important;\n  border-radius: var(--qqdocs-radius-md) !important;\n  padding: 6px 16px !important;\n  font-size: 13px !important;\n  font-weight: 500 !important;\n  box-shadow: 0 2px 4px rgba(0, 82, 217, 0.2) !important;\n  transition: all 0.15s ease !important;\n}\n\n#reply-control .submit-panel .btn-primary:hover,\n.btn-primary.create:hover {\n  background-color: var(--qqdocs-brand-hover) !important;\n  box-shadow: 0 4px 8px rgba(0, 82, 217, 0.3) !important;\n}\n\n#reply-control .submit-panel .btn-flat {\n  color: var(--qqdocs-text-secondary) !important;\n  border-radius: var(--qqdocs-radius-md) !important;\n}\n\n/* --- modal-menu.css --- */\n/* 腾讯文档 - 菜单、浮层与弹窗样式 */\n\n/* 下拉菜单面板 */\n.menu-panel,\n.menu-panel.drop-down,\n.user-menu,\n.search-menu {\n  background: var(--qqdocs-bg-card) !important;\n  border: 1px solid var(--qqdocs-border-color) !important;\n  border-radius: var(--qqdocs-radius-lg) !important;\n  box-shadow: var(--qqdocs-shadow-popover) !important;\n  padding: 8px !important;\n}\n\n/* 菜单项 */\n.menu-panel li a,\n.user-menu .panel-body-contents a,\n.search-menu .results a {\n  border-radius: var(--qqdocs-radius-md) !important;\n  color: var(--qqdocs-text-primary) !important;\n  padding: 8px 12px !important;\n  font-size: 13px !important;\n  transition: background 0.15s ease !important;\n}\n\n.menu-panel li a:hover,\n.user-menu .panel-body-contents a:hover,\n.search-menu .results a:hover {\n  background-color: var(--qqdocs-bg-hover) !important;\n  color: var(--qqdocs-brand-color) !important;\n}\n\n/* 弹窗模态框 (Discourse Modal) */\n.modal-inner-container {\n  background: var(--qqdocs-bg-card) !important;\n  border-radius: var(--qqdocs-radius-lg) !important;\n  box-shadow: var(--qqdocs-shadow-lg) !important;\n  border: 1px solid var(--qqdocs-border-color) !important;\n  overflow: hidden !important;\n}\n\n.modal-header {\n  border-bottom: 1px solid var(--qqdocs-border-color) !important;\n  padding: 14px 20px !important;\n}\n\n.modal-header h3 {\n  font-size: 16px !important;\n  font-weight: 600 !important;\n  color: var(--qqdocs-text-primary) !important;\n}\n\n.modal-footer {\n  border-top: 1px solid var(--qqdocs-border-color) !important;\n  padding: 12px 20px !important;\n}\n\n/* 按钮通用 */\n.btn-default {\n  background: var(--qqdocs-bg-hover) !important;\n  border: 1px solid var(--qqdocs-border-color) !important;\n  color: var(--qqdocs-text-primary) !important;\n  border-radius: var(--qqdocs-radius-md) !important;\n}\n.btn-default:hover {\n  background: #e8ebf0 !important;\n}\n";
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
  // 腾讯文档官方原型对齐的伪装核心引擎
const DisguiseEngine = (function () {
  let isDisguiseEnabled = true;
  let customStyleElement = null;

  // 内联高清矢量图标 (100% 绝不丢失)
  const SVG_ICONS = {
    sheet: `<svg class="qqdocs-doc-svg" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="3" fill="#00A870"/><path d="M5 6.5h10M5 10h10M5 13.5h10M9 5v10" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    doc: `<svg class="qqdocs-doc-svg" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="3" fill="#0052D9"/><path d="M5 6h10M5 10h10M5 14h6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    slide: `<svg class="qqdocs-doc-svg" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="3" fill="#ED7B2F"/><rect x="5" y="6" width="10" height="8" rx="1" fill="#fff"/><circle cx="10" cy="10" r="1.5" fill="#ED7B2F"/></svg>`,
    star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB800"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  };

  // 1. Favicon 伪装
  function applyFavicon() {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = 'https://docs.gtimg.com/desktop/favicon2.ico';
  }

  // 2. Title 动态劫持
  function hijackTitle() {
    const originalTitleDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'title') ||
      Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'title');

    function getFormattedTitle(rawTitle) {
      if (!isDisguiseEnabled) return rawTitle;
      if (!rawTitle) return '腾讯文档';

      let clean = rawTitle.replace(/\s*-\s*LINUX DO.*$/i, '').trim();
      clean = clean.replace(/^\(\d+\)\s*/, '');

      if (!clean || clean === 'LINUX DO' || clean.includes('新的理想型社区')) {
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
    if (!isDisguiseEnabled) return;
    const headerTitle = document.querySelector('.d-header .title');
    if (headerTitle && !headerTitle.querySelector('.desktop-top-bar-left')) {
      const brand = document.createElement('div');
      brand.className = 'desktop-top-bar-left';
      brand.innerHTML = `
        <a title="腾讯文档" href="/" class="desktop-logo-pc">
          <svg width="180" height="24" viewBox="0 0 180 24" fill="none">
            <path fill="#2A65F5" d="M21.93 0H4.523a.495.495 0 0 0-.487.408L.008 23.19a.494.494 0 0 0 .487.579h9.596l.76-.235h4.457l.623.235h7.392c.24 0 .445-.172.487-.408l3.313-18.74L21.93 0Z"/>
            <path fill="#00DCFF" d="M21.703 4.622h5.42L21.93 0l-.715 4.043c-.053.302.18.58.488.58"/>
            <path fill="#FFF" d="m14.125.976-.974 5.525-9.497.016 4.126 4.452h4.579L10.091 23.77h5.84l2.271-12.801h6.894l.24-.005z"/>
            <path fill="#1F2329" class="desktop-logo-text" d="M66.707 4.107v14.744h1.357v1.54H65.18v-8.254h-3.653v8.434H60v-8.434h-3.311v-1.526h3.31V5.648h-2.888v-1.54h9.596Zm24.463-.594v3.268h2.19v1.4h-2.19v2.262h.811l.024.056 1.395 3.297a.088.088 0 0 1-.044.117l-.033.007h-1.381l-.772-1.83v8.462h-1.528v-7.504c-.577 1.623-1.495 3.28-2.553 4.734a.086.086 0 0 1-.148-.012l-.008-.036v-2.482c1.4-2.314 2.272-4.422 2.582-6.651l.052-.42H87.35v-1.4h2.292V3.513h1.528ZM55.503 8.55v9.101l2.576-1.967a.085.085 0 0 1 .128.025l.01.04v1.586l-4.214 3.218-.838-1.116.702-.536.119-.09v-8.72h-2.051V8.548h3.568Zm22.863-4.996v2.605h7.165v1.563h-2.44c-.665 3.138-2.104 5.858-4.28 8.02 1.719 1.313 3.807 2.311 6.228 2.957l.489.125.003.003-.003.002v1.634l-.007.034a.087.087 0 0 1-.046.046l-.034.007-.02-.002c-2.959-.681-5.504-1.83-7.596-3.425a11.27 11.27 0 0 1-.304-.233c-.136.108-.27.21-.404.308-2.074 1.556-4.587 2.68-7.5 3.35a.086.086 0 0 1-.099-.051l-.007-.034v-1.639c2.63-.64 4.885-1.682 6.719-3.084a15.24 15.24 0 0 1-2.997-4.197 16.548 16.548 0 0 1-1.169-3.319l-.113-.502h-2.44V6.158h7.163V3.553h1.692Zm-38.72.59V20.49h-2.47l-.381-1.26c-.029-.077-.001-.12.046-.135l.038-.005h1.382v-4.353h-1.946c-.008 1.327-.062 3.126-.451 5.283l-.083.437h-1.393c-.082 0-.13-.043-.085-.201.392-1.598.596-3.389.622-5.69l.002-.5V4.141h4.72Zm6.042-.714c.068 0 .125.021.11.126-.103.754-.214 1.44-.338 2.07l-.077.37h1.671l.548-1.88h1.183c.06 0 .108.036.081.13l-.464 1.593-.045.157h1.36v1.26h-4.645c-.101.35-.21.682-.326.995l-.12.307h5.432v1.26h-1.864c.834 1.193 1.72 1.782 2.137 2.041l.072.045v1.442c0 .072-.056.15-.282.02a10.118 10.118 0 0 1-1.618-1.145l-.277-.25-.056 2.45h1.724v6.067h-4.406l-.38-1.259c-.029-.077 0-.121.046-.135l.037-.006h3.176V15.68h-7.045a.082.082 0 0 1-.079-.051l-.006-.034.131-2.389h1.306c.038 0 .067.021.079.052l.006.034-.062 1.128h4.083l.044-1.887h-5.172c-.445.331-.883.597-1.294.832-.198.113-.266.068-.28.007l-.003-.027v-1.442a7.103 7.103 0 0 0 2.055-1.869l.157-.217h-2.199v-1.26h2.927c.158-.348.309-.717.427-1.055l.082-.247h-3.095v-1.26h1.326l-.51-1.75c-.022-.075.005-.113.047-.125l.034-.005h1.182l.548 1.88h.82c.153-.646.28-1.33.396-2.096l.07-.47h1.346Zm53.205.084v6.56h3.838v10.024H93.22v-1.484h7.846v-2.898H93.83V14.23h7.235v-2.675h-7.651v-1.484h3.812V3.513h1.667ZM47.658 16.656v1.4h-7.572v-1.4h7.572Zm33.698-8.935h-7.67c.517 2.184 1.461 4.146 2.793 5.772.327.395.673.776 1.04 1.133.14-.135.278-.275.416-.42 1.667-1.767 2.826-3.973 3.42-6.485ZM38.26 10.126h-1.945v3.35h1.945v-3.35Zm8.233-.309H44.02c-.254.453-.524.85-.802 1.202l-.21.254h4.545c-.37-.423-.728-.904-1.06-1.456ZM65.18 5.648h-3.653v4.963h3.653V5.648Zm-26.92-.106h-1.944v3.324h1.945V5.542Zm56.723-.78 1.259 3.83a.088.088 0 0 1-.05.107l-.032.007h-1.636l-1.258-3.827a.09.09 0 0 1 .05-.11l.034-.007h1.633Zm7.786 0c.048 0 .085.038.088.083l-.004.034-1.258 3.827h-1.636a.087.087 0 0 1-.086-.081l.004-.034 1.259-3.829h1.633Zm-48.947-.965 2.106 3.242c.026.04.012.1-.032.123l-.039.008h-1.67L52.08 3.924c-.028-.043-.004-.098.039-.119l.035-.008h1.67Z"/>
          </svg>
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8f959e" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
            <span>会员中心</span>
          </button>
        </div>
        <button class="desktop-top-bar-button" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>· 2</span>
        </button>
        <button class="desktop-top-bar-button" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/></svg>
          <span>模板</span>
        </button>
        <button class="desktop-top-bar-button" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        </button>
        <button class="desktop-top-bar-button" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="#E8F3FF"/><path d="M12 7l1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5L12 7z" fill="#0052D9"/></svg>
        </button>
        <button class="desktop-top-bar-button desktop-notification-panel-button" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span class="desktop-notification-badge">18</span>
        </button>
      `;
      headerIcons.insertBefore(rightWrap, headerIcons.firstChild);
    }
  }

  // 4. 左侧 Sidebar (Fixed 定位挂载至 body)
  function renderSidebar() {
    if (!isDisguiseEnabled) return;
    if (!document.querySelector('.desktop-layout-sidebar-pc')) {
      const sidebar = document.createElement('aside');
      sidebar.className = 'desktop-layout-sidebar-pc';
      sidebar.innerHTML = `
        <button class="dui-button desktop-create-button-pc" onclick="location.href='/new-topic'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>新建</span>
        </button>
        <button class="desktop-upload-button-pc">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          <span>上传</span>
        </button>

        <nav class="desktop-sidebar-nav-list">
          <a class="desktop-node-link-router desktop-link-active" href="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8z"/></svg>
            <span>首页</span>
          </a>
          <a class="desktop-node-link-router" href="/latest">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
            <span>云盘</span>
          </a>
          <a class="desktop-node-link-router" href="/top">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/></svg>
            <span>AI 助手</span>
          </a>
          <a class="desktop-node-link-router" href="/categories">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span>空间</span>
          </a>
          <a class="desktop-node-link-router" href="/my/activity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            <span>回收站</span>
          </a>
        </nav>

        <div class="desktop-enterprise-edition-entry">
          <div class="desktop-promo-card">
            <div class="desktop-promo-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0052D9"><rect width="24" height="24" rx="4" fill="#0052D9"/></svg>
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
    if (!isDisguiseEnabled) return;

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>显示</span>
          </button>
          <button type="button" class="desktop-header-action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>筛选 ▾</span>
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
        let iconSvg = SVG_ICONS.sheet;
        if (idx % 4 === 1) iconSvg = SVG_ICONS.doc;
        else if (idx % 4 === 2) iconSvg = SVG_ICONS.slide;

        const iconContainer = document.createElement('span');
        iconContainer.className = 'qqdocs-row-icon-wrap';
        iconContainer.innerHTML = `
          ${iconSvg}
        `;

        titleLink.parentNode.insertBefore(iconContainer, titleLink);

        if (!titleLink.querySelector('svg') && (row.classList.contains('visited') || idx % 4 === 0)) {
          const star = document.createElement('span');
          star.style.marginLeft = '6px';
          star.innerHTML = SVG_ICONS.star;
          titleLink.appendChild(star);
        }
      }

      // 2. 所有者列 (提取作者用户名)
      const posterCol = row.querySelector('.posters');
      if (posterCol) {
        const firstUser = posterCol.querySelector('a');
        const username = firstUser ? (firstUser.getAttribute('data-user-card') || firstUser.title || '李媛婷') : '李媛婷';
        posterCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px;">${username}</span>`;
      }

      // 3. 位置列 (原 posts 列重塑为位置)
      const postsCol = row.querySelector('.posts');
      if (postsCol) {
        postsCol.innerHTML = `<span style="color: var(--text-weak); font-size: 12px;">${catName}</span>`;
      }

      // 4. 最近查看列 (原 views 列重塑为时间)
      const viewsCol = row.querySelector('.views');
      if (viewsCol) {
        const times = ['16:11', '15:55', '昨天 16:45', '08-21 12:05', '08-19 16:12', '08-17 09:12', '08-10 09:39', '08-06 14:09'];
        viewsCol.innerHTML = `<span style="color: var(--text-weak); font-size: 12px;">${times[idx % times.length]}</span>`;
      }

      // 5. 文档大小列 (原 activity 列重塑为仿真大小)
      const actCol = row.querySelector('.activity');
      if (actCol) {
        const sizes = ['928.59 KB', '117.26 KB', '343.27 KB', '621.74 KB', '495.62 KB', '551.69 KB', '95.69 MB', '3.91 MB'];
        actCol.innerHTML = `<span style="color: var(--text-weak); font-size: 12px; font-weight: normal;">${sizes[idx % sizes.length]}</span>`;
      }
    });
  }

  // 6. 详情页 Word 在线工具栏与伪装
  function renderTopicDetail() {
    if (!isDisguiseEnabled) return;
    const postStream = document.querySelector('.post-stream');
    if (postStream && !document.querySelector('.qqdocs-doc-toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.className = 'qqdocs-doc-toolbar';
      toolbar.innerHTML = `
        <div class="qqdocs-doc-toolbar-left">
          <div class="qqdocs-doc-menu">
            <span>文件</span>
            <span>编辑</span>
            <span>插入</span>
            <span>格式</span>
            <span>协同 (3 人在线)</span>
          </div>
          <div class="qqdocs-doc-tools">
            <span class="qqdocs-tool-btn">↩ 撤销</span>
            <span class="qqdocs-tool-btn">↪ 重做</span>
            <span class="qqdocs-tool-btn"><b>B</b></span>
            <span class="qqdocs-tool-btn"><i>I</i></span>
            <span class="qqdocs-tool-btn"><u>U</u></span>
            <span class="qqdocs-tool-btn">💬 添加批注</span>
          </div>
        </div>
        <div style="font-size: 12px; color: var(--text-weak);">已自动保存至腾讯文档云端</div>
      `;
      postStream.parentNode.insertBefore(toolbar, postStream);
    }
  }

  // 7. 快捷切换悬浮徽标 (Alt + Q)
  function mountToggleBadge() {
    if (document.querySelector('.qqdocs-toggle-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'qqdocs-toggle-badge';
    badge.title = '快捷键 Alt + Q 切换伪装模式';
    badge.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="9" height="9" rx="2" fill="#0052D9"/><rect x="13" y="2" width="9" height="9" rx="2" fill="#00A870"/><rect x="2" y="13" width="9" height="9" rx="2" fill="#ED7B2F"/><rect x="13" y="13" width="9" height="9" rx="2" fill="#8A38F5"/></svg>
      <span class="qqdocs-badge-text">${isDisguiseEnabled ? '腾讯文档模式 (Alt+Q)' : '原版模式 (Alt+Q)'}</span>
    `;

    badge.addEventListener('click', toggleDisguise);
    document.body.appendChild(badge);

    window.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        toggleDisguise();
      }
    });
  }

  function toggleDisguise() {
    isDisguiseEnabled = !isDisguiseEnabled;
    const badgeText = document.querySelector('.qqdocs-badge-text');
    if (badgeText) {
      badgeText.textContent = isDisguiseEnabled ? '腾讯文档模式 (Alt+Q)' : '原版模式 (Alt+Q)';
    }

    if (customStyleElement) {
      customStyleElement.disabled = !isDisguiseEnabled;
    }

    const sidebar = document.querySelector('.desktop-layout-sidebar-pc');
    if (sidebar) sidebar.style.display = isDisguiseEnabled ? 'flex' : 'none';

    const tabs = document.querySelector('.desktop-home-page-tab-header-pc');
    if (tabs) tabs.style.display = isDisguiseEnabled ? 'flex' : 'none';

    const searchWrap = document.querySelector('.desktop-search-input-pc');
    if (searchWrap) searchWrap.style.display = isDisguiseEnabled ? 'flex' : 'none';

    const docToolbar = document.querySelector('.qqdocs-doc-toolbar');
    if (docToolbar) docToolbar.style.display = isDisguiseEnabled ? 'flex' : 'none';

    if (isDisguiseEnabled) {
      applyFavicon();
      document.title = document.title;
    } else {
      document.title = 'LINUX DO';
    }
  }

  function init(styleEl) {
    customStyleElement = styleEl;
    applyFavicon();
    hijackTitle();
    renderHeader();
    renderSidebar();
    renderTopicList();
    renderTopicDetail();
    mountToggleBadge();

    const observer = new MutationObserver(() => {
      renderHeader();
      renderSidebar();
      renderTopicList();
      renderTopicDetail();
      mountToggleBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  return {
    init: init,
    toggle: toggleDisguise
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DisguiseEngine };
}


  // DOM 就绪时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DisguiseEngine.init(styleEl));
  } else {
    DisguiseEngine.init(styleEl);
  }
})();
