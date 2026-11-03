export default function HowToOrder() {
  const steps = [
    { n: '1', t: 'Choose Category', d: 'Pick sarees, lehengas, dresses, kurtis, suits or accessories.' },
    { n: '2', t: 'Select Your Piece', d: 'Open large photos, check stock and choose your size.' },
    { n: '3', t: 'Add To Bag', d: 'Review your bag. Pan-India delivery is free on every order.' },
    { n: '4', t: 'Place Order', d: 'Enter delivery details. Pay by UPI or Cash On Delivery.' },
    { n: '5', t: 'Confirm On WhatsApp', d: 'Send the order on WhatsApp. We confirm sizing and share tracking.' },
  ];
  return (
    <section className="section-container" id="how">
      <div className="section-title-block">
        <h2 className="section-heading">SIMPLE ORDER PROCESS</h2>
        <div className="section-decorative-divider">◆ ─── ❖ ─── ◆</div>
        <p className="section-subheading">
          From browsing to doorstep in five easy steps, with our styling team on WhatsApp the whole way.
        </p>
      </div>
      <div className="rks-process">
        {steps.map((s) => (
          <div className="rks-step" key={s.n}>
            <div className="rks-step-num">{s.n}</div>
            <strong>{s.t}</strong>
            <span>{s.d}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
