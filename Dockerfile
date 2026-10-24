# syntax=docker/dockerfile:1
# railway-vpngate-combined: VPNGate(via sing-box openvpn-client, no TUN)
# behind dual VLESS+WS inbounds, fronted by Cloudflare Tunnel.
#
# Processes (all supervised, see start.sh + railway_manager.py):
#   railway_manager.py  owns $PORT (mux /healthz /ui /api + SOCKS5),
#                       sing-box (mixed 127.0.0.1:40000, vless 8080/8082),
#                       cloudflared (soft-skipped without TUNNEL_TOKEN)
#   zen-direct          OpenCode Zen gateway on 4096 (OpenAI-compatible:
#                       /v1/chat/completions, /v1/messages, /health).
#                       Ships with its embedded Bun sidecar; the container
#                       talks to opencode.ai directly (no proxy), which is
#                       the whole point of running it on a clean egress.
#   python http.server  static disguise page on 8081 (from ./www)
#   nezha-agent         optional, only with NEZHA_SERVER + NEZHA_KEY
#
# Ports:
#   $PORT (set PORT=3000 on Railway to avoid clashing with the fixed ones):
#                       manager mux
#   4096: zen-direct (OpenAI-compatible gateway; /health shows the sidecar)
#   8080: sing-box VLESS+WS /ws-node  -> direct (Railway-local exit)
#   8081: disguise page
#   8082: sing-box VLESS+WS /ws-chain -> chain-socks -> VPNGate exit
FROM python:3.11-slim

ARG SINGBOX_VERSION=1.14.0
ARG CLOUDFLARED_VERSION=2026.8.3

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates unzip \
    && curl -Ls "https://github.com/SagerNet/sing-box/releases/download/v${SINGBOX_VERSION}/sing-box-${SINGBOX_VERSION}-linux-amd64.tar.gz" \
        | tar xz -C /tmp \
    && mv /tmp/sing-box-*/sing-box /usr/local/bin/sing-box \
    && chmod +x /usr/local/bin/sing-box \
    && sing-box version \
    && curl -Ls -o /usr/local/bin/cloudflared "https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/cloudflared-linux-amd64" \
    && chmod +x /usr/local/bin/cloudflared \
    && cloudflared --version \
    && rm -rf /tmp/sing-box-* /var/lib/apt/lists/*

# Bun: runtime for zen-direct's embedded sidecar. Vendored in the repo
# (vendor/bun-linux-x64.zip) so the build never depends on bun.sh, npm or a
# registry image - and the hash below pins the exact bytes that get shipped.
ARG BUN_ZIP_SHA256=BF8CCBFB2B0B80159E0F9A6D15C55317ADD8077534DBC6130A3EDB52FCCB395C
COPY vendor/bun-linux-x64.zip /tmp/bun.zip
RUN echo "${BUN_ZIP_SHA256}  /tmp/bun.zip" | sha256sum -c - \
    && unzip -q /tmp/bun.zip -d /tmp/bun \
    && install -m 0755 /tmp/bun/bun-linux-x64/bun /usr/local/bin/bun \
    && rm -rf /tmp/bun /tmp/bun.zip \
    && bun --version

WORKDIR /app

COPY vpngate_to_singbox.py railway_manager.py ./
COPY scripts/ ./scripts/
COPY zen-direct-linux-amd64 /usr/local/bin/zen-direct
COPY www ./www
COPY start.sh ./start.sh

RUN sed -i 's/\r$//' /app/start.sh \
 && chmod +x /app/start.sh /usr/local/bin/zen-direct

EXPOSE 3000 4096 8080 8081 8082

ENTRYPOINT ["/app/start.sh"]
