import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Products from '../components/Products';
import { useStore } from '../context/Store';

export default function Shop() {
  const { slug } = useParams();
  const { filterCategory, setPriceTier, categories } = useStore();
  const category = categories.find((c) => c.slug === slug);

  useEffect(() => {
    if (slug) filterCategory(slug);
    else {
      filterCategory('all');
      setPriceTier('all');
    }
  }, [slug, filterCategory, setPriceTier]);

  const label = category?.title || 'Collections';

  return (
    <div className="page-pad">
      <Seo
        title={`${label} | Butta Bomma Collections`}
        description="Shop sarees, lehengas, dresses, kurtis, suits and accessories by category and price. Free Pan-India delivery."
      />
      <Products />
    </div>
  );
}
