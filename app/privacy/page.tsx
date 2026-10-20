import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { LegalPage } from "@/components/legal/legal-page";
import { PageLoading } from "@/components/ui/page-loading";
import { getDictionary } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n";

const content: Record<
  Locale,
  { id: string; heading: string; paragraphs: string[] }[]
> = {
  en: [
    {
      id: "scope",
      heading: "Scope",
      paragraphs: [
        "This policy explains what nutaraline collects when you use the website and the gateway API, and what we do with it.",
      ],
    },
    {
      id: "collected",
      heading: "What we collect",
      paragraphs: [
        "Account data: the API keys you create, their creation time, and their status.",
        "Usage data: request timestamps, model, token counts, latency, status code, and cost.",
        "Payment data: the amount and reference of a top-up. Card data never reaches our servers — it is handled by the payment provider.",
        "Technical data: IP address and user agent, retained for abuse prevention.",
      ],
    },
    {
      id: "prompts",
      heading: "Prompt content",
      paragraphs: [
        "Prompt and completion content are processed to serve the request and are not used to train models.",
        "Content is retained only transiently unless you opt in to debugging logs, which are retained for 30 days and can be deleted on request.",
      ],
    },
    {
      id: "providers",
      heading: "Sharing with providers",
      paragraphs: [
        "To answer a request we must send it to an upstream provider. That provider processes the content under its own terms.",
        "We do not sell personal data, and we do not share data with advertisers.",
      ],
    },
    {
      id: "retention",
      heading: "Retention",
      paragraphs: [
        "Usage records are retained for 24 months so you can reconcile invoices.",
        "Security events are retained for 12 months.",
        "Deleting a key removes its credential immediately but does not erase historical usage records attached to it.",
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      paragraphs: [
        "You can request access to, correction of, or deletion of your personal data. Where a legal obligation requires retention, we will explain what we must keep and for how long.",
      ],
    },
    {
      id: "security",
      heading: "Security",
      paragraphs: [
        "Keys are stored hashed and cannot be recovered — only replaced. Traffic is encrypted in transit with TLS 1.2 or later.",
        "No system is perfectly secure. Report suspected vulnerabilities to security@nutaraline.co.uk rather than disclosing them publicly.",
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      paragraphs: [
        "Questions about this policy can be sent to privacy@nutaraline.co.uk. We respond within 30 days.",
      ],
    },
  ],
  id: [
    {
      id: "scope",
      heading: "Ruang lingkup",
      paragraphs: [
        "Kebijakan ini menjelaskan data yang dikumpulkan nutaraline ketika Anda menggunakan situs dan gateway API, serta bagaimana kami memperlakukannya.",
      ],
    },
    {
      id: "collected",
      heading: "Data yang dikumpulkan",
      paragraphs: [
        "Data akun: kunci API yang Anda buat, waktu pembuatannya, dan statusnya.",
        "Data pemakaian: waktu permintaan, model, jumlah token, latensi, kode status, dan biaya.",
        "Data pembayaran: nominal dan referensi top up. Data kartu tidak pernah mencapai server kami — ditangani oleh penyedia pembayaran.",
        "Data teknis: alamat IP dan user agent, disimpan untuk mencegah penyalahgunaan.",
      ],
    },
    {
      id: "prompts",
      heading: "Isi prompt",
      paragraphs: [
        "Isi prompt dan keluaran diproses untuk melayani permintaan dan tidak digunakan untuk melatih model.",
        "Konten hanya disimpan secara sementara kecuali Anda mengaktifkan log debugging, yang disimpan 30 hari dan dapat dihapus atas permintaan.",
      ],
    },
    {
      id: "providers",
      heading: "Berbagi dengan penyedia",
      paragraphs: [
        "Untuk menjawab permintaan, kami harus mengirimkannya ke penyedia hulu. Penyedia tersebut memproses konten berdasarkan ketentuannya sendiri.",
        "Kami tidak menjual data pribadi dan tidak membagikan data kepada pengiklan.",
      ],
    },
    {
      id: "retention",
      heading: "Masa penyimpanan",
      paragraphs: [
        "Catatan pemakaian disimpan 24 bulan agar Anda dapat merekonsiliasi invoice.",
        "Peristiwa keamanan disimpan 12 bulan.",
        "Menghapus kunci akan mencabut kredensialnya seketika, tetapi tidak menghapus catatan pemakaian historis yang terkait.",
      ],
    },
    {
      id: "rights",
      heading: "Hak Anda",
      paragraphs: [
        "Anda dapat meminta akses, perbaikan, atau penghapusan data pribadi Anda. Jika kewajiban hukum mengharuskan penyimpanan, kami akan menjelaskan apa yang harus disimpan dan berapa lama.",
      ],
    },
    {
      id: "security",
      heading: "Keamanan",
      paragraphs: [
        "Kunci disimpan dalam bentuk hash dan tidak dapat dipulihkan — hanya diganti. Lalu lintas data dienkripsi dengan TLS 1.2 atau lebih tinggi.",
        "Tidak ada sistem yang sepenuhnya aman. Laporkan dugaan kerentanan ke security@nutaraline.co.uk, jangan diungkapkan secara publik.",
      ],
    },
    {
      id: "contact",
      heading: "Kontak",
      paragraphs: [
        "Pertanyaan tentang kebijakan ini dapat dikirim ke privacy@nutaraline.co.uk. Kami merespons dalam 30 hari.",
      ],
    },
  ],
};

async function PrivacyContent() {
  const { dict, locale } = await getDictionary();

  return (
    <LegalPage
      title={dict.legal.privacyTitle}
      subtitle={dict.legal.privacySubtitle}
      sections={content[locale]}
      badgeLabel={dict.nav.privacy}
      badgeIcon={ShieldCheck}
      dict={dict}
    />
  );
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<PageLoading variant="article" />}>
      <PrivacyContent />
    </Suspense>
  );
}
