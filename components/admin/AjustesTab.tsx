"use client";

import { useState } from "react";
import { Save } from "lucide-react";

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200">
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-neutral-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function AjustesTab({ site, saveSite }: { site: any; saveSite: (s: any) => void }) {
  const [draft, setDraft] = useState<any>({ ...site });
  const update = (key: string, value: any) => setDraft((prev: any) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-neutral-500">Edita la informacion del sitio. Al guardar se actualiza la pagina publica.</p>

      <Section title="Identidad">
        <Field label="Nombre del sitio" value={draft.name} onChange={(v) => update("name", v)} />
        <Field label="Tagline" value={draft.tagline} onChange={(v) => update("tagline", v)} />
        <Field label="Texto barra de anuncio" value={draft.announcement} onChange={(v) => update("announcement", v)} multiline />
      </Section>

      <Section title="Hero (pagina principal)">
        <Field label="Linea 1" value={draft.heroTitle} onChange={(v) => update("heroTitle", v)} />
        <Field label="Linea 2" value={draft.heroLine2} onChange={(v) => update("heroLine2", v)} />
        <Field label="Palabra resaltada" value={draft.heroHighlight} onChange={(v) => update("heroHighlight", v)} />
        <Field label="Subtitulo" value={draft.heroSubtitle} onChange={(v) => update("heroSubtitle", v)} multiline />
        <Field label="Texto boton CTA" value={draft.ctaLabel} onChange={(v) => update("ctaLabel", v)} />
      </Section>

      <Section title="Nosotros">
        <Field label="Titulo" value={draft.aboutTitle} onChange={(v) => update("aboutTitle", v)} />
        <Field label="Descripcion" value={draft.aboutText} onChange={(v) => update("aboutText", v)} multiline />
      </Section>

      <Section title="Marquee (cinta animada)">
        <Field label="Elementos (uno por linea)" value={(draft.marquee ?? []).join("\n")} onChange={(v) => update("marquee", v.split("\n").map((s: string) => s.trim()).filter(Boolean))} multiline />
      </Section>

      <Section title="Contacto">
        <Field label="WhatsApp (codigo + numero)" value={draft.whatsapp} onChange={(v) => update("whatsapp", v)} />
        <Field label="Instagram" value={draft.instagram} onChange={(v) => update("instagram", v)} />
        <Field label="TikTok" value={draft.tiktok} onChange={(v) => update("tiktok", v)} />
        <Field label="Email" value={draft.email} onChange={(v) => update("email", v)} />
      </Section>

      <Section title="Footer">
        <Field label="Texto del footer" value={draft.footerTagline} onChange={(v) => update("footerTagline", v)} />
      </Section>

      <button onClick={() => saveSite(draft)} className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-700"><Save size={16} /> Guardar ajustes</button>
    </div>
  );
}
