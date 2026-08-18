import { ContextReceipt, ReceiptTargetStatus } from '../types/index.js';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeMarkdown(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|');
}

function statusLabel(status: ReceiptTargetStatus): string {
  return status.toUpperCase();
}

export function renderReceiptJson(receipt: ContextReceipt): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

export function renderReceiptMarkdown(receipt: ContextReceipt): string {
  const lines = [
    '# RuleSync Context Receipt',
    '',
    `Context ID: \`${receipt.contextId}\``,
    `Generated: ${escapeMarkdown(receipt.generatedAt)}`,
    `Source: \`${escapeMarkdown(receipt.source.path)}\` · ${receipt.source.bytes} bytes · ~${receipt.source.tokenEstimate} tokens`,
    '',
    `Summary: ${receipt.summary.synced} synced · ${receipt.summary.missing} missing · ${receipt.summary.drifted} drifted · ${receipt.summary.total} total`,
    '',
    '| Target | Path | Status | Expected SHA-256 | Actual SHA-256 | Bytes | Tokens |',
    '| --- | --- | --- | --- | --- | ---: | ---: |',
    ...receipt.targets.map((target) => [
      target.target,
      escapeMarkdown(target.path),
      statusLabel(target.status),
      `\`${target.expectedSha256}\``,
      target.actualSha256 ? `\`${target.actualSha256}\`` : '—',
      String(target.bytes),
      String(target.tokenEstimate)
    ].join(' | ')),
    '',
    'This receipt fingerprints expected compiled bytes. It does not claim an agent loaded them at runtime.',
    ''
  ];
  return lines.join('\n');
}

function renderTarget(target: ContextReceipt['targets'][number]): string {
  const actual = target.actualSha256 ?? 'not present';
  return `<article class="target status-${target.status}" data-search="${escapeHtml(`${target.target} ${target.path} ${target.status}`)}">
  <div class="target-head"><div><span class="target-name">${escapeHtml(target.target)}</span><div class="target-path">${escapeHtml(target.path)}</div></div><span class="badge">${statusLabel(target.status)}</span></div>
  <div class="metrics"><span>${target.bytes} bytes</span><span>~${target.tokenEstimate} tokens</span></div>
  <dl><dt>Expected SHA-256</dt><dd><code>${target.expectedSha256}</code></dd><dt>Actual SHA-256</dt><dd><code>${escapeHtml(actual)}</code></dd></dl>
</article>`;
}

export function renderReceiptHtml(receipt: ContextReceipt): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RuleSync Context Receipt ${escapeHtml(receipt.contextId)}</title>
  <style>
    :root { color-scheme: light; --ink:#172033; --muted:#657089; --line:#e2e7f0; --paper:#fff; --wash:#f6f8fc; --accent:#6f55ff; --synced:#147548; --missing:#a26409; --drifted:#bd3f5b; }
    * { box-sizing:border-box; } body { margin:0; background:var(--wash); color:var(--ink); font:15px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif; }
    main { max-width:980px; margin:0 auto; padding:44px 20px 72px; } .hero { padding:30px; border-radius:22px; color:#fff; background:linear-gradient(135deg,#171d38,#473389); box-shadow:0 18px 46px #2c296025; }
    .eyebrow { color:#c9c0ff; font-size:11px; font-weight:800; letter-spacing:.15em; text-transform:uppercase; } h1 { margin:8px 0; font-size:clamp(28px,5vw,48px); letter-spacing:-.04em; } .lede { color:#dddaf0; max-width:700px; margin:0; }
    .context-id { display:inline-block; margin-top:20px; padding:9px 12px; border:1px solid #ffffff3d; border-radius:10px; background:#ffffff14; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; }
    .panel { background:var(--paper); border:1px solid var(--line); border-radius:16px; padding:20px; margin-top:16px; } .summary { display:flex; flex-wrap:wrap; gap:10px; } .metric { border:1px solid var(--line); border-radius:12px; padding:12px 14px; min-width:120px; } .metric strong { display:block; font-size:22px; } .metric span { color:var(--muted); font-size:12px; }
    .source { display:grid; gap:6px; color:var(--muted); } .source code { color:var(--ink); overflow-wrap:anywhere; } .toolbar { display:flex; gap:12px; align-items:center; margin:26px 0 12px; } input { flex:1; border:1px solid var(--line); border-radius:11px; padding:11px 13px; font:inherit; } #count { color:var(--muted); white-space:nowrap; }
    .targets { display:grid; gap:12px; } .target { background:var(--paper); border:1px solid var(--line); border-left:5px solid var(--synced); border-radius:14px; padding:18px; } .status-missing { border-left-color:var(--missing); } .status-drifted { border-left-color:var(--drifted); } .target-head { display:flex; justify-content:space-between; gap:15px; align-items:flex-start; } .target-name { font-weight:800; } .target-path { color:var(--muted); margin-top:3px; overflow-wrap:anywhere; } .badge { border-radius:99px; padding:4px 9px; font-size:11px; font-weight:800; letter-spacing:.05em; } .status-synced .badge { color:var(--synced); background:#e6f6ee; } .status-missing .badge { color:var(--missing); background:#fff2d9; } .status-drifted .badge { color:var(--drifted); background:#fdebf0; }
    .metrics { display:flex; gap:14px; margin:15px 0; color:var(--muted); font-size:13px; } dl { display:grid; grid-template-columns:max-content 1fr; gap:6px 12px; margin:0; font-size:12px; } dt { color:var(--muted); } dd { margin:0; overflow-wrap:anywhere; } footer { color:var(--muted); margin-top:22px; font-size:12px; }
  </style>
</head>
<body>
  <main>
    <section class="hero"><div class="eyebrow">RuleSync · context receipt</div><h1>Exact agent context, made visible.</h1><p class="lede">A local fingerprint of the canonical rule source and every compiled target. Review drift before an agent follows stale instructions.</p><div class="context-id">context ${escapeHtml(receipt.contextId)}</div></section>
    <section class="panel"><div class="summary"><div class="metric"><strong>${receipt.summary.synced}</strong><span>synced</span></div><div class="metric"><strong>${receipt.summary.missing}</strong><span>missing</span></div><div class="metric"><strong>${receipt.summary.drifted}</strong><span>drifted</span></div><div class="metric"><strong>${receipt.summary.total}</strong><span>targets</span></div></div></section>
    <section class="panel source"><strong>Canonical source</strong><span><code>${escapeHtml(receipt.source.path)}</code> · ${receipt.source.bytes} bytes · ~${receipt.source.tokenEstimate} tokens</span><span>SHA-256 <code>${receipt.source.sha256}</code></span><span>Generated ${escapeHtml(receipt.generatedAt)}</span></section>
    <div class="toolbar"><input id="filter" type="search" placeholder="Filter targets…" aria-label="Filter targets"><span id="count">${receipt.targets.length} targets</span></div>
    <section class="targets" id="targets">${receipt.targets.map(renderTarget).join('')}</section>
    <footer>Hashes fingerprint expected compiled bytes. They do not prove an agent loaded files at runtime. Generated locally; no network request required.</footer>
  </main>
  <script>
    const input = document.querySelector('#filter');
    const cards = [...document.querySelectorAll('.target')];
    const count = document.querySelector('#count');
    input.addEventListener('input', () => { const query = input.value.toLowerCase().trim(); let visible = 0; cards.forEach((card) => { const show = !query || card.dataset.search.toLowerCase().includes(query); card.hidden = !show; if (show) visible += 1; }); count.textContent = visible + ' targets'; });
  </script>
</body>
</html>\n`;
}
