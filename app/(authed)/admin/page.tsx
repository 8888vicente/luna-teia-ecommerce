/**
 * app/(authed)/admin/page.tsx
 *
 * Redirect de /admin -> /admin/crm.
 * El dashboard real vive en /admin/crm (page.tsx con la
 * logica del panel de control).
 */

import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/admin/crm");
}