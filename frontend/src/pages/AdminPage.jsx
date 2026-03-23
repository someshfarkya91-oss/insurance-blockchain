// src/pages/AdminPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../api";

const API_BASE = "http://localhost:8000";

/* ── tiny local styles injected once ── */
const adminStyles = `
  .admin-tabs { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
  .admin-tab { padding:10px 20px; border-radius:10px; border:1px solid var(--border); background:var(--surface); color:var(--text-muted); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; }
  .admin-tab:hover { border-color:var(--border-hover); color:var(--text); }
  .admin-tab.on { background:rgba(124,92,252,.12); color:var(--accent3); border-color:rgba(124,92,252,.3); }

  .adm-table { background:var(--surface); border:1px solid var(--border); border-radius:18px; overflow:hidden; }
  .adm-thead { display:grid; padding:12px 20px; background:var(--surface2); border-bottom:1px solid var(--border); }
  .adm-thead span { font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; }
  .adm-row { display:grid; padding:14px 20px; border-bottom:1px solid var(--border); align-items:center; transition:background .15s; gap:12px; }
  .adm-row:last-child { border-bottom:none; }
  .adm-row:hover { background:var(--surface2); }

  /* claims table: 120px 1fr 1fr 110px 180px 100px */
  .adm-claims .adm-thead, .adm-claims .adm-row { grid-template-columns: 90px 1fr 1fr 100px 200px 110px; }
  /* users table: 1fr 1fr 100px 120px */
  .adm-users .adm-thead, .adm-users .adm-row { grid-template-columns: 1fr 1fr 90px 110px; }

  .adm-mono { font-family:'DM Mono',monospace; font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .adm-reason { font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .adm-img-thumb { width:48px; height:36px; object-fit:cover; border-radius:6px; border:1px solid var(--border); }
  .adm-no-img { width:48px; height:36px; background:var(--surface2); border-radius:6px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:16px; }

  .action-row { display:flex; gap:6px; }
  .btn-approve { padding:6px 13px; background:transparent; border:1px solid var(--green); color:var(--green); border-radius:7px; font-size:11.5px; font-weight:600; cursor:pointer; transition:all .2s; white-space:nowrap; }
  .btn-approve:hover { background:var(--green); color:#080810; }
  .btn-reject { padding:6px 13px; background:transparent; border:1px solid rgba(255,68,102,.4); color:var(--red); border-radius:7px; font-size:11.5px; font-weight:600; cursor:pointer; transition:all .2s; white-space:nowrap; }
  .btn-reject:hover { background:rgba(255,68,102,.1); }

  .adm-filter-row { display:flex; gap:10px; margin-bottom:16px; align-items:center; flex-wrap:wrap; }
  .adm-filter-select { padding:9px 13px; background:var(--surface); border:1px solid var(--border); border-radius:9px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px; outline:none; cursor:pointer; }
  .adm-filter-select:focus { border-color:var(--accent3); }
  .adm-search { flex:1; min-width:160px; padding:9px 13px; background:var(--surface); border:1px solid var(--border); border-radius:9px; color:var(--text); font-family:'DM Mono',monospace; font-size:12px; outline:none; }
  .adm-search:focus { border-color:var(--accent3); }
  .adm-danger-btn { padding:9px 18px; background:transparent; border:1px solid rgba(255,68,102,.35); color:var(--red); border-radius:9px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; }
  .adm-danger-btn:hover { background:rgba(255,68,102,.1); }

  .reject-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; z-index:9000; animation:fadeUp .25s ease both; }
  .reject-modal { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:28px; width:400px; }
  .reject-modal h3 { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; margin-bottom:14px; }
  .reject-modal textarea { width:100%; padding:12px 14px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:13.5px; outline:none; resize:none; min-height:90px; margin-bottom:16px; }
  .reject-modal-btns { display:flex; gap:10px; justify-content:flex-end; }
  .modal-cancel { padding:9px 18px; background:transparent; border:1px solid var(--border); color:var(--text-muted); border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; }
  .modal-confirm { padding:9px 18px; background:var(--red); color:white; border:none; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; }
`;

