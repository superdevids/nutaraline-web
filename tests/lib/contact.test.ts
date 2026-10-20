import { describe, expect, it } from "vitest";
import {
  contactTelegramChannel,
  contactWhatsApp,
  telegramChannelUrl,
  whatsAppUrl,
} from "@/lib/contact";

describe("contact channels", () => {
  it("builds a Telegram link and tolerates a leading @", () => {
    expect(telegramChannelUrl("nutaraline")).toBe("https://t.me/nutaraline");
    expect(telegramChannelUrl("@nutaraline")).toBe("https://t.me/nutaraline");
    expect(telegramChannelUrl()).toBe(
      `https://t.me/${contactTelegramChannel.replace(/^@/, "")}`,
    );
  });

  it("strips formatting characters from the WhatsApp number", () => {
    expect(whatsAppUrl("+62 812-3456-7890")).toBe("https://wa.me/6281234567890");
    expect(whatsAppUrl()).toBe(
      `https://wa.me/${contactWhatsApp.replace(/\D/g, "")}`,
    );
  });
});
