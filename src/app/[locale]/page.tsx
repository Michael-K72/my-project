import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { ActBooking } from "@/scenes/home/ActBooking";
import { ActCapabilities } from "@/scenes/home/ActCapabilities";
import { ActCommerceTeaser } from "@/scenes/home/ActCommerceTeaser";
import { ActConfiguratorTeaser } from "@/scenes/home/ActConfiguratorTeaser";
import { ActHero } from "@/scenes/home/ActHero";
import { ActNetwork } from "@/scenes/home/ActNetwork";
import { ActPortalTeaser } from "@/scenes/home/ActPortalTeaser";
import { ActStatement } from "@/scenes/home/ActStatement";
import { ActSystem } from "@/scenes/home/ActSystem";
import { ParticleShape } from "@/three/state";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="main">
      <ActHero />
      <ActStatement />
      <ActSystem />
      <ActCapabilities />
      <ActConfiguratorTeaser />
      <ActCommerceTeaser />
      <ActNetwork />
      <ActPortalTeaser />
      <ActBooking />
      <Footer from={ParticleShape.RINGS} />
    </main>
  );
}
