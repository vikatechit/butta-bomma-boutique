import Seo from '../components/Seo';
import Story from '../components/Story';
import Benefits from '../components/Benefits';

export default function About() {
  return (
    <div className="page-pad">
      <Seo
        title="Our Heritage | Butta Bomma Collections"
        description="Royal Indian traditions woven into modern silhouettes, crafted with generational weavers across India."
      />
      <Story />
      <Benefits />
    </div>
  );
}
