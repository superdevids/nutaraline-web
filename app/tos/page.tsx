import { Suspense } from "react";
import { Scale } from "lucide-react";
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
      id: "acceptance",
      heading: "Acceptance of terms",
      paragraphs: [
        "By creating an API key or sending a request to the gateway you agree to these terms. If you are accepting on behalf of an organisation, you confirm you have authority to bind it.",
      ],
    },
    {
      id: "service",
      heading: "The service",
      paragraphs: [
        "nutaraline routes inference requests to third-party providers. We do not train models and we do not control provider output.",
        "Availability depends on upstream providers. We aim for high availability but do not guarantee uninterrupted service unless a separate written agreement states otherwise.",
      ],
    },
    {
      id: "accounts",
      heading: "Keys, balance, and billing",
      paragraphs: [
        "An API key is both a credential and a billing unit. Balance added to a key cannot be transferred to another key.",
        "Usage is billed per token at the rate in effect when the request is served. Charges are non-refundable except where required by law or where a billing error is proven.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      paragraphs: [
        "You must not use the gateway to generate content that is illegal in your jurisdiction, to circumvent provider safety systems, or to attempt to extract model weights.",
        "You are responsible for the prompts you send and for any content you distribute from model output.",
      ],
    },
    {
      id: "data",
      heading: "Requests and data",
      paragraphs: [
        "We retain request metadata — timestamps, token counts, model, status — to operate the service and produce usage records.",
        "Prompt and completion content are retained only as long as needed to process a request, unless you enable a debugging log explicitly.",
      ],
    },
    {
      id: "liability",
      heading: "Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, our aggregate liability is limited to the amount you paid in the three months preceding the claim.",
        "We are not liable for indirect or consequential loss, including lost profits or lost data.",
      ],
    },
    {
      id: "termination",
      heading: "Suspension and termination",
      paragraphs: [
        "We may suspend a key that violates these terms or presents a security risk. Remaining balance on a suspended key is returned where the suspension was not caused by the key holder's breach.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      paragraphs: [
        "Material changes are announced at least 30 days before taking effect. Continued use after the effective date constitutes acceptance.",
      ],
    },
  ],
  id: [
    {
      id: "acceptance",
      heading: "Penerimaan ketentuan",
      paragraphs: [
        "Dengan membuat kunci API atau mengirim permintaan ke gateway, Anda menyetujui ketentuan ini. Jika Anda menerima atas nama organisasi, Anda menyatakan berwenang untuk mengikat organisasi tersebut.",
      ],
    },
    {
      id: "service",
      heading: "Layanan",
      paragraphs: [
        "nutaraline meneruskan permintaan inferensi ke penyedia pihak ketiga. Kami tidak melatih model dan tidak mengendalikan keluaran penyedia.",
        "Ketersediaan bergantung pada penyedia hulu. Kami menargetkan ketersediaan tinggi, tetapi tidak menjamin layanan tanpa gangguan kecuali diatur dalam perjanjian tertulis terpisah.",
      ],
    },
    {
      id: "accounts",
      heading: "Kunci, saldo, dan tagihan",
      paragraphs: [
        "Kunci API berfungsi sekaligus sebagai kredensial dan satuan tagihan. Saldo yang ditambahkan ke satu kunci tidak dapat dipindahkan ke kunci lain.",
        "Pemakaian ditagih per token sesuai tarif yang berlaku saat permintaan dilayani. Biaya tidak dapat dikembalikan kecuali diwajibkan hukum atau terdapat kesalahan penagihan yang terbukti.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Penggunaan yang dapat diterima",
      paragraphs: [
        "Anda dilarang menggunakan gateway untuk menghasilkan konten yang melanggar hukum di yurisdiksi Anda, menghindari sistem keamanan penyedia, atau mencoba mengekstraksi bobot model.",
        "Anda bertanggung jawab atas prompt yang Anda kirim dan konten yang Anda distribusikan dari keluaran model.",
      ],
    },
    {
      id: "data",
      heading: "Permintaan dan data",
      paragraphs: [
        "Kami menyimpan metadata permintaan — waktu, jumlah token, model, status — untuk mengoperasikan layanan dan menyusun catatan pemakaian.",
        "Isi prompt dan keluaran hanya disimpan selama diperlukan untuk memproses permintaan, kecuali Anda secara eksplisit mengaktifkan log debugging.",
      ],
    },
    {
      id: "liability",
      heading: "Batasan tanggung jawab",
      paragraphs: [
        "Sejauh diizinkan hukum, tanggung jawab kami secara keseluruhan dibatasi pada jumlah yang Anda bayarkan dalam tiga bulan sebelum klaim.",
        "Kami tidak bertanggung jawab atas kerugian tidak langsung, termasuk kehilangan keuntungan atau kehilangan data.",
      ],
    },
    {
      id: "termination",
      heading: "Penangguhan dan penghentian",
      paragraphs: [
        "Kami dapat menangguhkan kunci yang melanggar ketentuan ini atau menimbulkan risiko keamanan. Saldo tersisa dikembalikan apabila penangguhan bukan disebabkan pelanggaran oleh pemegang kunci.",
      ],
    },
    {
      id: "changes",
      heading: "Perubahan ketentuan",
      paragraphs: [
        "Perubahan material diumumkan paling lambat 30 hari sebelum berlaku. Penggunaan berkelanjutan setelah tanggal berlaku dianggap sebagai persetujuan.",
      ],
    },
  ],
};

async function TosContent() {
  const { dict, locale } = await getDictionary();

  return (
    <LegalPage
      title={dict.legal.tosTitle}
      subtitle={dict.legal.tosSubtitle}
      sections={content[locale]}
      badgeLabel={dict.nav.tos}
      badgeIcon={Scale}
      dict={dict}
    />
  );
}

export default function TosPage() {
  return (
    <Suspense fallback={<PageLoading variant="article" />}>
      <TosContent />
    </Suspense>
  );
}
