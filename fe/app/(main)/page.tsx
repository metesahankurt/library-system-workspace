import { Hero245 } from '@/components/hero245';
import { Footer50 } from '@/components/footer50';
import { HeroSquareSlider } from '@/components/hero-square-slider';

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSquareSlider />
      <Hero245 />
      <Footer50 />
    </main>
  );
}
