/*
 * 由 lan-wifi.plugin 传入 homeWifi、lanIp、services。
 * 命中指定 Wi-Fi 时，把 CF 隧道域名请求改写到局域网 HTTP 端口；
 * 其他网络、未知域名、参数不全一律原样放行。
 * 需要 MITM 证书信任，以及 Loon 本地网络权限。
 * 局域网 HTTP 明文传输凭据，仅用于可信网络。
 */
const VERSION = 'lan-wifi v2';
const options = typeof $argument === 'object' && $argument ? $argument : {};

const HOME_WIFIS = String(options.homeWifi || '')
  .split(/[,，\r\n]+/).map(name => name.trim()).filter(Boolean);
const LAN_IP = String(options.lanIp || '').trim();

// 域名 → 本地端口。services 参数可覆盖或追加，格式：host=port，多个用逗号或换行分隔。
const DEFAULT_PORTS = {
  'mag.goku.top': 3430,
  'nav.goku.top': 7870,
  'cpa.goku.top': 8317,
  'dash.goku.top': 8899,
  'hindsight.goku.top': 9999,
  'vault.goku.top': 7788,
  'wb2.goku.top': 7863,
  'xhx2api.goku.top': 7867,
  'multica.goku.top': 3000,
};
const PORTS = { ...DEFAULT_PORTS };
String(options.services || '')
  .split(/[,，\r\n]+/).map(item => item.trim()).filter(Boolean)
  .forEach(item => {
    const [host, port] = item.split('=').map(part => String(part || '').trim());
    const num = Number(port);
    if (host && Number.isInteger(num) && num > 0 && num < 65536) PORTS[host.toLowerCase()] = num;
  });

let finished = false;
function finish(result) {
  if (!finished) {
    finished = true;
    $done(result);
  }
}
function fail() {
  // 连接超时可能发生在服务端已处理请求之后，返回错误而不重发公网。
  finish({ response: {
    status: 502,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ code: 502, message: '局域网直连失败，请查看 Loon 脚本日志' })
  } });
}
function readSSID(config) {
  return String(config.ssid || config.ssid_name || config.current_ssid || '').trim();
}

try {
  const config = JSON.parse($config.getConfig() || '{}');
  const ssid = readSSID(config);
  const validIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(LAN_IP);
  let host = '';
  let path = '';
  try {
    const target = new URL($request.url);
    host = target.hostname.toLowerCase();
    path = target.pathname;
  } catch (e) { host = ''; path = ''; }
  const port = PORTS[host];

  console.log('[' + VERSION + '] ssid=' + JSON.stringify(ssid)
    + ' configured=' + HOME_WIFIS.length + ' ip=' + validIp + ' host=' + (host || '-')
    + ' port=' + (port || '-'));

  if (/^\/ws(\/|$)/.test(path)) {
    // WebSocket 是长连接，$httpClient 拿不到 Upgrade 握手，改写必然断连。
    console.log('[' + VERSION + '] KEEP: websocket path ' + path);
    finish({});
  } else if (!HOME_WIFIS.length || !validIp || !port || !HOME_WIFIS.includes(ssid)) {
    console.log('[' + VERSION + '] KEEP: network, ip or host not matched');
    finish({});
  } else {
    const method = String($request.method || 'GET').toLowerCase();
    const send = $httpClient[method];
    if (typeof send !== 'function') {
      console.log('[' + VERSION + '] unsupported method: ' + method);
      fail();
    } else {
      const headers = { ...$request.headers };
      Object.keys(headers).forEach(key => {
        // 长度与编码由 HTTPClient 重算；保留 Host 让本地按域名分流的服务认得出站点。
        if (['connection', 'content-length', 'transfer-encoding', 'accept-encoding']
          .includes(key.toLowerCase())) delete headers[key];
      });
      // 8899 这类多站点服务按 Host 分发，必须保留原始域名。
      Object.keys(headers).forEach(key => {
        if (key.toLowerCase() === 'host') delete headers[key];
      });
      headers['Host'] = host;

      const target = $request.url.replace(
        /^https:\/\/[^/]+/i, 'http://' + LAN_IP + ':' + port);
      const params = {
        url: target, headers, node: 'DIRECT', timeout: 30000,
        'binary-mode': true, 'auto-redirect': false, 'auto-cookie': false
      };
      if ($request.body !== undefined && $request.body !== null) params.body = $request.body;
      console.log('[' + VERSION + '] FETCH ' + method.toUpperCase() + ' ' + host
        + ' -> ' + LAN_IP + ':' + port + ', node=DIRECT');
      send.call($httpClient, params, (error, response, data) => {
        if (error || !response) {
          console.log('[' + VERSION + '] LAN transport failed; not retried');
          fail();
          return;
        }
        const status = Number(response.status);
        if (!Number.isInteger(status) || status < 200 || status > 599) {
          console.log('[' + VERSION + '] invalid LAN response status');
          fail();
          return;
        }
        console.log('[' + VERSION + '] LAN response: HTTP ' + status);
        const responseHeaders = { ...(response.headers || {}) };
        Object.keys(responseHeaders).forEach(key => {
          if (['content-length', 'content-encoding', 'transfer-encoding', 'connection']
            .includes(key.toLowerCase())) delete responseHeaders[key];
        });
        finish({ response: {
          status, headers: responseHeaders,
          body: method === 'head' || status === 204 || status === 304 ? '' : (data == null ? '' : data)
        } });
      });
    }
  }
} catch (e) {
  console.log('[' + VERSION + '] exception: ' + e.name);
  fail();
}
