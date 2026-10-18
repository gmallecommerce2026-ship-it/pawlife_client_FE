'use client';
import { useState } from "react";
import axiosClient from "@/lib/api/axiosClient";
import { Field, StatusMessage, SubmitButton, inputStyle } from "./FormBits";
import { CONTACT } from "@/lib/site";

const TOPICS = ["Hỗ trợ ứng dụng", "Thẻ QR", "Nhận nuôi", "Trở thành trạm cứu hộ / đối tác", "Báo lỗi", "Khác"];

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // honeypot
    setState("loading");
    try {
      // TODO backend: POST /public/contact { name, email, topic, message }
      await axiosClient.post("/public/contact", {
        name: String(fd.get("name")).trim(),
        email: String(fd.get("email")).trim(),
        topic: fd.get("topic"),
        message: String(fd.get("message")).trim(),
      });
      setState("ok");
      e.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Họ và tên" htmlFor="c-name"><input id="c-name" name="name" required minLength={2} maxLength={80} autoComplete="name" style={inputStyle} /></Field>
        <Field label="Email" htmlFor="c-email"><input id="c-email" name="email" type="email" required autoComplete="email" style={inputStyle} /></Field>
      </div>
      <Field label="Chủ đề" htmlFor="c-topic">
        <select id="c-topic" name="topic" defaultValue={TOPICS[0]} style={inputStyle}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
      </Field>
      <Field label="Nội dung" htmlFor="c-msg"><textarea id="c-msg" name="message" required minLength={10} maxLength={2000} rows={5} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state === "ok" && <StatusMessage ok>Cảm ơn bạn! PawLife sẽ phản hồi trong vòng 1–2 ngày làm việc.</StatusMessage>}
      {state === "error" && <StatusMessage ok={false}>Gửi không thành công. Vui lòng thử lại hoặc email trực tiếp tới {CONTACT.email}.</StatusMessage>}
      <div><SubmitButton loading={state === "loading"}>Gửi tin nhắn</SubmitButton></div>
    </form>
  );
}