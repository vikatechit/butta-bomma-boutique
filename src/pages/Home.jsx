import Seo from '../components/Seo';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import Categories from '../components/Categories';
import Products from '../components/Products';
import Customization from '../components/Customization';
import HowToOrder from '../components/HowToOrder';
import Reviews from '../components/Reviews';
import Story from '../components/Story';

export default function Home() {
  return (
    <>
      <Seo
        title="Butta Bomma Collections | Royal Indian Ethnic Couture"
        description="Designer sarees, bridal lehengas, festive dresses, kurtis, anarkali suits and accessories. Free Pan-India delivery, UPI and Cash On Delivery."
      />
      <Hero />
      <Benefits />
      <Categories />
      <Products />
      <Customization />
      <HowToOrder />
      <Reviews />
      <Story />
    </>
  );
}
