import React, { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../services/adminApi";
import type { Service } from "../../services/adminApi";
import styles from "./AdminServicesPage.module.css";

const CATEGORIES = ["tyre", "maintenance", "repair"] as const;
type Category = typeof CATEGORIES[number];

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "tyre" as Category,
  duration_minutes: 30,
  price: "",
  is_active: true,
};

export const AdminServicesPage = () => {
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState("");
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Service | null>(null);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [saving, setSaving]       = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.fetchAllServices();
      setServices(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || "",
      category: s.category,
      duration_minutes: s.duration_minutes,
      price: s.price != null ? String(s.price) : "",
      is_active: s.is_active,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await adminApi.removeService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      showToast("Service deleted");
    } catch (e: any) {
      setError(e.message || "Delete failed");
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      duration_minutes: Number(form.duration_minutes),
      price: form.price !== "" ? Number(form.price) : undefined,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        const updated = await adminApi.updateService(editing.id, payload);
        setServices(prev => prev.map(s => s.id === editing.id ? updated : s));
        showToast("Service updated");
      } else {
        const created = await adminApi.createService(payload);
        setServices(prev => [...prev, created]);
        showToast("Service created");
      }
      setModalOpen(false);
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || s.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Services</h1>
        <button className={styles.newBtn} onClick={openCreate}>+ New service</button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input className={styles.filterInput} placeholder="Search by name..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect}
          value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Category</th>
              <th>Duration</th><th>Price</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.loading}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No services found</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td><strong>{s.name}</strong>{s.description && <div style={{fontSize:"0.78rem",color:"#64748b",marginTop:"0.15rem"}}>{s.description}</div>}</td>
                <td><span className={`${styles.categoryBadge} ${styles[s.category]}`}>{s.category}</span></td>
                <td>{s.duration_minutes} min</td>
                <td>{s.price != null ? `€${Number(s.price).toFixed(2)}` : "—"}</td>
                <td><span className={`${styles.activeBadge} ${s.is_active ? styles.active : styles.inactive}`}>{s.is_active ? "Active" : "Inactive"}</span></td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => openEdit(s)}>Edit</button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(s.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editing ? "Edit service" : "New service"}</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Name *</label>
                <input className={styles.input} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.textarea} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Category</label>
                  <select className={styles.select} value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Duration (min)</label>
                  <input className={styles.input} type="number" min={5} value={form.duration_minutes}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Price (EUR)</label>
                  <input className={styles.input} type="number" min={0} step={0.01} placeholder="Optional"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <select className={styles.select} value={form.is_active ? "active" : "inactive"}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "active" }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            {error && <div className={styles.errorBox} style={{marginTop:"1rem"}}>{error}</div>}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save service"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
};

export default AdminServicesPage;