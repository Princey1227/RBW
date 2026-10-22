"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";

export const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg";
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Mirrors the server limits for fast feedback; the server remains authoritative. */
export function checkFile(f: File, maxBytes: number): string | null {
  if (!OK_TYPES.includes(f.type) && !/\.(png|jpe?g|webp|svg)$/i.test(f.name)) return `"${f.name}" is not a PNG, JPG, WebP or SVG.`;
  if (f.size > maxBytes) return `"${f.name}" is larger than ${Math.round(maxBytes / 1048576)} MB.`;
  if (f.size === 0) return `"${f.name}" is empty.`;
  return null;
}

function usePreviews(files: File[]) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return urls;
}

interface Props {
  label: string;
  hint: string;
  files: File[];
  onChange: (files: File[]) => void;
  onError: (msg: string) => void;
  multiple?: boolean;
  maxBytes: number;
  max?: number;
  id: string;
}

export default function ImagePicker({ label, hint, files, onChange, onError, multiple, maxBytes, max = 30, id }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const urls = usePreviews(files);

  function add(list: FileList | null) {
    if (!list) return;
    const incoming: File[] = [];
    for (const f of Array.from(list)) {
      const err = checkFile(f, maxBytes);
      if (err) { onError(err); continue; }
      incoming.push(f);
    }
    if (!incoming.length) return;
    const next = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
    if (next.length > max) { onError(`At most ${max} images at once.`); onChange(next.slice(0, max)); return; }
    onChange(next);
    if (input.current) input.current.value = "";
  }
  const move = (i: number, d: -1 | 1) => {
    const n = [...files]; const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]]; onChange(n);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300">{label}</label>
        <span className="text-[11px] text-zinc-500">{hint}</span>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
        className="rounded-[3px] border border-dashed border-white/20 bg-white/[0.03] p-3"
      >
        <input id={id} ref={input} type="file" accept={ACCEPT} multiple={multiple} className="sr-only" onChange={(e) => add(e.target.files)} />
        <button type="button" onClick={() => input.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-[2px] border border-white/15 px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200 hover:border-[#c5a059] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c5a059]">
          <ImagePlus size={16} strokeWidth={1.5} /> {files.length ? (multiple ? "Add more images" : "Replace image") : "Choose or drop image" + (multiple ? "s" : "")}
        </button>

        {files.length > 0 && (
          <ul className={`mt-3 grid gap-2 ${multiple ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1"}`}>
            {files.map((f, i) => (
              <li key={`${f.name}-${f.size}-${i}`} className="group relative overflow-hidden rounded-[2px] border border-white/10 bg-[#f1eee8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urls[i]} alt={f.name} className={`w-full object-contain ${multiple ? "aspect-[3/4]" : "h-24"}`} />
                <span className="absolute left-1 top-1 rounded-[2px] bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">{multiple ? i + 1 : "Logo"}</span>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 p-1">
                  {multiple ? (
                    <span className="flex gap-1">
                      <button type="button" aria-label={`Move image ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-white disabled:opacity-30 hover:bg-white/20"><ArrowUp size={12} /></button>
                      <button type="button" aria-label={`Move image ${i + 1} later`} disabled={i === files.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-white disabled:opacity-30 hover:bg-white/20"><ArrowDown size={12} /></button>
                    </span>
                  ) : <span />}
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => onChange(files.filter((_, k) => k !== i))} className="rounded p-1 text-white hover:bg-red-500/70"><X size={12} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
