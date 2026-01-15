// app/(admin)/a/page.tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/a/teachers");
}
