# proxy-rule

自用分流规则配置库：Clash / Mihomo 客户端配置 + Loon 远程规则，规则体系基于墨鱼的自用配置维护。

## 文件一览

| 文件 | 用途 | 适用客户端 |
| --- | --- | --- |
| `clash.yaml` | 通过 `proxy-providers` 拉取机场订阅 | Clash Verge 及其他支持 proxy-providers 的 Clash 内核 |
| `clash_party.yaml` | `include-all` 直接引用客户端内订阅节点 | Mihomo Party（Clash Party） |
| `loon/Ai.list` | AI 服务分流远程规则，共 101 条 | Loon |

## Clash 配置

两种配置的分流体系一致，区别只在订阅接入方式：

- **策略分组**：手动切换、全球加速、OpenAI、国际媒体、苹果服务、谷歌服务、电报、推特、哔哩哔哩、游戏平台、AdBlock、兜底分流
- **节点分组**：香港 / 日本 / 台湾 / 美国 / 新加坡；默认自动测速（锚点 `a4`），把 `a4` 换成 `a2` 即为手动选择
- **规则订阅**：Ad、OpenAI、Bilibili、全球媒体、Apple、GitHub、Microsoft、Google、Telegram、Twitter、游戏等，来自 [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)，走 CDN 远程加载
- **DNS**：fake-ip 模式；国内 223.5.5.5 / 119.29.29.29，国外 Cloudflare / Google / Ali DNS，国内直连优先

### 使用

客户端导入后，把订阅地址换成你自己的：

- **clash.yaml**：`proxy-providers.Sub.url` 填机场 Clash 订阅链接（或组合订阅，多机场用 `|` 分隔）
- **clash_party.yaml**：先在 Mihomo Party 里添加订阅，配置会自动 `include-all` 引用，无需手填占位 `proxies`

## Loon 规则

`loon/Ai.list` 覆盖主流 AI 服务（共 101 条域名规则）：

- Anthropic / Claude、OpenAI / ChatGPT、Google AI (Gemini)、Microsoft Copilot、xAI / Grok
- Cursor、Poe、Perplexity、Hugging Face、NotebookLM、Midjourney、Dify、Manus 等

填进 Loon 配置的 `[Remote Rule]` 段即可订阅（`policy` 换成你实际使用的 AI 策略组名）：

```
https://raw.githubusercontent.com/sgr997/proxy-rule/main/loon/Ai.list, tag=AI, policy=AI策略组, enabled=true
```

数据源为墨鱼的 [Ai.yaml](https://ddgksf2013.top/filter/Ai.yaml)，当前是 2026-09-30 版本的转换快照；上游更新后需重新转换同步，规则本身不会自动更新。

## 注意

- 仓库内不含任何真实订阅链接；订阅链接含敏感信息，请自行替换，勿提交到公开仓库。

## 致谢

- [@ddgksf2013](https://github.com/ddgksf2013)（墨鱼）— 配置与 AI 规则集原作者
- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) — Clash 侧分流规则来源
- [clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev) — Clash Verge 客户端
