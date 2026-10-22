"use client";
import { RbwWashSelection3D } from "@/component/rbw/3d/RbwWashSelection3D";
/** Scratch-only: RBW's carousel with DEFAULT props (no brand items) — must behave exactly as before. */
export default function Smoke() {
  return <div style={{ position: "fixed", inset: 0 }}><RbwWashSelection3D onWashSelect={() => {}} /></div>;
}
