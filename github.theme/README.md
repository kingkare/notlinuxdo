# LINUX DO 伪装 GitHub 主题

把 LINUX DO 的主题列表伪装为 GitHub 仓库搜索结果，把帖子详情伪装为 GitHub 仓库的 README 页面。

## 特性

- 按当前 GitHub 的浅色全局导航、仓库搜索结果页和仓库 README 页进行布局复刻。
- 每个主题按 topic ID 稳定映射到一个随机 `owner/repository` 名称。
- 列表保留真实帖子标题与链接，并使用 20×20 GitHub identicon 头像。
- 界面图标来自官方 `@primer/octicons` 包，构建时直接嵌入用户脚本，不依赖外部图标请求。
- 帖子首楼展示为仓库 `README.md`，后续回复展示为 Discussions 评论卡片。
- 帖子 Emoji 默认替换成 `[emoji:名称]` 标签，悬停时显示原 Emoji。
- 帖子图片默认隐藏，双击占位区域显示图片，再双击图片可重新隐藏。
- 支持 Discourse 的客户端路由和无限滚动，新加载内容会自动套用主题。
- 响应式布局，不影响搜索、发帖、回复及帖子链接的原有行为。

## 构建

```bash
npm run build:github
```

构建后将 `github.theme.user.js` 的内容复制到 Tampermonkey 或 ScriptCat 中保存即可。
