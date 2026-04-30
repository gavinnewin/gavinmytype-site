import { useState, useEffect, useRef } from "react";
import { collection, doc, onSnapshot, setDoc, updateDoc, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import "../styles/Links.css";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "changeme";

const DEFAULT_CATEGORIES = [
  { id: "newest",            name: "Newest Links",        order: 0, items: [] },
  { id: "storefront",        name: "Storefront/Wishlist", order: 1, items: [] },
  { id: "keyboard-websites", name: "Keyboard Websites",   order: 2, items: [] },
  { id: "affiliate-links",   name: "Affiliate Links",     order: 3, items: [] },
  { id: "keyboard-parts",    name: "Keyboard Parts",      order: 4, items: [] },
  { id: "product-links",     name: "Product Links",       order: 5, items: [] },
];

async function uploadImage(file) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Upload timed out — is Firebase Storage enabled in your project?")), 15000)
  );
  const storageRef = ref(storage, `link-images/${Date.now()}_${file.name}`);
  await Promise.race([uploadBytes(storageRef, file), timeout]);
  return getDownloadURL(storageRef);
}

function Links() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Admin state
  const [clickCount, setClickCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const clickTimer = useRef(null);

  // Per-category add-link form state
  const [addForms, setAddForms] = useState({});

  // Edit state
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", url: "", image: "", imageFile: null, imagePreview: "", subtitle: "" });
  const [saving, setSaving] = useState(false);

  // Drag-to-reorder
  const dragRef = useRef({ catId: null, fromIdx: null });
  const [dragOverKey, setDragOverKey] = useState(null);

  const handleDragStart = (catId, idx) => {
    dragRef.current = { catId, fromIdx: idx };
  };

  const handleDragOver = (e, catId, idx) => {
    e.preventDefault();
    setDragOverKey(`${catId}:${idx}`);
  };

  const handleDrop = async (catId, toIdx) => {
    const { fromIdx } = dragRef.current;
    setDragOverKey(null);
    if (fromIdx === null || fromIdx === toIdx) return;
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const newItems = [...cat.items];
    const [moved] = newItems.splice(fromIdx, 1);
    newItems.splice(toIdx, 0, moved);
    await updateDoc(doc(db, "categories", catId), { items: newItems });
    dragRef.current = { catId: null, fromIdx: null };
  };

  useEffect(() => {
    const seed = async () => {
      const validIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
      for (const cat of DEFAULT_CATEGORIES) {
        const r = doc(db, "categories", cat.id);
        const snap = await getDoc(r);
        if (!snap.exists()) {
          await setDoc(r, { name: cat.name, order: cat.order, items: [] });
        }
      }
      const all = await getDocs(collection(db, "categories"));
      for (const d of all.docs) {
        if (!validIds.has(d.id)) await deleteDoc(doc(db, "categories", d.id));
      }
    };
    seed();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snapshot) => {
      const cats = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.order - b.order);
      setCategories(cats);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ---------- profile click (5x = admin toggle) ----------
  const handleProfileClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClickCount(0), 2000);
    if (next >= 5) {
      setClickCount(0);
      if (isAdmin) setIsAdmin(false);
      else setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPasswordInput("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // ---------- Firestore helpers ----------
  const addLink = async (categoryId, title, url, imageFile, subtitle) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    let imageUrl = "";
    if (imageFile) imageUrl = await uploadImage(imageFile);
    const newItem = { id: Date.now().toString(), title, url, image: imageUrl, subtitle: subtitle || "" };
    await updateDoc(doc(db, "categories", categoryId), {
      items: [...(cat.items || []), newItem],
    });
  };

  const deleteLink = async (categoryId, itemId) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    await updateDoc(doc(db, "categories", categoryId), {
      items: cat.items.filter((item) => item.id !== itemId),
    });
  };

  const saveEdit = async (categoryId, itemId) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    setSaving(true);
    try {
      let imageUrl = editForm.image;
      if (editForm.imageFile) imageUrl = await uploadImage(editForm.imageFile);
      await updateDoc(doc(db, "categories", categoryId), {
        items: cat.items.map((item) =>
          item.id === itemId
            ? { ...item, title: editForm.title, url: editForm.url, image: imageUrl, subtitle: editForm.subtitle }
            : item
        ),
      });
      setEditingKey(null);
    } catch (err) {
      console.error("save failed:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- form helpers ----------
  const getForm = (catId) => addForms[catId] || { title: "", url: "", imageFile: null, imagePreview: "", subtitle: "" };
  const setForm = (catId, field, value) =>
    setAddForms((prev) => ({ ...prev, [catId]: { ...getForm(catId), [field]: value } }));

  const handleAddImageFile = (catId, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAddForms((prev) => ({ ...prev, [catId]: { ...getForm(catId), imageFile: file, imagePreview: preview } }));
  };

  const handleAddLink = async (e, catId) => {
    e.preventDefault();
    const { title, url, imageFile, subtitle } = getForm(catId);
    if (!title.trim() || !url.trim()) return;
    setSaving(true);
    try {
      await addLink(catId, title.trim(), url.trim(), imageFile, subtitle.trim());
      setAddForms((prev) => ({ ...prev, [catId]: { title: "", url: "", imageFile: null, imagePreview: "", subtitle: "" } }));
    } catch (err) {
      console.error("add failed:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (catId, item) => {
    setEditingKey(`${catId}:${item.id}`);
    setEditForm({ title: item.title || "", url: item.url || "", image: item.image || "", imageFile: null, imagePreview: "", subtitle: item.subtitle || "" });
  };

  const handleEditImageFile = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setEditForm((p) => ({ ...p, imageFile: file, imagePreview: preview }));
  };

  // ---------- search filter ----------
  const query = search.toLowerCase();
  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: (cat.items || []).filter((item) =>
        item.title.toLowerCase().includes(query)
      ),
    }))
    .filter((cat) => isAdmin || cat.items.length > 0 || !query);

  return (
    <div className="links-container animate-page">
      <div className="gradient wrapper">
        <div className="diagonal-gradient-line" />
        <img
          src="/images/ppf.jpg"
          className="pfp-links-mobile"
          alt="Profile"
          onClick={handleProfileClick}
        />
      </div>

      {/* Profile */}
      <div className="pfp-container">
        <div className="pfp-box">
          <img
            src="/images/ppf.jpg"
            className="pfp-links"
            alt="Profile"
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
          />
          <h1 className="h1-name">gavinmytype</h1>
          <p className="location"><i className="bx bx-map" /> bay area</p>
          <div className="email-button-container">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=gavinmytype@gmail.com" className="email-button">
              <i className="bx bx-envelope" /> Email
            </a>
          </div>
          <div className="social-icons">
            <a href="https://www.youtube.com/@gavinnmytype"         className="ig-link"><img src="/images/youtube.svg"     alt="YouTube" /></a>
            <a href="https://www.tiktok.com/@gavinmytype?lang=en"   className="tt-link"><img src="/images/tiktok-dark.svg" alt="TikTok" /></a>
            <a href="https://instagram.com/gavinmytype"             className="yt-link"><img src="/images/instagram.svg"   alt="Instagram" /></a>
            <a href="https://open.spotify.com/user/gavinnguyen2002" className="spot-link"><img src="/images/spotify.svg"   alt="Spotify" /></a>
            <a href="https://x.com/gavinmytype"                     className="x-link"><img src="/images/x-dark.svg"       alt="X" /></a>
            <a href="https://twitch.tv/gavinmytype"                 className="twitch-link"><img src="/images/twitch.svg"  alt="Twitch" /></a>
          </div>
          {isAdmin && <div className="admin-badge">admin mode</div>}
        </div>
      </div>

      {/* Search bar */}
      <div className="links-search-wrap">
        <div className="links-search-inner">
          <i className="bx bx-search links-search-icon" />
          <input
            className="links-search"
            type="text"
            placeholder="search links…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      {loading ? (
        <p className="links-loading">loading…</p>
      ) : (
        filteredCategories.map((cat) => (
          <div key={cat.id} className="links-section">
            <h2 className="links-h2">{cat.name}</h2>
            <div className="links-list">
              {cat.items.length > 0 ? (
                <div className="links-grid">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.id}:${item.id}`;
                    const isEditing = editingKey === key;
                    const isDragOver = dragOverKey === `${cat.id}:${idx}`;

                    return (
                      <div
                        key={item.id}
                        className={`link-row${isAdmin && !isEditing ? " draggable" : ""}${isDragOver ? " drag-over" : ""}`}
                        draggable={isAdmin && !isEditing}
                        onDragStart={() => handleDragStart(cat.id, idx)}
                        onDragOver={(e) => handleDragOver(e, cat.id, idx)}
                        onDrop={() => handleDrop(cat.id, idx)}
                        onDragLeave={() => setDragOverKey(null)}
                      >
                        {isEditing ? (
                          <div className="link-edit-form">
                            <input className="link-input" placeholder="title"
                              value={editForm.title}
                              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
                            <input className="link-input" placeholder="https://..."
                              value={editForm.url}
                              onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))} />
                            <input className="link-input" placeholder="subtitle (optional)"
                              value={editForm.subtitle}
                              onChange={(e) => setEditForm((p) => ({ ...p, subtitle: e.target.value }))} />
                            <label className="link-file-label">
                              {editForm.imagePreview || editForm.image
                                ? <img className="link-file-preview" src={editForm.imagePreview || editForm.image} alt="" />
                                : <span>+ image</span>}
                              <input type="file" accept="image/*" style={{ display: "none" }}
                                onChange={(e) => handleEditImageFile(e.target.files[0])} />
                            </label>
                            <div className="link-edit-actions">
                              <button className="link-add-btn" onClick={() => saveEdit(cat.id, item.id)} disabled={saving}>
                                {saving ? "saving…" : "save"}
                              </button>
                              <button className="link-cancel-btn" onClick={() => setEditingKey(null)}>cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <a href={item.url} className="link-card" target="_blank" rel="noopener noreferrer">
                              {item.image && (
                                <img className="link-card-img" src={item.image} alt="" />
                              )}
                              <span className="link-card-text">
                                <span className="link-card-title">{item.title}</span>
                                {item.subtitle && <span className="link-card-subtitle">{item.subtitle}</span>}
                              </span>
                              <span className="link-card-arrow">›</span>
                            </a>
                            {isAdmin && (
                              <div className="link-admin-btns">
                                <button className="link-edit" onClick={() => startEdit(cat.id, item)}>✎</button>
                                <button className="link-delete" onClick={() => deleteLink(cat.id, item.id)}>✕</button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                isAdmin && <p className="links-empty">no links yet</p>
              )}

              {isAdmin && (
                <form className="link-add-form" onSubmit={(e) => handleAddLink(e, cat.id)}>
                  <input className="link-input" placeholder="title"
                    value={getForm(cat.id).title}
                    onChange={(e) => setForm(cat.id, "title", e.target.value)} />
                  <input className="link-input" placeholder="https://..."
                    value={getForm(cat.id).url}
                    onChange={(e) => setForm(cat.id, "url", e.target.value)} />
                  <input className="link-input" placeholder="subtitle (optional)"
                    value={getForm(cat.id).subtitle}
                    onChange={(e) => setForm(cat.id, "subtitle", e.target.value)} />
                  <label className="link-file-label">
                    {getForm(cat.id).imagePreview
                      ? <img className="link-file-preview" src={getForm(cat.id).imagePreview} alt="" />
                      : <span>+ image</span>}
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => handleAddImageFile(cat.id, e.target.files[0])} />
                  </label>
                  <button className="link-add-btn" type="submit" disabled={saving}>
                    {saving ? "uploading…" : "+ add"}
                  </button>
                </form>
              )}
            </div>
          </div>
        ))
      )}

      {/* Password modal */}
      {showPasswordModal && (
        <div className="admin-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">admin login</h3>
            <form onSubmit={handlePasswordSubmit}>
              <input
                className={`admin-password-input ${passwordError ? "error" : ""}`}
                type="password"
                placeholder="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                autoFocus
              />
              {passwordError && <p className="admin-error">incorrect password</p>}
              <button className="admin-submit" type="submit">enter</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Links;
