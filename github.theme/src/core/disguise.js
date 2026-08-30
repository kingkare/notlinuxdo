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
