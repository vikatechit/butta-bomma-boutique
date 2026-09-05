/**
 * BUTTA BOMMA COLLECTIONS - PDF POLICY GENERATOR
 * Generates official PDF documents for all 6 Customer Service policies
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const POLICIES_DIR = path.join(__dirname, 'policies');
if (!fs.existsSync(POLICIES_DIR)) {
  fs.mkdirSync(POLICIES_DIR, { recursive: true });
}

const policiesData = [
  {
    filename: 'about-us.pdf',
    title: 'ABOUT US — BUTTA BOMMA COLLECTIONS',
    sections: [
      {
        heading: '1. The Butta Bomma Heritage',
        text: 'Born out of deep reverence for India\'s monumental handloom traditions, Butta Bomma Collections curates heirloom-quality sarees, bridal lehengas, festive anarkalis, and bespoke couture. Every piece is handcrafted by generational master artisans across Kanchipuram, Banaras, Chanderi, and Surat.'
      },
      {
        heading: '2. Generational Craftsmanship & Ethical Fair Trade',
        text: 'We work directly with weaver cooperatives and generational artisan clusters. By eliminating middlemen, we guarantee fair wages to our weavers while offering authentic, uncompromised pure zari and mulberry silk to our global patrons.'
      },
      {
        heading: '3. Bespoke Custom Tailoring & Fit Guarantee',
        text: 'Every celebration is unique. Our in-house master tailors provide customized blouse stitching, fall-pico, custom waist & flare tailoring, and personalized design modifications.'
      },
      {
        heading: '4. Contact & Boutique Concierge',
        text: 'WhatsApp / Phone: +91 73828 91980\nEmail: buttabommaonline@gmail.com\nInstagram: @shirae_boutique\nAddress: India (Pan-India Delivery)'
      }
    ]
  },
  {
    filename: 'shipping-policy.pdf',
    title: 'SHIPPING & DISPATCH POLICY',
    sections: [
      {
        heading: '1. Free Pan-India Shipping',
        text: 'We offer complimentary express shipping across all states and union territories in India on all prepaid and Cash On Delivery (COD) orders.'
      },
      {
        heading: '2. Dispatch Timelines',
        text: 'Ready-to-wear pieces: Dispatched within 24 to 48 business hours.\nCustom tailored / stitched pieces: Dispatched within 3 to 5 business days after measurement confirmation.'
      },
      {
        heading: '3. Trusted Courier Partners & Tracking',
        text: 'Orders are shipped via top-tier express couriers (Bluedart, Delhivery, DTDC, XpressBees). As soon as your piece is dispatched, an automated tracking ID and link will be sent to your WhatsApp number.'
      },
      {
        heading: '4. Cash On Delivery (COD) Token',
        text: 'For COD orders, a nominal advance booking token (decided on order confirmation) is payable via UPI to verify address accuracy and prevent transit returns.'
      }
    ]
  },
  {
    filename: 'return-exchange.pdf',
    title: 'RETURN, EXCHANGE & REFUND POLICY',
    sections: [
      {
        heading: '1. 7-Day Exchange & Return Window',
        text: 'We take pride in our heirloom craftsmanship. If you receive a damaged, defective, or incorrect piece, you may request an exchange or return within 7 calendar days of delivery.'
      },
      {
        heading: '2. Eligibility Conditions',
        text: 'The piece must be unworn, unwashed, with all original tags, authenticity seals, and luxury packaging intact. An unboxing video recorded at the time of opening the parcel is required to process claims for transit damages.'
      },
      {
        heading: '3. Custom Tailored Outfits',
        text: 'Pieces custom-stitched to personalized client body measurements are eligible for complimentary size alterations rather than direct returns.'
      },
      {
        heading: '4. Refund Processing',
        text: 'Once the returned piece passes quality inspection at our atelier, refunds are processed directly to your original payment method or bank UPI within 3 to 5 business days.'
      }
    ]
  },
  {
    filename: 'terms-conditions.pdf',
    title: 'TERMS & CONDITIONS OF SERVICE',
    sections: [
      {
        heading: '1. Overview & Agreement',
        text: 'These terms govern the use of the Butta Bomma Collections website and the purchase of handcrafted couture. By browsing or placing an order, you agree to these terms.'
      },
      {
        heading: '2. Handcrafted Variations',
        text: 'Our pieces are authentic handloom and hand-embroidered items. Slight variations in weave textures, zari luster, and handcrafted embroidery are natural hallmarks of authentic artisan craft rather than defects.'
      },
      {
        heading: '3. Pricing & Payment',
        text: 'All prices are listed in Indian Rupees (INR) inclusive of applicable taxes. We accept UPI payments and Cash On Delivery (COD). We reserve the right to correct any typographical pricing errors.'
      },
      {
        heading: '4. Governing Law & Jurisdiction',
        text: 'These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in India.'
      }
    ]
  },
  {
    filename: 'privacy-policy.pdf',
    title: 'PRIVACY & DATA PROTECTION POLICY',
    sections: [
      {
        heading: '1. Commitment to Customer Privacy',
        text: 'At Butta Bomma Collections, customer privacy is paramount. We collect only the information necessary to fulfill your orders, provide tailoring assistance, and communicate dispatch updates.'
      },
      {
        heading: '2. Information We Collect',
        text: 'Contact details (Name, WhatsApp Mobile Number, Delivery Address, Pincode) and order preferences (sizes, measurements, tailoring notes). We do NOT store credit card details or banking passwords on our servers.'
      },
      {
        heading: '3. Protection of Customer Data',
        text: 'Customer records are stored in secure databases. We never sell, rent, or trade your personal data with third-party advertisers.'
      },
      {
        heading: '4. Contact Grievance Officer',
        text: 'For any data privacy inquiries or requests, contact: buttabommaonline@gmail.com / WhatsApp +91 73828 91980.'
      }
    ]
  },
  {
    filename: 'faqs.pdf',
    title: 'FREQUENTLY ASKED QUESTIONS (FAQS)',
    sections: [
      {
        heading: 'Q1: Are all your sarees authentic handloom silk?',
        text: 'A: Yes! Every saree and lehenga is hand-woven by master weavers in India using authentic silk and genuine gold/silver-plated zari.'
      },
      {
        heading: 'Q2: How do I select my size or get custom stitching?',
        text: 'A: You can select your standard size from the product dropdown, or choose "Custom Fit". You can also leave your measurements in the notes or message us on WhatsApp (+91 73828 91980) for one-on-one styling.'
      },
      {
        heading: 'Q3: How does Cash On Delivery (COD) work?',
        text: 'A: Select COD during checkout. Our boutique manager will confirm your address on WhatsApp. A nominal advance booking token is paid via UPI to secure dispatch, and the remaining balance is paid at your doorstep.'
      },
      {
        heading: 'Q4: What are the wash & care instructions for pure silk?',
        text: 'A: We strongly recommend professional dry cleaning for all pure silk sarees, zardozi lehengas, and tissue fabrics. Store folded in breathable cotton muslin cloth.'
      }
    ]
  }
];

function generatePDFs() {
  for (const item of policiesData) {
    const filePath = path.join(POLICIES_DIR, item.filename);
    const doc = new PDFDocument({ margin: 40 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Header
    doc.fillColor('#0b2219').fontSize(18).font('Helvetica-Bold').text('BUTTA BOMMA COLLECTIONS', { align: 'center' });
    doc.fillColor('#b8860b').fontSize(11).font('Helvetica').text('HANDLOOM HERITAGE • MODERN COUTURE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#333333').fontSize(8).text('Effective Date: September 2026 | Verified Document', { align: 'center' });
    doc.moveDown(1);
    doc.strokeColor('#d4af37').lineWidth(1.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(1);

    // Document Title
    doc.fillColor('#041c15').fontSize(14).font('Helvetica-Bold').text(item.title, { align: 'left' });
    doc.moveDown(0.8);

    // Sections
    for (const sec of item.sections) {
      doc.fillColor('#b8860b').fontSize(11).font('Helvetica-Bold').text(sec.heading);
      doc.moveDown(0.3);
      doc.fillColor('#222222').fontSize(9.5).font('Helvetica').text(sec.text, { lineGap: 3 });
      doc.moveDown(0.8);
    }

    doc.moveDown(1);
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fillColor('#666666').fontSize(7.5).font('Helvetica-Oblique').text(
      'Disclaimer: This policy document is issued for Butta Bomma Collections. Commercial operations should be formally reviewed by a qualified Indian legal counsel in accordance with the Consumer Protection Act and Information Technology Rules.',
      { align: 'center' }
    );

    doc.end();
    console.log(`📄 Generated PDF: ${item.filename}`);
  }
}

generatePDFs();
