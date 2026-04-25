import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default async function Test3DPage() {
  redirect(ROUTES.lab.root);
}
