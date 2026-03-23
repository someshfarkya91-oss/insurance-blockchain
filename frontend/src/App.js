// src/App.jsx  –  ChainInsure (fixed)
import React, { useState, useEffect, useCallback } from "react";
import api from "./api";
import useMetaMask from "./hooks/useMetaMask";
import AdminPage from "./pages/AdminPage";

const API_BASE = "http://localhost:8000";

// ============ GLOBAL STYLES ============
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#080810; --surface:#0f0f1a; --surface2:#161624; --surface3:#1e1e30;
    --border:rgba(255,255,255,0.06); --border-hover:rgba(255,255,255,0.12);
    --accent:#e8ff47; --accent2:#ff6b35; --accent3:#7c5cfc; --accent4:#00d4aa;
    --text:#eeeef5; --text-muted:#6b6b85; --text-dim:#2e2e44;
    --green:#00e676; --red:#ff4466; --orange:#ffaa00;
    --glow-purple:0 0 40px rgba(124,92,252,0.12);
  }
  html,body,#root { height:100%; font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); overflow-x:hidden; }
  ::-webkit-scrollbar { width:3px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:var(--surface3); border-radius:2px; }

  /* ── LIGHT MODE ── */
  body.light-mode {
    --bg:#f4f4f8; --surface:#ffffff; --surface2:#f0f0f6; --surface3:#e4e4ef;
    --border:rgba(0,0,0,0.08); --border-hover:rgba(0,0,0,0.14);
    --text:#16161e; --text-muted:#6b6b8a; --text-dim:#b0b0c8;
    --glow-purple:0 0 40px rgba(124,92,252,0.08);
  }

  /* AUTH */
  .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .auth-bg { position:absolute; inset:0; background:radial-gradient(ellipse 80% 50% at 20% 40%,rgba(124,92,252,.12) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 70%,rgba(232,255,71,.06) 0%,transparent 60%); }
  .auth-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(124,92,252,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,92,252,.03) 1px,transparent 1px); background-size:50px 50px; }
  .auth-card { position:relative; z-index:10; width:440px; background:var(--surface); border:1px solid var(--border); border-radius:28px; padding:48px 40px; box-shadow:0 0 0 1px rgba(124,92,252,.08),0 40px 80px rgba(0,0,0,.7); animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .auth-brand { display:flex; align-items:center; gap:10px; margin-bottom:36px; }
  .auth-brand-icon { width:42px; height:42px; background:var(--accent); border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:20px; }
  .auth-brand-name { font-family:'Syne',sans-serif; font-size:19px; font-weight:800; letter-spacing:-.5px; }
  .auth-heading { font-family:'Syne',sans-serif; font-size:27px; font-weight:800; letter-spacing:-1px; margin-bottom:5px; }
  .auth-sub { font-size:14px; color:var(--text-muted); margin-bottom:30px; }
  .auth-tabs { display:flex; background:var(--surface2); border-radius:12px; padding:4px; margin-bottom:26px; border:1px solid var(--border); }
  .auth-tab { flex:1; padding:10px; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:all .2s; background:transparent; color:var(--text-muted); }
  .auth-tab.on { background:var(--accent); color:#080810; font-weight:700; box-shadow:0 2px 12px rgba(232,255,71,.25); }
  .fld { margin-bottom:14px; }
  .fld-label { display:block; font-size:11px; font-weight:600; color:var(--text-muted); letter-spacing:.8px; text-transform:uppercase; margin-bottom:7px; }
  .fld-input { width:100%; padding:13px 15px; background:var(--surface2); border:1px solid var(--border); border-radius:11px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:all .2s; }
  .fld-input::placeholder { color:var(--text-dim); }
  .fld-input:focus { border-color:var(--accent3); box-shadow:0 0 0 3px rgba(124,92,252,.12); background:rgba(124,92,252,.04); }
  .btn-primary { width:100%; padding:15px; margin-top:6px; background:var(--accent); color:#080810; border:none; border-radius:12px; font-family:'Syne',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(232,255,71,.35); }
  .btn-primary:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }

  .btn-metamask { width:100%; padding:14px; margin-top:10px; background:transparent; color:#f6851b; border:1px solid rgba(246,133,27,.35); border-radius:12px; font-family:'Syne',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:10px; }
  .btn-metamask:hover { background:rgba(246,133,27,.08); border-color:rgba(246,133,27,.6); box-shadow:0 0 20px rgba(246,133,27,.15); }
  .btn-metamask:disabled { opacity:.4; cursor:not-allowed; }
  .metamask-icon { width:22px; height:22px; }
  .auth-divider { display:flex; align-items:center; gap:12px; margin:16px 0 0; }
  .auth-divider-line { flex:1; height:1px; background:var(--border); }
  .auth-divider-txt { font-size:11px; color:var(--text-dim); font-weight:600; text-transform:uppercase; letter-spacing:1px; }

  /* LAYOUT */
  .app { display:flex; min-height:100vh; }
  .sidebar { width:240px; min-height:100vh; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:24px 16px; position:fixed; top:0; left:0; bottom:0; z-index:100; overflow-y:auto; }
  .sb-brand { display:flex; align-items:center; gap:10px; padding:0 8px; margin-bottom:36px; }
  .sb-brand-icon { width:34px; height:34px; background:var(--accent); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .sb-brand-name { font-family:'Syne',sans-serif; font-size:15px; font-weight:800; letter-spacing:-.3px; }
  .sb-section { font-size:9px; font-weight:700; color:var(--text-dim); letter-spacing:2px; text-transform:uppercase; padding:0 10px; margin:20px 0 8px; }
  .sb-nav { flex:1; }
  .sb-item { display:flex; align-items:center; gap:11px; padding:11px 12px; border-radius:11px; cursor:pointer; transition:all .15s; margin-bottom:2px; color:var(--text-muted); font-size:13.5px; font-weight:500; border:1px solid transparent; }
  .sb-item:hover { background:var(--surface2); color:var(--text); }
  .sb-item.on { background:rgba(232,255,71,.07); color:var(--accent); border-color:rgba(232,255,71,.12); }
  .sb-item-icon { font-size:15px; flex-shrink:0; }
  .sb-item-badge { margin-left:auto; font-size:10px; font-weight:700; background:var(--accent2); color:white; padding:2px 7px; border-radius:100px; }
  .sb-item.admin-nav.on { background:rgba(124,92,252,.1); color:var(--accent3); border-color:rgba(124,92,252,.25); }
  .sb-user { padding:14px 12px; background:var(--surface2); border-radius:13px; border:1px solid var(--border); display:flex; align-items:center; gap:10px; margin-top:12px; }
  .sb-avatar { width:34px; height:34px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,var(--accent3),var(--accent2)); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:13px; color:white; }
  .sb-uname { font-size:13px; font-weight:600; }
  .sb-urole { font-size:11px; color:var(--text-muted); }
  .sb-logout { margin-left:auto; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:15px; padding:4px; border-radius:6px; transition:color .15s; }
  .sb-logout:hover { color:var(--red); }
  .main { margin-left:240px; flex:1; padding:36px 40px; min-height:100vh; }

  /* PAGE HEADER */
  .ph { margin-bottom:28px; }
  .ph-tag { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; padding:5px 12px; border-radius:100px; margin-bottom:10px; }
  .ph-tag.purple { background:rgba(124,92,252,.1); border:1px solid rgba(124,92,252,.2); color:var(--accent3); }
  .ph-tag.yellow { background:rgba(232,255,71,.08); border:1px solid rgba(232,255,71,.2); color:var(--accent); }
  .ph-tag.teal { background:rgba(0,212,170,.08); border:1px solid rgba(0,212,170,.2); color:var(--accent4); }
  .ph-tag.orange { background:rgba(255,107,53,.08); border:1px solid rgba(255,107,53,.2); color:var(--accent2); }
  .ph-title { font-family:'Syne',sans-serif; font-size:30px; font-weight:800; letter-spacing:-1.5px; line-height:1.1; }
  .ph-title em { font-style:normal; color:var(--accent); }
  .ph-sub { font-size:13.5px; color:var(--text-muted); margin-top:5px; }

  /* STAT CARDS */
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
  .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:17px; padding:22px; position:relative; overflow:hidden; transition:all .2s; }
  .stat-card:hover { transform:translateY(-2px); box-shadow:var(--glow-purple); border-color:var(--border-hover); }
  .stat-card::after { content:''; position:absolute; top:-20px; right:-20px; width:80px; height:80px; border-radius:50%; opacity:.08; }
  .stat-card.c1::after { background:var(--accent3); } .stat-card.c2::after { background:var(--accent); }
  .stat-card.c3::after { background:var(--green); } .stat-card.c4::after { background:var(--accent2); }
  .stat-icon { font-size:20px; margin-bottom:14px; }
  .stat-val { font-family:'Syne',sans-serif; font-size:34px; font-weight:800; letter-spacing:-2px; line-height:1; }
  .stat-lbl { font-size:11.5px; color:var(--text-muted); margin-top:4px; font-weight:500; }

  /* CLAIMS */
  .claims-layout { display:grid; grid-template-columns:360px 1fr; gap:22px; align-items:start; }
  .submit-panel { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:26px; }
  .submit-panel-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; }
  .submit-panel-sub { font-size:13px; color:var(--text-muted); margin-top:3px; padding-bottom:20px; border-bottom:1px solid var(--border); margin-bottom:22px; }
  .textarea-fld { width:100%; padding:13px 15px; background:var(--surface2); border:1px solid var(--border); border-radius:11px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; outline:none; resize:none; min-height:96px; transition:all .2s; margin-bottom:14px; }
  .textarea-fld:focus { border-color:var(--accent3); box-shadow:0 0 0 3px rgba(124,92,252,.12); }
  .file-zone { border:2px dashed var(--border); border-radius:13px; padding:26px 20px; text-align:center; cursor:pointer; transition:all .2s; margin-bottom:18px; position:relative; }
  .file-zone:hover { border-color:var(--accent3); background:rgba(124,92,252,.03); }
  .file-zone.filled { border-color:var(--accent); background:rgba(232,255,71,.03); }
  .file-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
  .file-zone-icon { font-size:26px; margin-bottom:7px; }
  .file-zone-txt { font-size:13px; color:var(--text-muted); }
  .file-zone-txt strong { color:var(--accent3); }
  .file-name-txt { font-size:12px; color:var(--accent); font-weight:500; margin-top:4px; }
  .submit-btn { width:100%; padding:14px; background:var(--accent); color:#080810; border:none; border-radius:11px; font-family:'Syne',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .submit-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(232,255,71,.3); }
  .submit-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }
  .claims-header-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .claims-count-badge { font-size:11px; color:var(--text-muted); background:var(--surface2); padding:4px 10px; border-radius:100px; border:1px solid var(--border); }
  .card-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; }
  .claims-list { display:flex; flex-direction:column; gap:11px; }
  .claim-card { background:var(--surface); border:1px solid var(--border); border-radius:17px; padding:18px 22px; transition:all .2s; animation:slideIn .35s cubic-bezier(.16,1,.3,1) both; }
  .claim-card:hover { border-color:var(--border-hover); transform:translateY(-1px); box-shadow:var(--glow-purple); }
  @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .claim-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }
  .claim-addr { font-family:'DM Mono',monospace; font-size:10.5px; color:var(--text-muted); background:var(--surface2); padding:4px 9px; border-radius:6px; border:1px solid var(--border); }
  .badge { display:inline-flex; align-items:center; gap:5px; font-size:10.5px; font-weight:600; padding:4px 11px; border-radius:100px; }
  .badge.pending { background:rgba(255,170,0,.1); color:var(--orange); border:1px solid rgba(255,170,0,.2); }
  .badge.approved { background:rgba(0,230,118,.1); color:var(--green); border:1px solid rgba(0,230,118,.2); }
  .badge-dot { width:5px; height:5px; border-radius:50%; background:currentColor; animation:blink 2s ease infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
  .claim-reason { font-size:14px; font-weight:500; line-height:1.5; margin-bottom:12px; }
  .claim-img { width:100%; max-height:180px; object-fit:cover; border-radius:11px; border:1px solid var(--border); margin-bottom:12px; display:block; }
  .claim-footer { display:flex; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px solid var(--border); }
  .claim-num { font-family:'DM Mono',monospace; font-size:11px; color:var(--text-muted); }
  .approve-btn { padding:8px 18px; background:transparent; border:1px solid var(--green); color:var(--green); border-radius:8px; font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:600; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:6px; }
  .approve-btn:hover { background:var(--green); color:#080810; box-shadow:0 4px 14px rgba(0,230,118,.25); }
  .empty { text-align:center; padding:56px 20px; color:var(--text-muted); }
  .empty-ico { font-size:44px; margin-bottom:10px; opacity:.35; }
  .empty-txt { font-size:14px; } .empty-s { font-size:12px; color:var(--text-dim); margin-top:4px; }

  /* ANALYTICS */
  .analytics-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
  .chart-card { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:24px; }
  .chart-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; margin-bottom:4px; }
  .chart-sub { font-size:12px; color:var(--text-muted); margin-bottom:20px; }
  .bar-chart { display:flex; align-items:flex-end; gap:10px; height:140px; padding:0 4px; }
  .bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end; }
  .bar-col { width:100%; border-radius:6px 6px 0 0; transition:height .8s cubic-bezier(.16,1,.3,1); min-height:4px; position:relative; cursor:pointer; }
  .bar-col:hover { filter:brightness(1.25); }
  .bar-col.purple { background:linear-gradient(180deg,var(--accent3),rgba(124,92,252,.3)); }
  .bar-col.yellow { background:linear-gradient(180deg,var(--accent),rgba(232,255,71,.3)); }
  .bar-col.teal { background:linear-gradient(180deg,var(--accent4),rgba(0,212,170,.3)); }
  .bar-lbl { font-size:10px; color:var(--text-muted); font-family:'DM Mono',monospace; }
  .bar-val { font-size:9px; color:var(--text); font-weight:600; position:absolute; top:-16px; left:50%; transform:translateX(-50%); white-space:nowrap; }
  .donut-wrap { display:flex; align-items:center; gap:28px; }
  .donut-legend { display:flex; flex-direction:column; gap:12px; }
  .legend-item { display:flex; align-items:center; gap:8px; }
  .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .legend-label { font-size:12px; color:var(--text-muted); }
  .legend-val { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; margin-left:auto; padding-left:20px; }
  .trend-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  .trend-card { background:var(--surface); border:1px solid var(--border); border-radius:15px; padding:18px 20px; display:flex; align-items:center; gap:14px; }
  .trend-icon { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:19px; flex-shrink:0; }
  .trend-icon.p { background:rgba(124,92,252,.12); } .trend-icon.y { background:rgba(232,255,71,.08); } .trend-icon.g { background:rgba(0,230,118,.08); }
  .trend-val { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; letter-spacing:-1px; }
  .trend-lbl { font-size:11.5px; color:var(--text-muted); margin-top:2px; }
  .activity-list { display:flex; flex-direction:column; }
  .activity-item { display:flex; align-items:flex-start; gap:14px; padding:14px 0; border-bottom:1px solid var(--border); }
  .activity-item:last-child { border-bottom:none; }
  .act-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
  .act-dot.green { background:var(--green); box-shadow:0 0 8px rgba(0,230,118,.5); }
  .act-dot.orange { background:var(--orange); box-shadow:0 0 8px rgba(255,170,0,.5); }
  .act-dot.purple { background:var(--accent3); box-shadow:0 0 8px rgba(124,92,252,.5); }
  .act-text { font-size:13px; flex:1; line-height:1.5; }
  .act-time { font-size:11px; color:var(--text-muted); font-family:'DM Mono',monospace; flex-shrink:0; }

  /* EXPLORER */
  .search-bar { display:flex; gap:10px; margin-bottom:20px; padding:16px 18px; background:var(--surface); border:1px solid var(--border); border-radius:16px; align-items:center; flex-wrap:wrap; }
  .search-input { flex:1; min-width:200px; padding:11px 14px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Mono',monospace; font-size:12.5px; outline:none; transition:all .2s; }
  .search-input:focus { border-color:var(--accent3); box-shadow:0 0 0 3px rgba(124,92,252,.1); }
  .search-btn { padding:11px 20px; background:var(--accent3); color:white; border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; white-space:nowrap; }
  .search-btn:hover { background:#9070ff; }
  .explorer-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  .ex-stat { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px 18px; }
  .ex-stat-label { font-size:10.5px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; font-weight:600; margin-bottom:6px; }
  .ex-stat-val { font-family:'DM Mono',monospace; font-size:17px; font-weight:500; }
  .ex-stat-val.green { color:var(--green); } .ex-stat-val.purple { color:var(--accent3); } .ex-stat-val.teal { color:var(--accent4); font-size:12px; }
  .block-table { background:var(--surface); border:1px solid var(--border); border-radius:18px; overflow:hidden; }
  .block-table-header { display:grid; grid-template-columns:80px 1fr 1fr 120px 100px; gap:12px; padding:13px 22px; background:var(--surface2); border-bottom:1px solid var(--border); }
  .block-table-header span { font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; }
  .block-row { display:grid; grid-template-columns:80px 1fr 1fr 120px 100px; gap:12px; padding:15px 22px; border-bottom:1px solid var(--border); align-items:center; transition:background .15s; cursor:pointer; }
  .block-row:last-child { border-bottom:none; } .block-row:hover { background:var(--surface2); }
  .block-num { font-family:'DM Mono',monospace; font-size:13px; color:var(--accent3); font-weight:500; }
  .block-hash { font-family:'DM Mono',monospace; font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .block-addr { font-family:'DM Mono',monospace; font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .block-reason { font-size:12.5px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .tx-detail-panel { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:24px; margin-top:18px; animation:fadeUp .3s ease both; }
  .tx-detail-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; margin-bottom:18px; display:flex; align-items:center; gap:10px; }
  .tx-field { display:flex; gap:16px; padding:12px 0; border-bottom:1px solid var(--border); align-items:flex-start; }
  .tx-field:last-child { border-bottom:none; }
  .tx-field-key { font-size:10.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; width:120px; flex-shrink:0; margin-top:2px; }
  .tx-field-val { font-family:'DM Mono',monospace; font-size:12px; color:var(--text); word-break:break-all; flex:1; }
  .tx-field-val.green { color:var(--green); } .tx-field-val.purple { color:var(--accent3); }
  .live-dot { width:8px; height:8px; border-radius:50%; background:var(--green); box-shadow:0 0 0 0 rgba(0,230,118,.4); animation:ripple 1.5s ease-out infinite; flex-shrink:0; }
  @keyframes ripple { 70%{box-shadow:0 0 0 8px rgba(0,230,118,0)} 100%{box-shadow:0 0 0 0 rgba(0,230,118,0)} }
  .network-status { display:flex; align-items:center; gap:8px; padding:9px 13px; background:rgba(0,230,118,.06); border:1px solid rgba(0,230,118,.15); border-radius:9px; white-space:nowrap; }
  .network-status-txt { font-size:11.5px; font-weight:600; color:var(--green); }

  /* SETTINGS */
  .settings-layout { display:grid; grid-template-columns:210px 1fr; gap:20px; align-items:start; }
  .settings-nav { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:10px; }
  .sn-item { display:flex; align-items:center; gap:10px; padding:12px 13px; border-radius:10px; cursor:pointer; transition:all .15s; color:var(--text-muted); font-size:13.5px; font-weight:500; margin-bottom:2px; }
  .sn-item:hover { background:var(--surface2); color:var(--text); }
  .sn-item.on { background:rgba(124,92,252,.1); color:var(--accent3); }
  .settings-content { display:flex; flex-direction:column; gap:16px; }
  .settings-card { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:26px; }
  .settings-card.danger { border-color:rgba(255,68,102,.2); }
  .settings-section-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; margin-bottom:4px; }
  .settings-section-title.red { color:var(--red); }
  .settings-section-sub { font-size:13px; color:var(--text-muted); margin-bottom:22px; padding-bottom:18px; border-bottom:1px solid var(--border); }
  .setting-row { display:flex; align-items:center; justify-content:space-between; padding:15px 0; border-bottom:1px solid var(--border); gap:20px; }
  .setting-row:last-child { border-bottom:none; padding-bottom:0; }
  .setting-info { flex:1; }
  .setting-name { font-size:14px; font-weight:500; margin-bottom:3px; }
  .setting-desc { font-size:12px; color:var(--text-muted); line-height:1.4; }
  .toggle { width:44px; height:24px; border-radius:12px; cursor:pointer; position:relative; transition:background .2s; flex-shrink:0; border:none; outline:none; padding:0; }
  .toggle.on { background:var(--accent3); } .toggle.off { background:var(--surface3); }
  .toggle::after { content:''; position:absolute; width:18px; height:18px; border-radius:50%; background:white; top:3px; transition:left .2s; }
  .toggle.on::after { left:23px; } .toggle.off::after { left:3px; }
  .setting-input { padding:10px 13px; background:var(--surface2); border:1px solid var(--border); border-radius:9px; color:var(--text); font-family:'DM Mono',monospace; font-size:12px; outline:none; width:260px; transition:all .2s; }
  .setting-input:focus { border-color:var(--accent3); box-shadow:0 0 0 3px rgba(124,92,252,.1); }
  .save-btn { padding:10px 22px; background:var(--accent3); color:white; border:none; border-radius:9px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; white-space:nowrap; }
  .save-btn:hover { background:#9070ff; transform:translateY(-1px); }
  .save-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
  .danger-btn { padding:10px 22px; background:transparent; color:var(--red); border:1px solid rgba(255,68,102,.3); border-radius:9px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; white-space:nowrap; }
  .danger-btn:hover { background:rgba(255,68,102,.08); border-color:var(--red); }
  .contract-info { background:var(--surface2); border:1px solid var(--border); border-radius:11px; padding:16px; font-family:'DM Mono',monospace; font-size:11.5px; color:var(--text-muted); line-height:2; margin-top:14px; }
  .contract-info .key { color:var(--accent3); } .contract-info .val { color:var(--text); }
  .color-options { display:flex; gap:8px; }
  .color-opt { width:26px; height:26px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:all .15px; }
  .color-opt.selected { border-color:white; transform:scale(1.2); box-shadow:0 0 8px currentColor; }
  .profile-avatar-big { width:68px; height:68px; border-radius:50%; background:linear-gradient(135deg,var(--accent3),var(--accent2)); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:26px; color:white; margin-bottom:18px; }
  .pwd-field-row { display:flex; flex-direction:column; gap:10px; width:260px; }
  .pwd-field-row input { padding:10px 13px; background:var(--surface2); border:1px solid var(--border); border-radius:9px; color:var(--text); font-family:'DM Mono',monospace; font-size:12px; outline:none; transition:all .2s; }
  .pwd-field-row input:focus { border-color:var(--accent3); box-shadow:0 0 0 3px rgba(124,92,252,.1); }

  /* SPINNER & TOAST */
  .spinner { width:18px; height:18px; border:2px solid rgba(0,0,0,.15); border-top-color:#080810; border-radius:50%; animation:spin .6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .toast { position:fixed; bottom:22px; right:22px; z-index:9999; padding:13px 18px; border-radius:11px; font-size:13.5px; font-weight:500; display:flex; align-items:center; gap:9px; animation:toastIn .3s cubic-bezier(.16,1,.3,1) both; box-shadow:0 8px 32px rgba(0,0,0,.5); }
  .toast.success { background:var(--green); color:#080810; } .toast.error { background:var(--red); color:white; }
  @keyframes toastIn { from{opacity:0;transform:translateY(12px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }

  .wallet-pill { display:flex; align-items:center; gap:6px; background:rgba(246,133,27,.08); border:1px solid rgba(246,133,27,.25); border-radius:8px; padding:6px 10px; font-family:'DM Mono',monospace; font-size:10px; color:#f6851b; margin-top:6px; }
  .wallet-pill-dot { width:6px; height:6px; border-radius:50%; background:#f6851b; }
`;
if (!document.getElementById("app-main-styles")) {
  styleSheet.id = "app-main-styles";
  document.head.appendChild(styleSheet);
}

// ─── Toast ───────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}><span>{type==="success"?"✓":"✕"}</span>{message}</div>;
}

// ─── MetaMask SVG icon ────────────────────────
const MetaMaskIcon = () => (
  <svg className="metamask-icon" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32.96 1L19.39 10.73l2.44-5.73L32.96 1z" fill="#E17726" stroke="#E17726" strokeWidth=".25"/>
    <path d="M2.66 1l13.45 9.8-2.33-5.8L2.66 1z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M28.22 23.53l-3.61 5.52 7.72 2.13 2.21-7.52-6.32-.13zM.48 23.66l2.2 7.52 7.7-2.13-3.59-5.52-6.31.13z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M10.02 14.36l-2.15 3.24 7.65.35-.26-8.23-5.24 4.64zM25.61 14.36l-5.3-4.73-.17 8.32 7.64-.35-2.17-3.24z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M10.38 29.05l4.6-2.24-3.97-3.1-.63 5.34zM20.65 26.81l4.59 2.24-.62-5.34-3.97 3.1z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M25.24 29.05l-4.59-2.24.37 2.97-.04 1.31 4.26-2.04zM10.38 29.05l4.28 2.04-.03-1.31.36-2.97-4.61 2.24z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth=".25"/>
    <path d="M14.73 21.97l-3.83-1.13 2.7-1.24 1.13 2.37zM20.9 21.97l1.13-2.37 2.71 1.24-3.84 1.13z" fill="#233447" stroke="#233447" strokeWidth=".25"/>
    <path d="M10.38 29.05l.65-5.52-4.26.13 3.61 5.39zM24.6 23.53l.64 5.52 3.62-5.39-4.26-.13zM27.78 17.6l-7.64.35.71 3.99 1.13-2.37 2.71 1.24 3.09-3.21zM10.9 20.84l2.7-1.24 1.12 2.37.72-3.99-7.65-.35 3.11 3.21z" fill="#CC6228" stroke="#CC6228" strokeWidth=".25"/>
    <path d="M7.87 17.6l3.21 6.26-.11-3.05-3.1-3.21zM24.06 20.81l-.12 3.05 3.22-6.26-3.1 3.21zM15.45 17.95l-.72 3.99.9 4.65.21-6.13-.39-2.51zM20.14 17.95l-.38 2.5.2 6.14.91-4.65-.73-3.99z" fill="#E27525" stroke="#E27525" strokeWidth=".25"/>
    <path d="M20.9 21.97l-.91 4.65.65.46 3.97-3.1.12-3.05-3.83 1.04zM10.9 20.84l.11 3.05 3.97 3.1.65-.46-.9-4.65-3.83-1.04z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25"/>
    <path d="M21 31.09l.04-1.31-.34-.3h-5.1l-.32.3.03 1.31-4.28-2.04 1.5 1.22 3.04 2.1h5.21l3.05-2.1 1.49-1.22L21 31.09z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth=".25"/>
    <path d="M20.65 26.81l-.65-.46h-3.7l-.65.46-.36 2.97.32-.3h5.1l.34.3-.4-2.97z" fill="#161616" stroke="#161616" strokeWidth=".25"/>
    <path d="M33.52 11.3l1.15-5.56L32.96 1l-12.31 9.15 4.74 4 6.7 1.96 1.48-1.73-.64-.46 1.02-.93-.79-.61 1.02-.78-.66-.5zM.96 5.74L2.1 11.3l-.67.5 1.02.78-.78.61 1.02.93-.64.46 1.47 1.73 6.7-1.96 4.73-4L2.66 1 .96 5.74z" fill="#763E1A" stroke="#763E1A" strokeWidth=".25"/>
    <path d="M32.09 16.11l-6.7-1.96 2.17 3.24-3.22 6.26 4.25-.05h6.32l-2.82-7.49zM9.24 14.15l-6.7 1.96-2.8 7.49h6.31l4.24.05-3.21-6.26 2.16-3.24zM20.14 17.95l.43-7.07 1.96-5.3h-8.7l1.95 5.3.44 7.07.16 2.52.01 6.12h3.7l.02-6.12.03-2.52z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25"/>
  </svg>
);

// ─── AUTH PAGE ────────────────────────────────
function AuthPage({ onLogin, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm]       = useState({ username:"", email:"", mobile:"", password:"" });
  const [loading, setLoading] = useState(false);

  const mm = useMetaMask({
    onSuccess: ({ token, role, username, walletAddress }) => {
      onLogin(username || `wallet_${walletAddress.slice(2,8)}`, role, token);
      showToast(`Connected: ${walletAddress.slice(0,6)}…${walletAddress.slice(-4)}`);
    },
    onError: (msg) => showToast(msg, "error"),
  });

  const handleAuth = async () => {
    if (!form.username || !form.password) { showToast("Username and password required","error"); return; }
    try {
      setLoading(true);
      if (isLogin) {
        const res = await api.post("/login", { username:form.username, password:form.password });
        const token = res.data.token;
        const role  = res.data.role || "user";
        localStorage.setItem("token", token);
        localStorage.setItem("role",  role);
        localStorage.setItem("username", form.username);
        onLogin(form.username, role, token);
        showToast(`Welcome back, ${form.username}!`);
      } else {
        if (!form.email || !form.mobile) { showToast("All fields required","error"); return; }
        await api.post("/signup", form);
        showToast("Account created! Please login.");
        setIsLogin(true);
      }
    } catch (err) { showToast(err.response?.data?.error || err.response?.data || "Server error","error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" /><div className="auth-grid" />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🛡️</div>
          <div className="auth-brand-name">ChainInsure</div>
        </div>
        <div className="auth-heading">{isLogin ? "Welcome back" : "Create account"}</div>
        <div className="auth-sub">{isLogin ? "Sign in to manage your claims" : "Start your insurance journey"}</div>
        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin?"on":""}`}  onClick={() => { setIsLogin(true);  setForm({username:"",email:"",mobile:"",password:""}); }}>Login</button>
          <button className={`auth-tab ${!isLogin?"on":""}`} onClick={() => { setIsLogin(false); setForm({username:"",email:"",mobile:"",password:""}); }}>Sign Up</button>
        </div>
        <div className="fld"><label className="fld-label">Username</label><input className="fld-input" placeholder="Enter username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} /></div>
        {!isLogin && <>
          <div className="fld"><label className="fld-label">Email</label><input className="fld-input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
          <div className="fld"><label className="fld-label">Mobile</label><input className="fld-input" placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} /></div>
        </>}
        <div className="fld"><label className="fld-label">Password</label><input className="fld-input" type="password" placeholder="••••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleAuth()} /></div>
        <button className="btn-primary" onClick={handleAuth} disabled={loading || mm.loading}>
          {loading ? <div className="spinner" /> : (isLogin ? "Sign In →" : "Create Account →")}
        </button>
        <div className="auth-divider"><div className="auth-divider-line" /><div className="auth-divider-txt">or</div><div className="auth-divider-line" /></div>
        <button className="btn-metamask" onClick={mm.connect} disabled={mm.loading || loading}>
          {mm.loading ? <div className="spinner" style={{borderTopColor:"#f6851b"}} /> : <MetaMaskIcon />}
          {mm.loading ? "Connecting…" : "Continue with MetaMask"}
        </button>
        {mm.address && (
          <div className="wallet-pill">
            <div className="wallet-pill-dot" />
            {mm.address.slice(0,6)}…{mm.address.slice(-4)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CLAIMS PAGE ─────────────────────────────
function ClaimsPage({ claims, fetchClaims, showToast }) {
  const [reason, setReason] = useState("");
  const [image,  setImage]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !image) { showToast("Reason and image are required","error"); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("reason", reason);
      fd.append("image",  image);
      await api.post("/claim-with-image", fd);
      setReason(""); setImage(null);
      showToast("Claim submitted to blockchain!");
      fetchClaims();
    } catch { showToast("Error submitting claim","error"); }
    finally { setLoading(false); }
  };

  const approveClaim = async (index) => {
    try {
      await api.post("/approve", { index });
      showToast("Claim approved on-chain!");
      fetchClaims();
    } catch { showToast("Error approving claim","error"); }
  };

  const total    = claims.length;
  const pending  = claims.filter(c=>c.status==="Pending"||!c.status).length;
  const approved = claims.filter(c=>c.status==="Approved").length;
  const withImg  = claims.filter(c=>c.image).length;

  return (
    <div>
      <div className="ph"><div className="ph-tag yellow">📋 Claims</div><div className="ph-title">Insurance <em>Claims</em></div><div className="ph-sub">Submit and manage on-chain insurance claims</div></div>
      <div className="stats-grid">
        {[{icon:"📁",val:total,lbl:"Total Claims",cls:"c1"},{icon:"⏳",val:pending,lbl:"Pending",cls:"c2"},{icon:"✅",val:approved,lbl:"Approved",cls:"c3"},{icon:"🖼️",val:withImg,lbl:"With Evidence",cls:"c4"}].map((s,i)=>(
          <div key={i} className={`stat-card ${s.cls}`}><div className="stat-icon">{s.icon}</div><div className="stat-val">{s.val}</div><div className="stat-lbl">{s.lbl}</div></div>
        ))}
      </div>
      <div className="claims-layout">
        <div className="submit-panel">
          <div className="submit-panel-title">File New Claim</div>
          <div className="submit-panel-sub">Submit an incident report to the blockchain</div>
          <label className="fld-label">Description</label>
          <textarea className="textarea-fld" placeholder="Describe what happened in detail..." value={reason} onChange={e=>setReason(e.target.value)} />
          <label className="fld-label">Evidence Photo</label>
          <div className={`file-zone ${image?"filled":""}`}>
            <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} />
            <div className="file-zone-icon">{image?"📸":"☁️"}</div>
            <div className="file-zone-txt">{image?<span className="file-name-txt">{image.name}</span>:<><strong>Click to upload</strong> or drag &amp; drop</>}</div>
          </div>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>{loading?<div className="spinner"/>:<>⛓️ Submit to Blockchain</>}</button>
        </div>
        <div>
          <div className="claims-header-row"><div className="card-title">My Claims</div><div className="claims-count-badge">{claims.length} total</div></div>
          {claims.length===0
            ? <div className="empty"><div className="empty-ico">📭</div><div className="empty-txt">No claims yet</div><div className="empty-s">Submit your first claim above</div></div>
            : <div className="claims-list">{claims.map((c,i)=>(
                <div key={i} className="claim-card" style={{animationDelay:`${i*.04}s`}}>
                  <div className="claim-top"><div className="claim-addr">{c.user?`${c.user.slice(0,6)}...${c.user.slice(-4)}`:"Unknown"}</div><div className={`badge ${c.status==="Approved"?"approved":"pending"}`}><div className="badge-dot"/>{c.status||"Pending"}</div></div>
                  <div className="claim-reason">{c.reason}</div>
                  {c.image&&<img src={`${API_BASE}/uploads/${c.image}`} alt="Evidence" className="claim-img"/>}
                  <div className="claim-footer"><div className="claim-num">Claim #{String(i+1).padStart(3,"0")}</div>{(c.status==="Pending"||!c.status)&&<button className="approve-btn" onClick={()=>approveClaim(i)}>✓ Approve</button>}</div>
                </div>
              ))}</div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS PAGE ──────────────────────────
function AnalyticsPage({ claims }) {
  const total=claims.length,pending=claims.filter(c=>c.status==="Pending"||!c.status).length,approved=claims.filter(c=>c.status==="Approved").length,withImages=claims.filter(c=>c.image).length;
  const approvalRate=total>0?Math.round((approved/total)*100):0;
  const weeks=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],seed=total+1;
  const weekData=weeks.map((_,i)=>Math.max(1,((seed*(i+3))%9)+1)),maxW=Math.max(...weekData);
  const colors=["purple","yellow","teal","purple","yellow","teal","purple"];
  const r=52,cx=60,cy=60,circ=2*Math.PI*r,approvedDash=(approved/Math.max(total,1))*circ,pendingDash=(pending/Math.max(total,1))*circ;
  const activities=[{dot:"green",text:`${approved} claim${approved!==1?"s":""} successfully approved on-chain`,time:"live"},{dot:"orange",text:`${pending} claim${pending!==1?"s":""} currently awaiting review`,time:"now"},{dot:"purple",text:`${withImages} claim${withImages!==1?"s":""} submitted with photo evidence`,time:"total"},{dot:"green",text:"Smart contract verified on Hardhat local node",time:"active"},{dot:"purple",text:`MongoDB sync active — ${total} claim records stored`,time:"synced"}];
  return (
    <div>
      <div className="ph"><div className="ph-tag purple">📊 Analytics</div><div className="ph-title">Claim <em>Insights</em></div><div className="ph-sub">Real-time overview of your insurance claim activity</div></div>
      <div className="trend-row">
        <div className="trend-card"><div className="trend-icon p">📋</div><div><div className="trend-val">{total}</div><div className="trend-lbl">Total Claims Filed</div></div></div>
        <div className="trend-card"><div className="trend-icon y">⚡</div><div><div className="trend-val">{approvalRate}%</div><div className="trend-lbl">Approval Rate</div></div></div>
        <div className="trend-card"><div className="trend-icon g">🖼️</div><div><div className="trend-val">{withImages}</div><div className="trend-lbl">Photo Evidence Filed</div></div></div>
      </div>
      <div className="analytics-grid">
        <div className="chart-card"><div className="chart-title">Claims This Week</div><div className="chart-sub">Simulated daily distribution</div><div className="bar-chart">{weeks.map((w,i)=><div key={w} className="bar-wrap"><div className={`bar-col ${colors[i]}`} style={{height:`${(weekData[i]/maxW)*100}%`}}><span className="bar-val">{weekData[i]}</span></div><div className="bar-lbl">{w}</div></div>)}</div></div>
        <div className="chart-card"><div className="chart-title">Status Breakdown</div><div className="chart-sub">Distribution of claim statuses</div><div className="donut-wrap"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface2)" strokeWidth="14"/>{total>0&&<><circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--orange)" strokeWidth="14" strokeDasharray={`${pendingDash} ${circ}`} strokeDashoffset={circ*.25} strokeLinecap="round" style={{transition:"stroke-dasharray 1s ease"}}/><circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--green)" strokeWidth="14" strokeDasharray={`${approvedDash} ${circ}`} strokeDashoffset={circ*.25-pendingDash} strokeLinecap="round" style={{transition:"stroke-dasharray 1s ease"}}/></>}<text x={cx} y={cy-6} textAnchor="middle" fill="var(--text)" fontSize="18" fontFamily="Syne" fontWeight="800">{total}</text><text x={cx} y={cy+12} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="DM Sans">TOTAL</text></svg><div className="donut-legend"><div className="legend-item"><div className="legend-dot" style={{background:"var(--green)"}}/><span className="legend-label">Approved</span><span className="legend-val">{approved}</span></div><div className="legend-item"><div className="legend-dot" style={{background:"var(--orange)"}}/><span className="legend-label">Pending</span><span className="legend-val">{pending}</span></div><div className="legend-item"><div className="legend-dot" style={{background:"var(--accent3)"}}/><span className="legend-label">With Image</span><span className="legend-val">{withImages}</span></div></div></div></div>
      </div>
      <div className="chart-card" style={{marginBottom:0}}><div className="chart-title">Activity Feed</div><div className="chart-sub">Live system events and blockchain state</div><div className="activity-list">{activities.map((a,i)=><div key={i} className="activity-item"><div className={`act-dot ${a.dot}`}/><div className="act-text">{a.text}</div><div className="act-time">{a.time}</div></div>)}</div></div>
    </div>
  );
}

// ─── EXPLORER PAGE ───────────────────────────
function ExplorerPage({ claims }) {
  const [selected,setSelected]=useState(null),[filter,setFilter]=useState(""),[filterInput,setFilterInput]=useState("");
  const filtered=claims.filter(c=>!filter||(c.reason&&c.reason.toLowerCase().includes(filter.toLowerCase()))||(c.user&&c.user.toLowerCase().includes(filter.toLowerCase())));
  const genHash=(i)=>`0x${Array.from({length:64},(_,j)=>((i*13+j*7+5)%16).toString(16)).join("")}`;
  const genBlock=(i)=>1000+i*3+Math.floor(i*1.7);
  return (
    <div>
      <div className="ph"><div className="ph-tag teal">🔗 Explorer</div><div className="ph-title">Chain <em>Explorer</em></div><div className="ph-sub">Browse on-chain transactions and smart contract state</div></div>
      <div className="search-bar"><input className="search-input" placeholder="Search by address or reason..." value={filterInput} onChange={e=>setFilterInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setFilter(filterInput)}/><button className="search-btn" onClick={()=>setFilter(filterInput)}>🔍 Search</button>{filter&&<button className="search-btn" style={{background:"var(--surface3)"}} onClick={()=>{setFilter("");setFilterInput("");}}>✕ Clear</button>}<div className="network-status"><div className="live-dot"/><span className="network-status-txt">Hardhat Local · Chain 31337</span></div></div>
      <div className="explorer-stats"><div className="ex-stat"><div className="ex-stat-label">Total Transactions</div><div className="ex-stat-val purple">{claims.length}</div></div><div className="ex-stat"><div className="ex-stat-label">Contract Address</div><div className="ex-stat-val teal">0x5FbDB2315678…0aa3</div></div><div className="ex-stat"><div className="ex-stat-label">Network Status</div><div className="ex-stat-val green">● Connected</div></div></div>
      <div className="block-table"><div className="block-table-header"><span>Block</span><span>Tx Hash</span><span>From Address</span><span>Reason</span><span>Status</span></div>{filtered.length===0&&<div className="empty" style={{padding:"40px"}}><div className="empty-ico">🔍</div><div className="empty-txt">No transactions found</div></div>}{filtered.map((c,i)=><div key={i} className="block-row" onClick={()=>setSelected(selected===i?null:i)}><div className="block-num">#{genBlock(i)}</div><div className="block-hash">{genHash(i).slice(0,20)}…</div><div className="block-addr">{c.user?`${c.user.slice(0,10)}…${c.user.slice(-6)}`:"—"}</div><div className="block-reason">{c.reason||"—"}</div><div><span className={`badge ${c.status==="Approved"?"approved":"pending"}`}><div className="badge-dot"/>{c.status||"Pending"}</span></div></div>)}</div>
      {selected!==null&&filtered[selected]&&<div className="tx-detail-panel"><div className="tx-detail-title">🔍 Transaction Detail <span style={{fontSize:12,color:"var(--text-muted)",fontFamily:"DM Mono,monospace"}}>Block #{genBlock(selected)}</span></div>{[["Tx Hash",genHash(selected),"purple"],["Block",`#${genBlock(selected)}`,""],["From",filtered[selected].user||"Unknown",""],["Contract","0x5FbDB2315678afecb367f032d93F642f64180aa3","purple"],["Function","createClaim(string _reason)",""],["Input",filtered[selected].reason||"—",""],["Status",filtered[selected].status||"Pending",filtered[selected].status==="Approved"?"green":""],["Network","Hardhat Local · Chain ID 31337",""],["Gas Used",`${21000+selected*1337} wei`,""]].map(([k,v,cls])=><div key={k} className="tx-field"><div className="tx-field-key">{k}</div><div className={`tx-field-val ${cls}`}>{v}</div></div>)}</div>}
    </div>
  );
}

// ─── SETTINGS PAGE ── FIXED ───────────────────
function SettingsPage({ user, role, onLogout, showToast, onUsernameChange }) {
  const [activeTab, setActiveTab] = useState("profile");

  // ── Profile state (persisted in localStorage) ──────────────────────
  const [profileName,  setProfileName]  = useState(() => localStorage.getItem("displayName") || user || "");
  const [profileEmail, setProfileEmail] = useState(() => localStorage.getItem("profileEmail") || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password state ──────────────────────────────────────────────────
  const [currentPwd,  setCurrentPwd]  = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [savingPwd,   setSavingPwd]   = useState(false);

  // ── Network / notifications / appearance ───────────────────────────
  const [toggles, setToggles] = useState(() => {
    try { return JSON.parse(localStorage.getItem("appToggles")) || {notifications:true,emailAlerts:false,autoApprove:false,darkMode:true,analytics:true}; }
    catch { return {notifications:true,emailAlerts:false,autoApprove:false,darkMode:true,analytics:true}; }
  });
  const [rpcUrl,       setRpcUrl]       = useState(() => localStorage.getItem("rpcUrl") || "http://127.0.0.1:8545");
  const [contractAddr, setContractAddr] = useState(() => localStorage.getItem("contractAddr") || "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const [accentColor,  setAccentColor]  = useState(() => localStorage.getItem("accentColor") || "#e8ff47");

  // Apply dark/light mode to body when toggle changes
  useEffect(() => {
    if (toggles.darkMode) {
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
    }
  }, [toggles.darkMode]);

  // Apply accent color to CSS variable when it changes
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentColor);
  }, [accentColor]);

  const persistToggles = (next) => {
    setToggles(next);
    localStorage.setItem("appToggles", JSON.stringify(next));
  };
  const toggle = (k) => persistToggles({ ...toggles, [k]: !toggles[k] });

  // ── Save profile to backend + localStorage ──────────────────────────
  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      await api.put("/user/profile", { email: profileEmail });
      localStorage.setItem("displayName",  profileName);
      localStorage.setItem("profileEmail", profileEmail);
      if (onUsernameChange && profileName) onUsernameChange(profileName);
      showToast("Profile saved successfully!");
    } catch (err) {
      showToast(err.response?.data?.error || "Error saving profile", "error");
    } finally { setSavingProfile(false); }
  };

  // ── Change password via backend ─────────────────────────────────────
  const changePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) { showToast("All password fields are required", "error"); return; }
    if (newPwd !== confirmPwd) { showToast("New passwords do not match", "error"); return; }
    if (newPwd.length < 6) { showToast("New password must be at least 6 characters", "error"); return; }
    try {
      setSavingPwd(true);
      await api.put("/user/password", { currentPassword: currentPwd, newPassword: newPwd });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(err.response?.data?.error || "Error changing password", "error");
    } finally { setSavingPwd(false); }
  };

  // ── Save network settings ────────────────────────────────────────────
  const saveNetwork = () => {
    localStorage.setItem("rpcUrl", rpcUrl);
    localStorage.setItem("contractAddr", contractAddr);
    showToast("Network settings saved!");
  };

  // ── Apply accent color + save ────────────────────────────────────────
  const applyAppearance = () => {
    localStorage.setItem("accentColor", accentColor);
    localStorage.setItem("appToggles", JSON.stringify(toggles));
    showToast("Appearance preferences saved!");
  };

  const tabs = [
    {id:"profile",      icon:"👤", label:"Profile"},
    {id:"network",      icon:"🔗", label:"Network"},
    {id:"notifications",icon:"🔔", label:"Notifications"},
    {id:"appearance",   icon:"🎨", label:"Appearance"},
    {id:"security",     icon:"🔒", label:"Security"},
    {id:"danger",       icon:"⚠️", label:"Danger Zone"},
  ];

  return (
    <div>
      <div className="ph"><div className="ph-tag orange">⚙️ Settings</div><div className="ph-title">App <em>Settings</em></div><div className="ph-sub">Configure your ChainInsure experience</div></div>
      <div className="settings-layout">
        <div className="settings-nav">{tabs.map(t=><div key={t.id} className={`sn-item ${activeTab===t.id?"on":""}`} onClick={()=>setActiveTab(t.id)}><span>{t.icon}</span>{t.label}</div>)}</div>
        <div className="settings-content">

          {/* ── PROFILE ─────────────────────────────────── */}
          {activeTab==="profile"&&<div className="settings-card">
            <div className="settings-section-title">Profile Information</div>
            <div className="settings-section-sub">Manage your personal details and account</div>
            <div className="profile-avatar-big">{(profileName||user||"U")[0].toUpperCase()}</div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Display Name</div><div className="setting-desc">Your name shown across the app</div></div>
              <input className="setting-input" value={profileName} onChange={e=>setProfileName(e.target.value)} placeholder="Enter display name"/>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Email Address</div><div className="setting-desc">Used for claim notifications and alerts</div></div>
              <input className="setting-input" value={profileEmail} onChange={e=>setProfileEmail(e.target.value)} placeholder="you@example.com"/>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Role</div><div className="setting-desc">Your access level in the system</div></div>
              <div style={{padding:"9px 14px",background: role==="admin"?"rgba(124,92,252,.1)":"rgba(0,212,170,.08)",color:role==="admin"?"var(--accent3)":"var(--accent4)",borderRadius:8,fontSize:12,fontWeight:600,border:`1px solid ${role==="admin"?"rgba(124,92,252,.2)":"rgba(0,212,170,.2)"}`}}>
                {role==="admin" ? "Administrator" : "Policyholder"}
              </div>
            </div>
            <div className="setting-row" style={{paddingTop:18}}>
              <div className="setting-info"/>
              <button className="save-btn" onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <div className="spinner" style={{borderTopColor:"white"}}/> : "Save Changes"}
              </button>
            </div>
          </div>}

          {/* ── NETWORK ─────────────────────────────────── */}
          {activeTab==="network"&&<div className="settings-card">
            <div className="settings-section-title">Network Configuration</div>
            <div className="settings-section-sub">Blockchain node and smart contract connection</div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">RPC URL</div><div className="setting-desc">JSON-RPC endpoint for your Ethereum node</div></div>
              <input className="setting-input" value={rpcUrl} onChange={e=>setRpcUrl(e.target.value)}/>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Contract Address</div><div className="setting-desc">Deployed Insurance smart contract</div></div>
              <input className="setting-input" value={contractAddr} onChange={e=>setContractAddr(e.target.value)}/>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Connection</div><div className="setting-desc">Current node connectivity status</div></div>
              <div className="network-status"><div className="live-dot"/><span className="network-status-txt">Connected · Hardhat Local</span></div>
            </div>
            <div className="contract-info">
              <span className="key">Contract: </span><span className="val">{contractAddr}</span><br/>
              <span className="key">Network:  </span><span className="val">Hardhat Local (Chain 31337)</span><br/>
              <span className="key">RPC:      </span><span className="val">{rpcUrl}</span><br/>
              <span className="key">ABI:      </span><span className="val">createClaim · approveClaim · getClaims</span>
            </div>
            <div className="setting-row" style={{paddingTop:18}}>
              <div className="setting-info"/>
              <button className="save-btn" onClick={saveNetwork}>Save Settings</button>
            </div>
          </div>}

          {/* ── NOTIFICATIONS ───────────────────────────── */}
          {activeTab==="notifications"&&<div className="settings-card">
            <div className="settings-section-title">Notification Preferences</div>
            <div className="settings-section-sub">Manage alerts, emails, and system events</div>
            {[
              {key:"notifications",name:"In-app Notifications",desc:"Show toast messages for claim events and approvals"},
              {key:"emailAlerts",  name:"Email Alerts",         desc:"Receive emails when claims change status"},
              {key:"autoApprove",  name:"Auto-approve Preview", desc:"Show confirmation before approving any claim"},
              {key:"analytics",    name:"Analytics Tracking",   desc:"Track submission patterns and approval metrics"}
            ].map(s=>(
              <div key={s.key} className="setting-row">
                <div className="setting-info"><div className="setting-name">{s.name}</div><div className="setting-desc">{s.desc}</div></div>
                <button className={`toggle ${toggles[s.key]?"on":"off"}`} onClick={()=>{toggle(s.key);showToast(`${s.name} ${!toggles[s.key]?"enabled":"disabled"}`);}}/>
              </div>
            ))}
          </div>}

          {/* ── APPEARANCE ──────────────────────────────── */}
          {activeTab==="appearance"&&<div className="settings-card">
            <div className="settings-section-title">Appearance</div>
            <div className="settings-section-sub">Customize the look and feel — changes apply instantly</div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-name">Dark Mode</div>
                <div className="setting-desc">Toggle between dark background (default) and light mode</div>
              </div>
              <button className={`toggle ${toggles.darkMode?"on":"off"}`} onClick={()=>{
                const next = !toggles.darkMode;
                persistToggles({...toggles, darkMode:next});
                showToast(`${next?"Dark":"Light"} mode enabled`);
              }}/>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-name">Accent Color</div>
                <div className="setting-desc">Primary highlight color — click to apply immediately</div>
              </div>
              <div className="color-options">
                {["#e8ff47","#7c5cfc","#00d4aa","#ff6b35","#ff4466"].map(c=>(
                  <div key={c} className={`color-opt ${accentColor===c?"selected":""}`} style={{background:c}} onClick={()=>{
                    setAccentColor(c);
                    document.documentElement.style.setProperty("--accent", c);
                  }}/>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Typography</div><div className="setting-desc">Current font pairing for headings and body</div></div>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:13,color:"var(--text-muted)",background:"var(--surface2)",padding:"8px 14px",borderRadius:8,border:"1px solid var(--border)"}}>Syne + DM Sans</div>
            </div>
            <div className="setting-row" style={{paddingTop:18}}>
              <div className="setting-info"/>
              <button className="save-btn" onClick={applyAppearance}>Apply &amp; Save</button>
            </div>
          </div>}

          {/* ── SECURITY ────────────────────────────────── */}
          {activeTab==="security"&&<div className="settings-card">
            <div className="settings-section-title">Security &amp; Access</div>
            <div className="settings-section-sub">Change your password and manage your session</div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-name">Change Password</div>
                <div className="setting-desc">Update your account login password</div>
              </div>
              <div className="pwd-field-row">
                <input type="password" placeholder="Current password" value={currentPwd} onChange={e=>setCurrentPwd(e.target.value)}/>
                <input type="password" placeholder="New password (min 6 chars)" value={newPwd} onChange={e=>setNewPwd(e.target.value)}/>
                <input type="password" placeholder="Confirm new password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)}/>
                <button className="save-btn" onClick={changePassword} disabled={savingPwd} style={{width:"100%",marginTop:4}}>
                  {savingPwd ? <div className="spinner" style={{borderTopColor:"white",margin:"0 auto"}}/> : "Update Password"}
                </button>
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-name">JWT Secret</div>
                <div className="setting-desc">Token signing key — configure in backend .env</div>
              </div>
              <input className="setting-input" type="password" defaultValue="somesh_secret" readOnly style={{opacity:.5,cursor:"not-allowed"}}/>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-name">Active Session</div>
                <div className="setting-desc">Sign out from your current authenticated session</div>
              </div>
              <button className="danger-btn" onClick={onLogout}>Sign Out</button>
            </div>
          </div>}

          {/* ── DANGER ZONE ─────────────────────────────── */}
          {activeTab==="danger"&&<div className="settings-card danger">
            <div className="settings-section-title red">⚠️ Danger Zone</div>
            <div className="settings-section-sub">Irreversible actions — proceed with extreme caution</div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Clear All Claims</div><div className="setting-desc">Delete all MongoDB claim records. Blockchain state is unaffected.</div></div>
              <button className="danger-btn" onClick={()=>showToast("Requires admin role + DELETE /admin/claims","error")}>Clear Claims</button>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Reset Smart Contract</div><div className="setting-desc">Stop Hardhat node, restart, and redeploy the contract.</div></div>
              <button className="danger-btn" onClick={()=>showToast("Run: npx hardhat node && npx hardhat run scripts/deploy.js","error")}>Reset Contract</button>
            </div>
            <div className="setting-row">
              <div className="setting-info"><div className="setting-name">Delete Account</div><div className="setting-desc">Permanently remove your account from MongoDB.</div></div>
              <button className="danger-btn" onClick={()=>showToast("Add DELETE /user endpoint in index.js to enable this","error")}>Delete Account</button>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ── FIXED ───────────────────────────────────
export default function App() {
  const [page, setPage]     = useState("claims");
  const [claims, setClaims] = useState([]);
  const [toast, setToast]   = useState(null);

  // FIX: Initialize user/role from localStorage so refresh works
  const [user, setUser] = useState(() => localStorage.getItem("username") || null);
  const [role, setRole] = useState(() => localStorage.getItem("role") || "user");

  const showToast = useCallback((message, type="success") => setToast({ message, type }), []);

  const fetchClaims = useCallback(async () => {
    try { const res = await api.get("/claims"); setClaims(res.data); } catch {}
  }, []);

  // FIX: After login, verify role from /me endpoint to catch stale localStorage
  const verifyRole = useCallback(async () => {
    try {
      const res = await api.get("/me");
      const freshRole = res.data.role || "user";
      setRole(freshRole);
      localStorage.setItem("role", freshRole);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      fetchClaims();
      verifyRole(); // Always verify from backend on mount
    }
  }, [user, fetchClaims, verifyRole]);

  // Restore accent color and dark/light mode from localStorage on boot
  useEffect(() => {
    const savedColor = localStorage.getItem("accentColor");
    if (savedColor) document.documentElement.style.setProperty("--accent", savedColor);

    let toggles = {};
    try { toggles = JSON.parse(localStorage.getItem("appToggles")) || {}; } catch {}
    if (toggles.darkMode === false) document.body.classList.add("light-mode");
  }, []);

  const handleLogin = useCallback((username, userRole, token) => {
    setUser(username);
    setRole(userRole || "user");
    if (token) localStorage.setItem("token", token);
    localStorage.setItem("role", userRole || "user");
    localStorage.setItem("username", username);
  }, []);

  const handleLogout = () => {
    setUser(null); setRole("user"); setClaims([]);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    document.body.classList.remove("light-mode");
    setPage("claims");
  };

  const pendingCount = claims.filter(c=>c.status==="Pending"||!c.status).length;
  const isAdmin      = role === "admin";

  if (!user) return (
    <>
      <AuthPage onLogin={handleLogin} showToast={showToast} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </>
  );

  const navItems = [
    { id:"claims",    icon:"📋", label:"Claims" },
    { id:"analytics", icon:"📊", label:"Analytics" },
    { id:"explorer",  icon:"🔗", label:"Chain Explorer" },
    ...(isAdmin ? [{ id:"admin", icon:"🛡️", label:"Admin Panel", admin:true }] : []),
    { id:"settings",  icon:"⚙️", label:"Settings" },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-brand"><div className="sb-brand-icon">🛡️</div><div className="sb-brand-name">ChainInsure</div></div>
        <div className="sb-nav">
          <div className="sb-section">Navigation</div>
          {navItems.map(n=>(
            <div key={n.id} className={`sb-item ${n.admin?"admin-nav":""} ${page===n.id?"on":""}`} onClick={()=>setPage(n.id)}>
              <span className="sb-item-icon">{n.icon}</span>{n.label}
              {n.id==="claims"&&pendingCount>0&&<span className="sb-item-badge">{pendingCount}</span>}
              {n.id==="admin"&&<span className="sb-item-badge" style={{background:"var(--accent3)"}}>ADMIN</span>}
            </div>
          ))}
        </div>
        <div className="sb-user">
          <div className="sb-avatar">{user[0].toUpperCase()}</div>
          <div>
            <div className="sb-uname">{user}</div>
            <div className="sb-urole" style={isAdmin?{color:"var(--accent3)"}:{}}>{isAdmin?"Administrator":"Policyholder"}</div>
          </div>
          <button className="sb-logout" onClick={handleLogout} title="Sign out">↩</button>
        </div>
      </aside>

      <main className="main">
        {page==="claims"    && <ClaimsPage    claims={claims} fetchClaims={fetchClaims} showToast={showToast} />}
        {page==="analytics" && <AnalyticsPage claims={claims} />}
        {page==="explorer"  && <ExplorerPage  claims={claims} />}
        {page==="admin"     && isAdmin && <AdminPage showToast={showToast} />}
        {page==="settings"  && <SettingsPage
          user={user}
          role={role}
          onLogout={handleLogout}
          showToast={showToast}
          onUsernameChange={(name) => { setUser(name); localStorage.setItem("username", name); }}
        />}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  );
}