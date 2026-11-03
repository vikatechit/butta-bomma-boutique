import { useState } from 'react';
import Seo from '../components/Seo';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useStore } from '../context/Store';

function AdminLogin() {
  const { handleAdminLogin } = useStore();
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setBusy(true);
    await handleAdminLogin(fd.get('username').toString().trim(), fd.get('password').toString());
    setBusy(false);
  };

  return (
    <section className="section-container page-pad">
      <div className="rks-panel admin-login-panel">
        <div className="admin-login-header text-center">
          <span className="admin-shield-icon">🔐</span>
          <h2>Boutique Admin Portal</h2>
          <p>Private Atelier Management Login</p>
        </div>
        <form className="luxury-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="adminUsername">Admin Username</label>
            <input type="text" id="adminUsername" name="username" defaultValue="admin" autoComplete="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="adminPassword">Passcode / Password</label>
            <div className="pw-field">
              <input
                type={showPw ? 'text' : 'password'}
                id="adminPassword"
                name="password"
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button type="submit" className="gold-luxury-btn btn-full" style={{ marginTop: 12 }} disabled={busy}>
            {busy ? 'CHECKING…' : 'ENTER CONTROL ROOM ›'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function Admin() {
  const { isAdmin } = useStore();
  return (
    <>
      <Seo title="Admin | Butta Bomma Collections" noindex />
      {isAdmin ? <AdminDashboard /> : <AdminLogin />}
    </>
  );
}
