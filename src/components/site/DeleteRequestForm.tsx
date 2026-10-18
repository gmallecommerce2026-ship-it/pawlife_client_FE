'use client';
import { useState } from "react";
import axiosClient from "@/lib/api/axiosClient";
import { Field, StatusMessage, SubmitButton, inputStyle } from "./FormBits";
import { CONTACT } from "@/lib/site";

export default function DeleteRequestForm() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return;
    setState("loading");
    try {
      // TODO backend: POST /public/account-deletion-requests { email, reason }
      // Gửi email xác nhận có link/OTP tới đúng địa chỉ đăng ký, chỉ xóa sau khi xác minh.
      await axiosClient.post("/public/account-deletion-requests", { email: String(fd.get("email")).trim(), reason: String(fd.get("reason") || "").trim() });
      setState("ok");
      e.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Email đã đăng ký tài khoản" htmlFor="d-email"><input id="d-email" name="email" type="email" required autoComplete="email" style={inputStyle} /></Field>
      <Field label="Lý do (không bắt buộc)" htmlFor="d-reason"><textarea id="d-reason" name="reason" rows={3} maxLength={500} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <label className="flex items-start gap-3" style={{ fontSize: 14, lineHeight: 1.5 }}>
        <input type="checkbox" name="confirm" required style={{ marginTop: 4 }} />
        <span>Tôi hiểu rằng việc xóa tài khoản là vĩnh viễn và không thể hoàn tác.</span>
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state === "ok" && <StatusMessage ok>Chúng tôi đã gửi email xác nhận. Vui lòng bấm vào liên kết trong email để hoàn tất yêu cầu.</StatusMessage>}
      {state === "error" && <StatusMessage ok={false}>Không gửi được yêu cầu. Vui lòng email {CONTACT.privacyEmail} để được hỗ trợ.</StatusMessage>}
      <div><SubmitButton loading={state === "loading"}>Gửi yêu cầu xóa tài khoản</SubmitButton></div>
    </form>
  );
}