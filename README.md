# proxy-rule

自用 Clash / Mihomo 分流规则配置库，基于墨鱼（[@ddgksf2013](https://github.com/ddgksf2013)）的自用 Clash 配置改造维护。

## 文件说明

| 文件 | 说明 | 适用客户端 |
| --- | --- | --- |
| `clash.yaml` | 墨鱼自用原版，通过 `proxy-providers` 拉取订阅，`proxies: null` | Clash Verge（及其他支持 proxy-providers 的 Clash 内核） |
| `clash_party.yaml` | 改造版：移除 `proxy-providers` / `proxies: null`，策略组改用 `include-all` 直接引用入口订阅节点 | Mihomo Party（Clash Party），支持组合订阅 |

## 核心功能

两种配置都保留墨鱼的完整分流体系：

- **策略分组**：手动切换、全球加速、苹果服务、哔哩哔哩、OpenAI、国际媒体、谷歌服务、电报、推特、游戏平台、AdBlock、兜底分流
- **节点按国家分组**：香港 / 日本 / 台湾 / 美国 / 新加坡，可切换为手动选择（把对应节点组的 `a4` 锚点换成 `a2`）
- **规则订阅**：Ad、OpenAI、Bilibili、全球媒体、Apple、GitHub、Microsoft、Google、Telegram、Twitter、游戏等，均来自 [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)，走 CDN 加载
- **DNS**：fake-ip 模式，国内 223.5.5.5 / 119.29.29.29，国外 Cloudflare / Google / Ali DNS，国内直连优先

## 使用

客户端导入后，把配置里的订阅地址换成你自己的：

- **clash.yaml**：`proxy-providers.Sub.url` 填你的机场 Clash 订阅链接（或组合订阅，多机场用 `|` 分隔）
- **clash_party.yaml**：`include-all` 直接引用你在 Mihomo Party 里添加的订阅节点，无需额外占位 `proxies`

> 订阅链接含敏感信息，请自行替换，勿直接提交真实订阅链接到公开仓库。

## 致谢

- [@ddgksf2013](https://github.com/ddgksf2013) — 配置原作者（墨鱼）
- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) — 分流规则来源
- [clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev) — Clash Verge 客户端