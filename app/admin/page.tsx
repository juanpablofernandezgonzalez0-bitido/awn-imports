"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { LogOut, Save, Plus, Trash2, Upload, Settings, Package, Eye, Search } from "lucide-react";
import ImageGallery from "@/components/admin/ImageGallery";
import AjustesTab from "@/components/admin/AjustesTab";

type Tab = "productos" | "ajustes";

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("productos");
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [site, setSite] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/session").then((r) => r.json()).then((d) => { setAuth(d.authorized); setLoading(false); });
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (res.ok) setAuth(true); else setPwError("Contrasena incorrecta");
  };

  useEffect(() => {
    if (!auth) return;
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/site").then((r) => r.json()),
    ]).then(([p, s]) => {
      setProducts(p);
      setSite(s);
      setEditing(p[0] ?? null);
    });
  }, [auth]);

  const saveProducts = async (prods: any[]) => {
    setSaving(true);
    await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prods) }).catch(() => {});
    setProducts(prods);
    setSaving(false);
  };

  const saveSite = async (s: any) => {
    setSaving(true);
    await fetch("/api/admin/site", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) }).catch(() => {});
    setSite(s);
    setSaving(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
        reader.readAsDataURL(file);
      });
      return dataUrl;
    } catch {
      alert("No se pudo leer la imagen. Intenta con otra foto.");
      return null;
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-neutral-50"><p className="text-neutral-400">Cargando...</p></div>;

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl ring-1 ring-neutral-200">
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Panel de administracion</h1>
          <p className="mt-2 text-sm text-neutral-500">Ingresa tu contrasena para continuar.</p>
          <input type="password" placeholder="Contrasena" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-6 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10" autoFocus />
          {pwError && <p className="mt-2 text-xs text-red-500">{pwError}</p>}
          <button type="submit" className="mt-6 w-full rounded-full bg-neutral-900 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-700">Entrar</button>
        </form>
      </div>
    );
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="AWN" width={32} height={32} className="h-8 w-8 object-contain" />
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">AWN Admin</h2>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-neutral-400">Guardando...</span>}
          <a href="/" target="_blank" className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold uppercase text-neutral-600 transition hover:bg-neutral-200"><Eye size={14} /> Ver sitio</a>
          <button onClick={logout} className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold uppercase text-neutral-600 transition hover:bg-neutral-200"><LogOut size={14} /> Salir</button>
        </div>
      </header>

      <div className="border-b border-neutral-200 bg-white px-6">
        <div className="mx-auto flex max-w-7xl gap-1">
          {([["productos", Package], ["ajustes", Settings]] as [Tab, any][]).map(([key, Icon]) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold uppercase tracking-wider transition ${tab === key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-700"}`}>
              <Icon size={16} /> {key}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === "productos" && site && (
          <ProductosTab
            products={filtered}
            allProducts={products}
            editing={editing}
            setEditing={setEditing}
            saveProducts={saveProducts}
            uploadImage={uploadImage}
            search={search}
            setSearch={setSearch}
          />
        )}
        {tab === "ajustes" && site && <AjustesTab site={site} saveSite={saveSite} />}
      </div>
    </div>
  );
}

