<!-- submission-status.md -->
# 审核更新状态

2026-10-27：旧 1.1.0 的审核轮次已撤回，保持同版本重新上传 menu-v4 材料为 Draft。后台当前是 **Not submitted / Not published**。六项政策声明未勾选，最终 Submit 未点击，由所有者本人决定。

| 检查 | 实际结果 |
| --- | --- |
| 源码版本 | 本地与 GitHub 均为 `333c7f6`，本轮未改 app/ |
| 应用现有测试 | 6/6 通过 |
| 逐条 ChatGPT 实测 | 5 正向 + 3 负向，6 符合、2 不完全符合；见 [test-results.md](test-results.md) |
| 包结构 | plugin.json、mcp.json、assets；MCP-only，不含旧文字技能 |
| 截图 | 三张真实 menu-v4 PNG，均 706 × 800 |
| 视频 | 104.53 秒 H.264，真实 ChatGPT 截图序列、30 段 |
| GitHub 下载 | MP4 与 ZIP 匿名 HTTP 200，均与本地 SHA256 一致 |
| 元数据校验 | `No findings with the plugin’s metadata and skills` |
| MCP 域名 | `Domain verified`；No authentication |
| 最新 MCP 扫描 | 识别 `ui://menu-helper/menu-v4.html`；含 cuisine、intro、lang 及 extras |
| 工具标注 | readOnlyHint=true / destructiveHint=false / openWorldHint=false |
| MCP Blocking 筛选 | 无条目 |
| 最终提交表单 | 标明 `Non-blocking findings`，仍需人工审查 |

MCP 提示原文：

> This new tool definition needs further review before it can be published.

> These server instructions need further review.

最终表单提示原文：

> These findings do not block submission, but unresolved findings may lead to rejection during review.

> MCP checks need attention Review tool and server instruction findings and scan status in the MCPs tab.

审核备注已填写六条符合／两条部分不符的实测结果、报告和视频链接、标注理由，以及手机实机状态栏未验证的限制。该备注仍在未提交的表单中；若关闭表单导致丢失，可从本次交付的 submission-context.txt 恢复。

按所有者要求，没有上传 YouTube 或 Google Drive，也没有更改 manifest 的 demo_recording_url，而是替换原有 GitHub Release 资产。没有移动 v1.1.0 标签。

当前 ZIP SHA256：`832201dc876f5dd4c01afc14a02f1cf386aa342f4bba8203da289f37678cd242`。

当前 MP4 SHA256：`0ba0697cb16d2f0fbf9e50ee081f7f1c64a63f01707e352a3c5c0ef1adcf3b15`。
