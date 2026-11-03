import Seo from '../components/Seo';
import Reviews from '../components/Reviews';

export default function ReviewsPage() {
  return (
    <div className="page-pad">
      <Seo title="Client Reviews | Butta Bomma Collections" description="Looks and reviews from Butta Bomma patrons across India." />
      <Reviews />
    </div>
  );
}