function ProductosTab({ products, allProducts, editing, setEditing, saveProducts, uploadImage, search, setSearch }: {
  products: any[]; allProducts: any[]; editing: any; setEditing: (p: any) => void; saveProducts: (p: any[]) => void;
  uploadImage: (f: File) => Promise<string | null>; search: string; setSearch: (s: string) => void;
}) {
  const [draft, setDraft] = useState<any>({ ...editing });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft({ ...editing }); }, [editing?.id]);

  const update = (key: string, value: any) => setDraft((prev: any) => ({ ...prev, [key]: value }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      const allImages = draft.images ? [...draft.images] : (draft.image ? [draft.image] : []);
      allImages.push(url);
      update("images", allImages);
      update("image", allImages[0]);
    } else {
      setUploadError("No se pudo subir la imagen");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addImageToGallery = (url: string) => {
    const allImages = draft.images ? [...draft.images] : (draft.image ? [draft.image] : []);
    if (!allImages.includes(url)) {
      allImages.push(url);
      update("images", allImages);
      update("image", allImages[0]);
    }
  };

  const removeImage = (index: number) => {
    const allImages = draft.images ? [...draft.images] : (draft.image ? [draft.image] : []);
    allImages.splice(index, 1);
    update("images", allImages);
    update("image", allImages[0] ?? "");
  };

  const reorderImage = (from: number, to: number) => {
    const allImages = draft.images ? [...draft.images] : (draft.image ? [draft.image] : []);
    const [moved] = allImages.splice(from, 1);
    allImages.splice(to, 0, moved);
    update("images", allImages);
    update("image", allImages[0]);
  };

  const getAllImages = (): string[] => {
    if (draft.images && draft.images.length > 0) return draft.images;
    if (draft.image) return [draft.image];
    return [];
  };

  const addProduct = () => {
    const id = `new-${Date.now()}`;
    const p = { id, name: "Nueva prenda", category: "Sin categoria", price: 0, image: "", images: [], description: "", sizes: ["S", "M", "L", "XL"] };
    saveProducts([...allProducts, p]);
    setEditing(p);
  };

  const deleteProduct = (id: string) => {
    if (!confirm("Eliminar esta prenda?")) return;
    const updated = allProducts.filter((p) => p.id !== id);
    saveProducts(updated);
    if (editing?.id === id) setEditing(updated[0] ?? null);
  };

  const saveDraft = () => {
    const updated = allProducts.map((p) => (p.id === draft.id ? draft : p));
    saveProducts(updated);
    setEditing(draft);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Buscar prenda..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-neutral-900" />
        </div>
        {products.map((p) => (
          <button key={p.id} onClick={() => setEditing(p)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${editing?.id === p.id ? "bg-neutral-900 text-white" : "bg-white text-neutral-900 ring-1 ring-neutral-200 hover:ring-neutral-400"}`}>
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
              {p.image ? (
                p.image.startsWith("data:") ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                )
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-neutral-400">?</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{p.name}</p>
              <p className={`text-xs ${editing?.id === p.id ? "text-neutral-300" : "text-neutral-400"}`}>${p.price?.toLocaleString("es-CO")} - {p.category}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }} className="shrink-0 rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
          </button>
        ))}
        <button onClick={addProduct} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 p-4 text-sm font-bold uppercase text-neutral-400 transition hover:border-neutral-900 hover:text-neutral-900"><Plus size={16} /> Agregar prenda</button>
      </div>

      {draft && (
        <div className="rounded-3xl bg-white p-6 ring-1 ring-neutral-200 sm:p-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-[280px_1fr]">
            <div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
                {draft.image ? (
                  draft.image.startsWith("data:") ? (
                    <img src={draft.image} alt={draft.name} className="h-full w-full object-cover" />
                  ) : (
                    <Image src={draft.image} alt={draft.name} fill className="object-cover" />
                  )
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
                    <Upload size={32} />
                    <span className="text-xs font-bold uppercase">Sin foto</span>
                  </div>
                )}
              </div>

              {getAllImages().length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {getAllImages().map((img, i) => (
                    <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-neutral-900">
                      {img.startsWith("data:") ? (
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                      )}
                      <button onClick={() => removeImage(i)} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow">x</button>
                      {i > 0 && <button onClick={() => reorderImage(i, i - 1)} className="absolute left-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white text-[10px] font-bold">&#9664;</button>}
                      {i < getAllImages().length - 1 && <button onClick={() => reorderImage(i, i + 1)} className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white text-[10px] font-bold">&#9654;</button>}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold uppercase transition ${uploading ? "bg-neutral-200 text-neutral-400 cursor-wait" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
                >
                  <Upload size={16} /> {uploading ? "Procesando..." : "Subir foto"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  disabled={uploading}
                  style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}
                />
              </div>
              {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
              <ImageGallery current={draft.image} onSelect={addImageToGallery} />
            </div>

            <div className="space-y-5">
              <Field label="Nombre" value={draft.name} onChange={(v) => update("name", v)} />
              <Field label="Categoria" value={draft.category} onChange={(v) => update("category", v)} />

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Precios</p>
                <Field label="Precio de venta (COP)" type="number" value={draft.price} onChange={(v) => update("price", Number(v))} />
                <div>
                  <Field label="Precio original / sin descuento (COP)" type="number" value={draft.originalPrice ?? ""} onChange={(v) => update("originalPrice", v ? Number(v) : undefined)} />
                  <p className="mt-1 text-[10px] text-neutral-400">Si es mayor al precio de venta, se muestra como oferta</p>
                </div>
                {draft.originalPrice && draft.originalPrice > draft.price && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      -{Math.round((1 - draft.price / draft.originalPrice) * 100)}% OFF
                    </span>
                    <span className="text-[11px] font-bold text-red-600">
                      Se verá en rojo con precio tachado
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => update("outOfStock", !draft.outOfStock)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${draft.outOfStock ? "bg-red-500" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${draft.outOfStock ? "translate-x-5" : ""}`} />
                </button>
                <div>
                  <p className="text-sm font-bold">Agotado</p>
                  <p className="text-[11px] text-neutral-400">{draft.outOfStock ? "Prenda no disponible para venta" : "Prenda disponible"}</p>
                </div>
              </div>
              <Field label="Etiqueta (opcional)" value={draft.tag ?? ""} onChange={(v) => update("tag", v || undefined)} />
              <Field label="Descripcion" value={draft.description} onChange={(v) => update("description", v)} multiline />
              <Field label="Tallas (separadas por coma)" value={(draft.sizes ?? []).join(", ")} onChange={(v) => update("sizes", v.split(",").map((s: string) => s.trim()).filter(Boolean))} />
              <button onClick={saveDraft} className="mt-2 flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-700"><Save size={16} /> Guardar cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline = false }: { label: string; value: any; onChange: (v: string) => void; type?: string; multiline?: boolean; }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-neutral-400">{label}</label>
      {multiline ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10" />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10" />
      )}
    </div>
  );
}