if (!document.getElementById("admin-styles")) {
  const s = document.createElement("style");
  s.id = "admin-styles";
  s.textContent = adminStyles;
  document.head.appendChild(s);
}

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    Pending:  { cls: "pending",  icon: "⏳" },
    Approved: { cls: "approved", icon: "✅" },
    Rejected: { cls: "badge",    icon: "❌", extra: { background:"rgba(255,68,102,.1)", color:"var(--red)", border:"1px solid rgba(255,68,102,.2)" } },
  };
  const s = map[status] || map.Pending;
  return (
    <span className={`badge ${s.cls}`} style={s.extra}>
      <div className="badge-dot" />{status || "Pending"}
    </span>
  );
}

/* ── Reject modal ── */
function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div className="reject-modal-overlay">
      <div className="reject-modal">
        <h3>❌ Reject Claim</h3>
        <textarea
          placeholder="Enter reason for rejection..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="reject-modal-btns">
          <button className="modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-confirm" onClick={() => onConfirm(reason)}>
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN PAGE
══════════════════════════════════════════ */
export default function AdminPage({ showToast }) {
  const [activeTab, setActiveTab] = useState("claims");
  const [claims, setClaims]       = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch]       = useState("");
  const [rejectTarget, setRejectTarget] = useState(null); // { claimId, index }

  /* ── fetch ── */
  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/claims");
      setClaims(res.data);
    } catch { showToast("Failed to load claims", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch { showToast("Failed to load users", "error"); }
  }, [showToast]);

  useEffect(() => { fetchClaims(); fetchUsers(); }, [fetchClaims, fetchUsers]);

  /* ── actions ── */
  const approveClaim = async (claimId, index) => {
    try {
      await api.post("/approve", { claimId, index });
      showToast("Claim approved on-chain! ✅");
      fetchClaims();
    } catch { showToast("Approve failed", "error"); }
  };

  const rejectClaim = async (reason) => {
    try {
      await api.post("/reject", { claimId: rejectTarget.claimId, reason });
      showToast("Claim rejected");
      setRejectTarget(null);
      fetchClaims();
    } catch { showToast("Reject failed", "error"); }
  };

  const clearAllClaims = async () => {
    if (!window.confirm("Delete ALL claim records from MongoDB? (blockchain unaffected)")) return;
    try {
      await api.delete("/admin/claims");
      showToast("All claims cleared");
      fetchClaims();
    } catch { showToast("Failed to clear claims", "error"); }
  };

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      showToast(`Role updated to ${role}`);
      fetchUsers();
    } catch { showToast("Failed to update role", "error"); }
  };

  /* ── derived ── */
  const filteredClaims = claims
    .filter(c => statusFilter === "All" || c.status === statusFilter)
    .filter(c =>
      !search ||
      c.reason?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.toLowerCase().includes(search.toLowerCase())
    );

  const stats = {
    total:    claims.length,
    pending:  claims.filter(c => c.status === "Pending").length,
    approved: claims.filter(c => c.status === "Approved").length,
    rejected: claims.filter(c => c.status === "Rejected").length,
  };

  return (
    <div>
      {/* Page header */}
      <div className="ph">
        <div className="ph-tag orange">🛡️ Admin</div>
        <div className="ph-title">Admin <em>Panel</em></div>
        <div className="ph-sub">Manage claims, users, and system settings</div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {[
          { icon:"📋", val:stats.total,    lbl:"Total Claims",    cls:"c1" },
          { icon:"⏳", val:stats.pending,  lbl:"Pending Review",  cls:"c2" },
          { icon:"✅", val:stats.approved, lbl:"Approved",        cls:"c3" },
          { icon:"❌", val:stats.rejected, lbl:"Rejected",        cls:"c4" },
        ].map((s,i) => (
          <div key={i} className={`stat-card ${s.cls}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {["claims","users"].map(t => (
          <button key={t} className={`admin-tab ${activeTab===t?"on":""}`} onClick={() => setActiveTab(t)}>
            {t === "claims" ? "📋 Claims Management" : "👥 User Management"}
          </button>
        ))}
      </div>

      {/* ── CLAIMS TAB ── */}
      {activeTab === "claims" && (
        <>
          <div className="adm-filter-row">
            <select className="adm-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {["All","Pending","Approved","Rejected"].map(s => <option key={s}>{s}</option>)}
            </select>
            <input className="adm-search" placeholder="Search reason or address..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="adm-danger-btn" onClick={clearAllClaims}>🗑 Clear All</button>
          </div>

          {loading ? (
            <div className="empty"><div className="empty-ico">⏳</div><div className="empty-txt">Loading claims...</div></div>
          ) : filteredClaims.length === 0 ? (
            <div className="empty"><div className="empty-ico">📭</div><div className="empty-txt">No claims found</div></div>
          ) : (
            <div className="adm-table adm-claims">
              <div className="adm-thead">
                <span>#</span><span>User Address</span><span>Reason</span><span>Evidence</span><span>Status</span><span>Actions</span>
              </div>
              {filteredClaims.map((c, i) => (
                <div key={c._id || i} className="adm-row">
                  <div className="adm-mono">#{String(i+1).padStart(3,"0")}</div>
                  <div className="adm-mono">{c.user ? `${c.user.slice(0,8)}…${c.user.slice(-4)}` : "—"}</div>
                  <div className="adm-reason" title={c.reason}>{c.reason}</div>
                  <div>
                    {c.image
                      ? <img src={`${API_BASE}/uploads/${c.image}`} alt="Evidence" className="adm-img-thumb" />
                      : <div className="adm-no-img">📷</div>
                    }
                  </div>
                  <div><StatusBadge status={c.status} /></div>
                  <div className="action-row">
                    {(c.status === "Pending" || !c.status) && <>
                      <button className="btn-approve" onClick={() => approveClaim(c._id, i)}>✓ Approve</button>
                      <button className="btn-reject"  onClick={() => setRejectTarget({ claimId: c._id, index: i })}>✕ Reject</button>
                    </>}
                    {c.status === "Approved" && <span style={{fontSize:12,color:"var(--green)"}}>✅ Done</span>}
                    {c.status === "Rejected" && <span style={{fontSize:12,color:"var(--red)"}} title={c.rejectionReason}>❌ Rejected</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <div className="adm-table adm-users">
          <div className="adm-thead">
            <span>Username</span><span>Email</span><span>Role</span><span>Change Role</span>
          </div>
          {users.length === 0 && (
            <div className="empty"><div className="empty-ico">👥</div><div className="empty-txt">No users found</div></div>
          )}
          {users.map((u) => (
            <div key={u._id} className="adm-row">
              <div style={{fontSize:13, fontWeight:600}}>{u.username}</div>
              <div className="adm-mono">{u.email}</div>
              <div>
                <span style={{
                  padding:"4px 10px", borderRadius:100, fontSize:11, fontWeight:700,
                  background: u.role==="admin" ? "rgba(124,92,252,.12)" : "rgba(0,212,170,.08)",
                  color: u.role==="admin" ? "var(--accent3)" : "var(--accent4)",
                  border: u.role==="admin" ? "1px solid rgba(124,92,252,.25)" : "1px solid rgba(0,212,170,.2)",
                }}>
                  {u.role || "user"}
                </span>
              </div>
              <div>
                {u.role === "admin"
                  ? <button className="btn-reject" onClick={() => changeRole(u._id, "user")}>→ Demote</button>
                  : <button className="btn-approve" onClick={() => changeRole(u._id, "admin")}>→ Promote</button>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          onConfirm={rejectClaim}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}