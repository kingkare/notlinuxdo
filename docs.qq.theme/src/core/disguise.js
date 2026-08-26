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
