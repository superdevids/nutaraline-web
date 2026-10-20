import { redirect } from "next/navigation";

/** The site has no marketing home page — monitoring is the entry point. */
export default function Home() {
  redirect("/monitoring");
}
