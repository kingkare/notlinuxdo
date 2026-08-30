# Not Linux Do - 多主题与伪装油猴脚本合集

本项目旨在为 [LINUX DO 社区](https://linux.do/) 提供多种不同风格的深度伪装与界面美化油猴脚本（Tampermonkey Userscripts）。

---

## 🎨 主题列表

| 主题名称 | 目录 | 产物文件 | 描述 |
| :--- | :--- | :--- | :--- |
| **腾讯文档主题** | [`./docs.qq.theme`](./docs.qq.theme) | [`docs.qq.theme.user.js`](./docs.qq.theme/docs.qq.theme.user.js) | 伪装为腾讯文档桌面端/工作台与在线 Word 文档风格 |
| **GitHub 主题** | [`./github.theme`](./github.theme) | [`github.theme.user.js`](./github.theme/github.theme.user.js) | 首页伪装为仓库搜索页，帖子伪装为仓库 README 页面 |

---

## 🛠️ 构建与开发

### 构建指定主题
```bash
# 构建腾讯文档主题
npm run build:docs.qq
# 构建 GitHub 主题
npm run build:github
# 或直接进入子目录
cd docs.qq.theme && node build.js
```

### 构建全部主题
```bash
npm run build:all
```

---

## 🚀 安装方法
1. 在浏览器安装 [Tampermonkey (篡改猴)](https://www.tampermonkey.net/) 插件。
2. 打开对应主题目录下的 `*.user.js`（例如 [`docs.qq.theme/docs.qq.theme.user.js`](./docs.qq.theme/docs.qq.theme.user.js)），复制并添加到油猴脚本中即可。
