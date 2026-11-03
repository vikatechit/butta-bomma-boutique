import Seo from '../components/Seo';
import HowToOrder from '../components/HowToOrder';

export default function How() {
  return (
    <div className="page-pad">
      <Seo
        title="How to Order | Butta Bomma Collections"
        description="Choose your piece, add it to your bag, place your order and confirm on WhatsApp. Free Pan-India delivery."
      />
      <HowToOrder />
    </div>
  );
}
