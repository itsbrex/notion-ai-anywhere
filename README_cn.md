# Notion AI Anywhere

[Notion AI Anywhere](https://github.com/microvoid/notion-ai-anywhere) 是一个让你浏览任何网页时都可以使用 Notion AI 能力的插件。

## Overview

ChatGPT 已经成为 2023 年主流词汇，Notion 也很快的推出的 Notion AI 能力。虽然不尽完美，但依然让人眼前一亮。更多的用户愿意为 AI 付费，去提升自己的工作、写作、记录的效率。如果你已经提升成为 Notion AI Plus 会员，那么现在你可以使用此插件，将 Notion AI 能力带到其他网站，比如谷歌文档、飞书、石墨、腾讯文档等。再比如浏览某些网页时使用 AI 分析一些内容等等。

## Usage

1. 下载最新的 [release](https://github.com/microvoid/notion-ai-anywhere/releases) 版本 zip 包。
2. 打开 Chrome 扩展程序页面，并打开开发者模式。
   ![image](./assets/c-extension.png){width="800px"}
3. 拖拽 zip 至插件列表。
   ![image](./assets/c-extension2.png{width="800px"}
4. 点击插件打开设置弹窗，如果你没有登录 Notion 会提示你去登录 Notion，然后再打开设置弹窗，选择一个 Notion 空间 （最好选择一个办理了 Notion AI Plus 的空间，否则使用次数受限）
   ![image](./assets/c-popup.png){width="800px"}
5. 现在，你可以刷新任何浏览器的页面，并选中一段内容，会有一个按钮（设置中可以关闭这个按钮，关闭后选择内容使用 cmd+k 唤起 AI 弹窗），点击就可以正常使用了。
   ![image](./assets/c-button.png){width="800px"}
   ![image](./assets/display1.gif){width="800px"}
6. 你可以设置暗黑模式、切换语言、关闭烦人的选区 Icon（使用 cmd + k）
   ![image](./assets/display2.gif){width="800px"}

# TODO

- [ ] 加入 ChatGPT3.5 直接调用能力
- [ ] 加入 OCR 截图识别能力 （已经在开发中了）

## Contribution

Notion AI Anywhere 是一个开源项目，欢迎社区的贡献。请随时在上提交问题、功能 PR [GitHub repository](https://github.com/microvoid/notion-ai-anywhere).