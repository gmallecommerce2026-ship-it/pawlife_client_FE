import { COLOR, FONT_BODY, FONT_HEAD } from "@/lib/site";

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${COLOR.border}`,
  fontSize: 14, fontFamily: FONT_BODY, color: COLOR.ink, background: "#fff", outline: "none",
};

export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: COLOR.ink }}>{label}</label>
      {children}
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading} className="transition hover:-translate-y-0.5 active:scale-[0.97]"
      style={{ backgroundColor: COLOR.brand, color: "#fff", padding: "14px 24px", borderRadius: 999, fontSize: 14, fontWeight: 700, fontFamily: FONT_BODY, border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 10px 25px rgba(240,158,91,.3)" }}>
      {loading ? "Đang gửi..." : children}
    </button>
  );
}

export function StatusMessage({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p role={ok ? "status" : "alert"} style={{ padding: "12px 14px", borderRadius: 12, fontSize: 14, fontFamily: FONT_BODY, background: ok ? "#DCFCE7" : "#FEE2E2", color: ok ? "#166534" : "#991B1B" }}>{children}</p>
  );
}