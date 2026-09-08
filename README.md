# railway-vpngate-combined

VPNGate 免费节点（sing-box `openvpn-client`，免 TUN/免特权）+ 双 VLESS+WS 入站，
经 Cloudflare Tunnel 对外提供。CC Switch / 伪装页 / 哪吒探针从
`railway-proxy-combined` 全量搬运（Xray 由 sing-box 原生 VLESS 入站替代）。

## 双流量（冻结方案）

| 入站 | 路径 | 出口 |
|---|---|---|
| `:8080` `/ws-node` | `vless-direct` → `direct` | Railway 本机出口（复刻 combined 行为） |
| `:8082` `/ws-chain` | `vless-chain` → `chain-socks` → mixed → `auto` → openvpn | VPNGate 节点出口 |

两个入站共用同一个 `UUID`（`VLESS_UUID`，默认与 combined 一致：
`a29738e5-bee1-c0fc-b484-ae7c49cbc828`）。`route.rules` 按 inbound tag 分流，
两条路互不串扰。

## Railway 部署

1. 新建 Service，指向本仓库，Region 建议新加坡（离 VPNGate 亚洲节点近）。
2. Variables（必填）：
   - `PORT=3000`（固定端口，避开 8080/8081/8082/4096）
     - `PROXY_USER`（默认 `u`）/ `PROXY_PASS`（可选；不填则每次启动自动生成随机 `PROXY_PASS`，
       `PROXY_USER` 保持 `u`。走 VLESS+tunnel 时用不到；只有直连 SOCKS5 调试时才需要。
       显式填写的话 `PROXY_PASS` 须 ≥ 16 位，否则拒绝启动）
     - `ADMIN_TOKEN`（可选；不填则默认为 `vpn`，`/ui` 登录门输入 `vpn` 即可进入；
       若显式填写且长度 < 16 位，会被静默替换为随机值并在日志打印）
   - `TUNNEL_TOKEN`（Cloudflare tunnel token；缺失则 tunnel 软跳过，
     代理本身照常工作，`status["tunnel"] == "no-token"`）
     - 可选：`VLESS_UUID`（默认与 combined 一致；`VLESS_UUID` 为空则不注册 VLESS 入站，
       直接 `python railway_manager.py` 会无 VLESS）、`NEZHA_SERVER`/`NEZHA_KEY`、
       `LIMIT`（默认 0=全量）、`REAL_TOPK`（默认 30）、`DIAL_WORKERS`（默认 10，
       真测并发；1GB 内存够用，OOM 就往小调）
3. 健康检查：`/` 路径填 `/healthz`（部署时需 200，冷启动靠 last-good 秒回）。
4. 另加一个 TCP Proxy 指向内部 `3000` 端口（可选，给 SOCKS5 用）。
5. 持久化（强烈建议）：service → Volumes → Add Volume，加完即可，
   无需配任何变量。代码会自动用 Railway 注入的
   `RAILWAY_VOLUME_MOUNT_PATH` 存 sing-box 配置/节点存档/last-good
   （`DATA_DIR` 显式设置会优先）。不挂卷的话每次重部署从 Top30 冷启动。

> 合规警告：Railway AUP 明文禁止 proxy/anonymization 服务，
> 长期运行有封号风险，仅适合临时演示/调试。

## Cloudflare Tunnel 路由（Dashboard 配置）

tunnel 只管把外网域名打到容器端口，token 方式运行，
ingress 规则在 Cloudflare Dashboard 的 tunnel 配置里加：

- `node.example.com` + Path `/ws-node*` → `http://localhost:8080`
- 同一 hostname + Path `/ws-chain*` → `http://localhost:8082`
- 同一 hostname + Path `/*` → `http://localhost:3000`（兜底，必须排在上面两条**之后**）

顺序即优先级：`/ws-node`、`/ws-chain` 先命中走 sing-box，其余一切都落到
3000 的 manager。manager 剥离 query 后路由：`/ui` 进控制台登录门，
`/api/*` 为数据接口（需 Bearer token），`/` 直接 serve 伪装页文件
（`start.sh` 注入 UUID 后经 `DISGUISE_PATH` 接线，`start.sh` 幂等，
容器重启不会残留旧值），其余路径 404。三条规则一次配完，不用再为伪装页加端口。

（同一 hostname 配两个 path 也可。）本地都是明文 `http://`，
TLS 由 Cloudflare 边缘终结。

客户端：

```
vless://<UUID>@node.example.com:443?security=tls&sni=node.example.com&type=ws&path=/ws-node#direct
vless://<UUID>@chain.example.com:443?security=tls&sni=chain.example.com&type=ws&path=/ws-chain#vpngate
```

验证：`/ws-node` 出口 IP == Railway 本机 IP；
`/ws-chain` 出口 IP == VPNGate 节点 IP（两者不同即分流正常）。

## 本地试运行

```bash
docker build -t combined:test .
docker run -d --name combined -p 3000:3000 -p 8080:8080 -p 8082:8082 \
  -e PORT=3000 -e PROXY_USER=u -e PROXY_PASS=0123456789abcdef \
  -e ADMIN_TOKEN=local-admin-token-0123456789 \
  -e VLESS_UUID=a29738e5-bee1-c0fc-b484-ae7c49cbc828 \
  -e LIMIT=12 -e REAL_TOPK=2 \
  combined:test
curl http://127.0.0.1:3000/healthz   # ok
```

管理页：`http://127.0.0.1:3000/ui`（粘贴 ADMIN_TOKEN）。
全量真测：管理页按钮或 `POST /api/full_probe`（需 `Authorization: Bearer`）。
单节点测速：节点列表每行“测速”链接，或 `POST /api/probe {"tag":"vpngate-N"}`；
测通的节点自动可切换（全部存活节点本就在 sing-box 配置里，无需重建）。

## CI

`.github/workflows/test-combined.yml`：单测 → sing-box check →
真实快照转换 → 真拨号 → 稳定性探针 → 镜像构建冒烟 →
trial-run（含双 VLESS 路径拨号验证：chain 出口 ≠ direct 出口，
direct 出口 == runner 本机 IP）。
