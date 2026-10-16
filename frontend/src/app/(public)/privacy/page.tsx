import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Политика обработки персональных данных",
  description:
    "Какие данные собираются при отправке заявки на занятия, зачем и как они обрабатываются, а также права пользователя.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: "Политика обработки данных" }]}
        title="Политика обработки персональных данных"
        description="Как обрабатываются данные, которые вы оставляете в форме заявки на занятия."
      />

      <Section>
        <div className="border-line bg-surface max-w-[68ch] rounded-xl border p-6 md:p-8">
          <p className="text-ink-soft text-sm">
            Это проект документа. Перед публикацией сайта необходимо указать
            реквизиты оператора и проверить соответствие применимым требованиям
            законодательства (в том числе, при необходимости, уведомление
            Роскомнадзора об обработке персональных данных). Наличие этой страницы
            не заменяет такую проверку.
          </p>
        </div>
      </Section>

      <Section bordered={false} className="pt-0">
        <div className="max-w-[68ch] space-y-10">
          <div>
            <h2 className="heading-3 mb-4">1. Оператор</h2>
            <p className="text-ink-soft">
              Оператором персональных данных является владелец сайта, оказывающий
              индивидуальные занятия по математике и информатике (далее —
              «Оператор»). Точные реквизиты Оператора указываются перед запуском
              сайта и публикуются на этой странице.
            </p>
          </div>

          <div>
            <h2 className="heading-3 mb-4">2. Какие данные обрабатываются</h2>
            <p className="text-ink-soft">
              При отправке формы заявки вы можете указать:
            </p>
            <ul className="text-ink-soft mt-4 list-disc space-y-2 pl-5">
              <li>контакт для связи (телефон, e-mail или Telegram) — обязательно;</li>
              <li>экзамен (ОГЭ, ЕГЭ или другое) — обязательно;</li>
              <li>имя, предмет и комментарий — по желанию;</li>
              <li>согласие на обработку данных — обязательно.</li>
            </ul>
            <p className="text-ink-soft mt-4">
              Также автоматически может обрабатываться псевдонимизированный
              идентификатор IP-адреса (необратимый хэш) в целях защиты от спама.
            </p>
          </div>

          <div>
            <h2 className="heading-3 mb-4">3. Цели обработки</h2>
            <p className="text-ink-soft">
              Данные используются только для того, чтобы связаться с вами по
              поводу заявки и организовать занятия. Они не передаются третьим
              лицам и не используются для рассылок без отдельного согласия.
            </p>
          </div>

          <div>
            <h2 className="heading-3 mb-4">4. Правовое основание</h2>
            <p className="text-ink-soft">
              Обработка выполняется на основании вашего согласия, которое вы даёте,
              отмечая соответствующий пункт при отправке заявки.
            </p>
          </div>

          <div>
            <h2 className="heading-3 mb-4">5. Сроки хранения</h2>
            <p className="text-ink-soft">
              Данные хранятся не дольше, чем это необходимо для обработки заявки и
              организации занятий. По вашему запросу данные могут быть удалены
              досрочно.
            </p>
          </div>

          <div>
            <h2 className="heading-3 mb-4">6. Ваши права</h2>
            <p className="text-ink-soft">Вы вправе:</p>
            <ul className="text-ink-soft mt-4 list-disc space-y-2 pl-5">
              <li>запросить сведения об обрабатываемых данных;</li>
              <li>потребовать их исправления или удаления;</li>
              <li>отозвать согласие на обработку.</li>
            </ul>
            <p className="text-ink-soft mt-4">
              Для этого напишите Оператору — контакты указаны на странице{" "}
              <Link href="/podgotovka" className="text-accent hover:underline">
                занятий
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
