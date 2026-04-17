import React, { useState } from 'react';
import { Footer }    from '../../components/layout/Footer/Footer';
import { Container } from '../../components/layout/Container/Container';
import { Section }   from '../../components/layout/Section/Section';
import styles from './FaqPage.module.css';

const FAQS = [
  { q: 'How do I book an appointment?',          a: 'Click "Book Now" from the home page or navigate to the Booking page. Select your service, vehicle, and preferred time slot.' },
  { q: 'Can I cancel or reschedule?',             a: 'Yes. Log in to your account, go to "Appointments", and choose to reschedule or cancel up to 24 hours before your appointment.' },
  { q: 'What payment methods do you accept?',     a: 'We accept cash, all major credit/debit cards, and contactless payments.' },
  { q: 'Do I need to supply my own tyres?',       a: 'No. We stock a wide range of tyre brands. Let us know your vehicle details and we will source the right tyres for you.' },
  { q: 'How long does a tyre change take?',       a: 'A standard tyre change typically takes 20�30 minutes depending on the number of tyres being changed.' },
  { q: 'Is wheel alignment included in a tyre service?', a: 'Wheel alignment is a separate service. We recommend it whenever new tyres are fitted. You can add it during the booking process.' },
  { q: 'Do you offer a warranty on work done?',  a: 'Yes, all our work is covered by a 12-month workmanship warranty. Parts come with their manufacturer warranty.' },
];

export const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Section title="Frequently Asked Questions" subtitle="Can't find your answer? Contact us directly.">
          <Container maxWidth="md">
            <div className={styles.list}>
              {FAQS.map((faq, i) => (
                <div key={i} className={`${styles.item} ${openIndex === i ? styles.itemOpen : ''}`}>
                  <button className={styles.question} onClick={() => toggle(i)}>
                    <span>{faq.q}</span>
                    <span className={styles.chevron}>{openIndex === i ? '?' : '?'}</span>
                  </button>
                  {openIndex === i && (
                    <div className={styles.answer}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <Footer copyright="� 2025 United Tyres Dundrum." />
    </div>
  );
};

export default FaqPage;

