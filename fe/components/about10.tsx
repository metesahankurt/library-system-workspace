import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

const profile = {
  title: "Kütüphane Sistemi",
  subtitle: "Bilgiye erişimi kolaylaştırıyoruz",
  bio: `Kütüphane Sistemi, okuyucuların kitaplara kolayca ulaşmasını, kütüphanecilerin ise koleksiyonu verimli şekilde yönetmesini sağlamak amacıyla geliştirilmiş modern bir dijital kütüphane platformudur. Misyonumuz; bilgiyi herkes için erişilebilir kılmak ve okuma kültürünü yaşatmaktır.`,
  vision: `Teknolojinin gücüyle geleneksel kütüphane deneyimini dijital çağa taşıyoruz. Okuyuculara kişiselleştirilmiş öneri sistemleri, kütüphanecilere ise kapsamlı yönetim araçları sunarak bilgiye erişimi demokratikleştirmeyi hedefliyoruz.`,
  outro: `Binlerce okuyucuya ve kütüphaneciye ev sahipliği yapan platformumuza katılın. Birlikte okuma sevgisini ve bilgi paylaşımını büyütelim.`,
  team: [
    { id: "01", item: "Genel Müdür", type: "Yönetim" },
    { id: "02", item: "Kütüphane Müdürü", type: "Operasyon" },
    { id: "03", item: "Kataloglama Uzmanı", type: "Teknik Hizmetler" },
    { id: "04", item: "Referans Kütüphanecisi", type: "Okuyucu Hizmetleri" },
    { id: "05", item: "Dijital Hizmetler Uzmanı", type: "Teknoloji" },
    { id: "06", item: "Çocuk ve Gençlik Kütüphanecisi", type: "Etkinlik" },
    { id: "07", item: "Arşiv Uzmanı", type: "Koruma & Arşiv" },
  ],
};

interface About10Props {
  className?: string;
}

const About10 = ({ className }: About10Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex flex-col-reverse gap-5 md:flex-row md:gap-12">
          <div className="w-full md:w-1/3 md:pr-4">
            <div className="sticky top-20 md:p-6">
              <div className="mb-8">
                <div className="mb-6 flex items-center gap-4">
                  <img
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg"
                    alt="Kütüphane Sistemi"
                    className="h-16 w-16 rounded-lg object-cover dark:invert"
                  />
                  <div>
                    <h3 className="font-semibold">{profile.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <nav>
                <a href="/contact">
                  <div className="py-4">
                    <div className="group flex p-0 text-start text-xl font-medium hover:bg-transparent sm:text-2xl">
                      <span className="border-b-2 border-border pb-0.5 transition-colors">
                        Bize Ulaşın
                      </span>
                      <ArrowUpRight className="ml-1 h-6 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </a>
              </nav>
            </div>
          </div>

          <div className="w-full md:w-2/3 md:p-6">
            <div className="max-w-4xl">
              <h1 className="mb-12 text-7xl font-semibold">Hakkımızda</h1>

              <div className="space-y-12">
                <p className="w-full text-2xl leading-[36px] font-medium md:max-w-2xl">
                  {profile.bio}
                </p>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                  <h2 className="text-2xl font-medium">Temel Felsefemiz</h2>
                  <p className="leading-relaxed">{profile.vision}</p>
                </div>

                <div className="my-12">
                  <img
                    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/bw12.jpeg"
                    alt="Kütüphane"
                    className="rounded-2xl object-cover"
                  />
                </div>

                <div>
                  <h2 className="mb-8 text-2xl font-medium">Ekibimiz</h2>
                  <div className="space-y-6">
                    {profile.team.map(({ id, item, type }) => (
                      <div
                        key={id}
                        className="flex items-center justify-between border-b py-4"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-muted-foreground">
                            {id}
                          </span>
                          <span className="text-base">{item}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-16">
                  <p className="leading-relaxed">{profile.outro}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { About10 };
