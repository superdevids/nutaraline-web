import { Suspense } from "react";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/page-loading";
import { NotificationList } from "@/components/notification/notification-list";
import { getNotifications } from "@/lib/dummy";
import { getDictionary } from "@/lib/i18n/server";

async function NotificationContent() {
  const { dict, locale } = await getDictionary();
  const notifications = await getNotifications();

  const now = new Date(Date.UTC(2026, 9, 20, 0, 0, 0)).toISOString();

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          <Bell aria-hidden size={13} />
          {dict.nav.notification}
        </div>
        <PageHeader
          title={dict.notification.title}
          subtitle={dict.notification.subtitle}
        />
      </div>
      <NotificationList
        notifications={notifications}
        dict={dict}
        locale={locale}
        now={now}
      />
    </>
  );
}

export default function NotificationPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6">
      <Suspense fallback={<PageLoading variant="list" />}>
        <NotificationContent />
      </Suspense>
    </div>
  );
}
