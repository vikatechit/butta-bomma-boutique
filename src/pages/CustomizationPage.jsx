import Seo from '../components/Seo';
import Customization from '../components/Customization';

export default function CustomizationPage() {
  return (
    <div className="page-pad">
      <Seo
        title="Custom Stitching | Butta Bomma Collections"
        description="Choose your fabric, style, colour and design. Our master tailors stitch your dream outfit to your measurements."
      />
      <Customization />
    </div>
  );
}
