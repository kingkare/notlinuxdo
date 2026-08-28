# LINUX DO 伪装腾讯文档主题 (Docs QQ Theme) 油猴脚本

一款专为 [LINUX DO 社区](https://linux.do/) 打造的深度界面伪装与样式覆盖油猴插件，将论坛界面全方位伪装为 [腾讯文档桌面端 / 工作台](https://docs.qq.com/desktop) 风格。

---

## ✨ 核心特性

1. **Favicon 与 Title 深度劫持**：
   - 网页标签页图标替换为腾讯文档专属 Logo。
   - 网页标题动态转为 `腾讯文档 - 全部文档` / `【文档】{帖子标题} - 腾讯文档`，隐藏论坛痕迹。
2. **腾讯文档工作台布局**：
   - 顶部导航栏：全局搜索框、企业版徽标、桌面端入口、消息与头像重构。
   - 侧边栏/分类栏：“+ 新建”、全部文档、与我共享、项目文件夹。
3. **文档列表视图 (Topic List)**：
   - 论坛帖子转换为 Word / Excel / PPT / 思维导图文档行。
   - 帖子作者变为“创建者/所有者”，回复数变为“协同人数/版本数”。
4. **在线 Word 文档阅读视图 (Topic Detail)**：
   - 帖子首楼变为标准 A4 白色文档纸张，上方配备虚拟 Word 工具栏。
   - 后续回复转换为“协同批注 / 评论讨论”卡片。
5. **发帖与编辑器模态化 (Composer)**：
   - 底部回复框伪装为“批注输入 / 文档内容编辑”界面。

---

## 🚀 安装使用方法

### 方式一：直接安装到油猴扩展（推荐）
1. 在浏览器安装 [Tampermonkey (篡改猴)](https://www.tampermonkey.net/) 或 [ScriptCat (脚本猫)](https://scriptcat.org/)。
2. 打开油猴扩展管理面板，点击 **添加新脚本**。
3. 复制本目录下的 [`docs.qq.theme.user.js`](file:///d:/notlinuxdo/docs.qq.theme/docs.qq.theme.user.js) 文件全部内容，粘贴并保存。
4. 打开 [https://linux.do/](https://linux.do/)，即可查看全新的腾讯文档工作台风格！

如需临时关闭主题，请在油猴扩展面板中禁用该脚本。

### 方式二：二次开发构建
1. 修改 `src/styles/` 下的 CSS 或 `src/core/` 下的 JS 逻辑。
2. 在当前 `docs.qq.theme/` 目录下执行打包：
   ```bash
   node build.js
   ```
3. 构建生成的文件位于 `dist/docs.qq.theme.user.js` 与 `docs.qq.theme.user.js`。
