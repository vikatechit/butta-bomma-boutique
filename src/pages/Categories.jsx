import Seo from '../components/Seo';
import CategoriesGrid from '../components/Categories';

export default function Categories() {
  return (
    <div className="page-pad">
      <Seo
        title="Shop by Category | Butta Bomma Collections"
        description="Royal sarees, bridal lehengas, festive dresses, designer kurtis, anarkali suits and zari accessories."
      />
      <CategoriesGrid />
    </div>
  );
}
