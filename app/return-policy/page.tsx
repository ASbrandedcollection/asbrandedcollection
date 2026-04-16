import Link from 'next/link';

export default function ReturnPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          padding: '2rem 0',
        }}
      >
        <div className="container">
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              marginBottom: '0.4rem',
            }}
          >
            Customer Service
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--text-dark)',
            }}
          >
            Return & Exchange Policy
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ padding: '3rem 2rem', maxWidth: '780px' }}>
        {/* Intro */}
        <div
          style={{
            background: 'var(--blush-light)',
            border: '1px solid var(--blush)',
            borderRadius: '8px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            fontSize: '0.88rem',
            color: 'var(--text-mid)',
            lineHeight: 1.7,
          }}
        >
          At <strong>A&S Branded Collection</strong>, we want you to be completely satisfied with your purchase. Please read
          our return and exchange policy carefully before raising a request.
        </div>

        {/* Cases */}
        {[
          {
            number: '01',
            title: 'Damaged, Broken, Incorrect, or Missing Order',
            color: '#fef2f2',
            borderColor: '#fecaca',
            accentColor: '#dc2626',
            steps: [
              {
                label: '1a',
                text: 'If your product is damaged, defective, incorrect, or missing at the time of delivery, please contact us within 7 days. No return requests will be accepted after 7 days of delivery.',
              },
              {
                label: '1b',
                text: 'Please send us a picture of your Order Invoice found inside your parcel. This invoice is crucial for our verification process. Failure to provide it may result in the return request being declined. In cases of damaged or incorrect products, we may also request a picture of the product.',
              },
              {
                label: '1c',
                text: 'Once verified (within 48 hours of your complaint), we will initiate a pickup request from your address.',
              },
              {
                label: '1d',
                text: 'Products must be returned in their original condition (unused, all seals/tags intact), with all accessories, manuals, and warranty cards. All returned products undergo a Quality Check at our warehouse. Requests may be declined if the product is returned used, broken, or in poor condition.',
              },
              {
                label: '1e',
                text: 'If your request is approved, A&S Branded Collection will bear the delivery charges for both pickup and re-dispatch of the correct item.',
              },
            ],
          },
          {
            number: '02',
            title: 'Different Variant, Shade, or Type Than What You Ordered',
            color: '#eff6ff',
            borderColor: '#bfdbfe',
            accentColor: '#2563eb',
            steps: [
              {
                label: '2a',
                text: 'Contact us within 7 days if you need a different variant, shade, or type than what was originally ordered. Requests raised after 7 days of delivery will not be accepted.',
              },
              {
                label: '2b',
                text: 'Please send a picture of your Order Invoice found inside the parcel. This is mandatory for verification.',
              },
              {
                label: '2c',
                text: 'Once your complaint is verified (within 48 hours), a pickup request will be initiated.',
              },
              {
                label: '2d',
                text: 'Products must be returned in original condition with all accessories. A Quality Check will be done at the warehouse before processing your request.',
              },
              {
                label: '2e',
                text: 'If your exchange request is approved, a new order will be dispatched by A&S Branded Collection.',
              },
              {
                label: '2f',
                text: 'If you request a refund, you will be issued an Internal Credit Voucher for the same amount, which can be used on a future purchase. Monetary refunds are not applicable in this case.',
              },
            ],
          },
          {
            number: '03',
            title: 'Change of Mind',
            color: '#f0fdf4',
            borderColor: '#86efac',
            accentColor: '#16a34a',
            steps: [
              {
                label: null,
                text: 'If you ordered the correct item but wish to exchange it due to a change of mind (e.g. different shade, type, or simply no longer want it), the following applies:',
              },
              {
                label: null,
                text: 'You must return the product in unused and original condition with all seals and packaging intact.',
              },
              {
                label: null,
                text: 'Once the item is received and passes the Quality Check, A&S Branded Collection will proceed with your exchange request.',
              },
              {
                label: null,
                text: 'For change of mind exchanges, you will be charged Rs. 200 extra in addition to delivery charges to cover the exchange handling and logistics.',
              },
            ],
          },
        ].map(caseItem => (
          <div
            key={caseItem.number}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '1.5rem',
            }}
          >
            {/* Case header */}
            <div
              style={{
                background: caseItem.color,
                borderBottom: `1px solid ${caseItem.borderColor}`,
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: caseItem.accentColor,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {caseItem.number}
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--text-dark)',
                }}
              >
                Case {parseInt(caseItem.number)}: {caseItem.title}
              </h2>
            </div>

            {/* Steps */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {caseItem.steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                  }}
                >
                  {step.label && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: caseItem.accentColor,
                        background: caseItem.color,
                        border: `1px solid ${caseItem.borderColor}`,
                        borderRadius: '4px',
                        padding: '2px 7px',
                        flexShrink: 0,
                        marginTop: '2px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {step.label.toUpperCase()}
                    </span>
                  )}
                  {!step.label && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: caseItem.accentColor,
                        flexShrink: 0,
                        marginTop: '8px',
                      }}
                    />
                  )}
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-mid)',
                      lineHeight: 1.75,
                    }}
                  >
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Important note */}
        <div
          style={{
            background: '#fefce8',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
          <div>
            <p
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#92400e',
                marginBottom: '0.4rem',
              }}
            >
              Important Note
            </p>
            <p style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: 1.7 }}>
              Parcel pickups can take <strong>6–8 working days</strong> due to courier delays. We appreciate your patience
              during the process.
            </p>
          </div>
        </div>

        {/* Contact section */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-dark)',
              marginBottom: '0.5rem',
            }}
          >
            Need Help?
          </p>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-mid)',
              lineHeight: 1.6,
              marginBottom: '1.25rem',
            }}
          >
            Contact us within 7 days of delivery to raise a return or exchange request. Our team is here to help.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/track-order" className="btn-primary">
              Track My Order
            </Link>
            <Link href="/" className="btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
