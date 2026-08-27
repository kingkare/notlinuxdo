// 腾讯文档官方原型对齐的伪装核心引擎
const DisguiseEngine = (function () {
  let isDisguiseEnabled = true;
  let customStyleElement = null;

  // 1. Favicon 伪装
  function applyFavicon() {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = ICONS.favicon;
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
    if (!isDisguiseEnabled) return;
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

  // 6. 详情页腾讯文档编辑器外壳（全部为无交互的视觉装饰）
  function renderTopicDetail() {
    const postStream = document.querySelector('.post-stream');
    const oldToolbar = document.querySelector('.qqdocs-doc-toolbar');
    if (oldToolbar) oldToolbar.remove();

    if (!postStream || !isDisguiseEnabled) {
      document.querySelector('.qqdocs-editor-shell')?.remove();
      return;
    }

    const rawTitle = document.querySelector('#topic-title h1')?.textContent || '在线文档';
    const topicTitle = rawTitle.replace(/\s+/g, ' ').trim();

    // Remove the outline shell left by pre-update userscript versions.
    document.querySelectorAll('[class*="outline"]').forEach((node) => {
      const className = typeof node.className === 'string' ? node.className : '';
      if (className.indexOf('qqdocs-') !== -1 && className.toLowerCase().indexOf('outline') !== -1) node.remove();
    });

    let shell = document.querySelector('.qqdocs-editor-shell');
    // Rebuild a shell injected by an older userscript version during hot update.
    if (shell && !shell.querySelector('.qqdocs-editor-divider')) {
      shell.remove();
      shell = null;
    }
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'qqdocs-editor-shell';
      shell.setAttribute('aria-hidden', 'true');
      shell.innerHTML = `
        <div class="qqdocs-editor-titlebar">
          <div class="qqdocs-editor-title-left">
            <span class="qqdocs-editor-home">${renderTdocsChromeIcon('home', 28)}</span>
            <span class="qqdocs-editor-plus">${renderTdocsChromeIcon('plus', 24)}</span>
            <span class="qqdocs-editor-divider"></span>
            <strong class="qqdocs-editor-title-text"></strong>
            <span class="qqdocs-editor-readonly"><span>只能查看</span>${renderTdocsChromeIcon('arrow', 6)}</span>
            <span class="qqdocs-editor-star">${renderTdocsChromeIcon('star', 16)}</span>
            <span class="qqdocs-editor-folder">${renderTdocsChromeIcon('folder', 16)}</span>
          </div>
          <div class="qqdocs-editor-title-actions">
            <span class="qqdocs-editor-action">${renderTdocsChromeIcon('more', 24)}</span>
            <span class="qqdocs-editor-action">${renderTdocsChromeIcon('ai', 24)}</span>
            <span class="qqdocs-editor-action qqdocs-editor-presentation">${renderTdocsChromeIcon('presentation', 24)}</span>
            <span class="qqdocs-editor-collaborator">${renderTdocsChromeIcon('collaborator', 24)}<sup>3</sup></span>
            <span class="qqdocs-editor-share">分享</span>
            <span class="qqdocs-editor-account">${renderTdocsChromeIcon('collaborator', 24)}${renderTdocsChromeIcon('wechat', 14)}</span>
          </div>
        </div>
        <div class="qqdocs-editor-tabs">
          <span class="is-active">开始</span><span>插入</span><span>页面</span><span>引用</span>
          <span>审阅</span><span>视图</span><span>效率工具</span><span>公文助手</span><span>会员专享</span>
        </div>
        <div class="qqdocs-editor-ribbon">
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
  }

  // 详情页样式必须有明确的页面作用域，避免列表页或弹窗被误伤。
  function syncTopicDetailScope() {
    if (!document.body) return;
    document.body.classList.toggle('qqdocs-topic-detail', Boolean(document.querySelector('.post-stream')));
  }

  // 7. 快捷切换悬浮徽标 (Alt + Q)
  function mountToggleBadge() {
    if (document.querySelector('.qqdocs-toggle-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'qqdocs-toggle-badge';
    badge.title = '快捷键 Alt + Q 切换伪装模式';
    badge.innerHTML = `
      ${renderOfficialIcon('toolkit', 14)}
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

    const editorShell = document.querySelector('.qqdocs-editor-shell');
    if (editorShell) editorShell.style.display = isDisguiseEnabled ? '' : 'none';

    if (isDisguiseEnabled) {
      applyFavicon();
      document.title = document.title;
      renderTopicDetail();
    } else {
      document.title = 'LINUX DO';
    }
  }

  function init(styleEl) {
    customStyleElement = styleEl;
    syncTopicDetailScope();
    applyFavicon();
    hijackTitle();
    renderHeader();
    renderSidebar();
    renderTopicList();
    renderTopicDetail();
    mountToggleBadge();

    const observer = new MutationObserver(() => {
      syncTopicDetailScope();
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
