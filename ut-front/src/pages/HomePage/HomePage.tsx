import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../components/layout/Footer/Footer';
import { Container } from '../../components/layout/Container/Container';
import { Section } from '../../components/layout/Section/Section';
import { Hero } from '../../components/layout/Hero/Hero';
import { ServiceCard } from '../../components/shared/ServiceCard/ServiceCard';
import { HowItWorksStep } from '../../components/shared/HowItWorksStep/HowItWorksStep';
import { TestimonialCard } from '../../components/shared/TestimonialCard/TestimonialCard';
import styles from './HomePage.module.css';

const STATS = [
  { number: '10,000+', label: 'Cars Serviced' },
  { number: '15+',     label: 'Years in Dublin' },
  { number: '4.9',    label: 'Average Rating' },
  { number: 'Same Day', label: 'Availability' },
];

export const HomePage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => { setServices(data); setLoading(false); })
      .catch(err => { console.error('Failed to fetch services:', err); setLoading(false); });
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        {/* -- Hero -- */}
        <Hero
          title="United Tyres Dundrum"
          subtitle="Professional tyre and auto repair services in the heart of Dublin."
          cta={[
            { label: 'Book Now',      href: '/booking',  variant: 'primary'   },
            { label: 'Our Services',  href: '/services', variant: 'secondary' },
          ]}
          align="center"
        />

        {/* -- Stats bar -- */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {STATS.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statNumber}>{s.number}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
          </div>
        </div>

        {/* -- Services -- */}
        <div className={styles.sectionSpacer} />
        <Section title="Our Services" subtitle="Everything your car needs, under one roof." align="center">
          <Container>
            <div className={styles.servicesGrid}>
              {loading ? (
                <p>Loading services�</p>
              ) : services.length === 0 ? (
                <p>No services available at the moment.</p>
              ) : (
                services.map((service: any) => (
                  <ServiceCard
                    key={service.id}
                    name={service.name}
                    duration={service.duration_minutes}
                    price={service.price}
                    onSelect={() => navigate(`/booking?service=${service.id}`)}
                  />
                ))
              )}
            </div>
          </Container>
        </Section>

        {/* -- How It Works -- */}
        <div className={styles.sectionSpacer} />
        <Section title="How It Works" subtitle="Booking a service has never been easier." background="gray" align="center">
          <Container maxWidth="md">
            <div className={styles.stepsWrapper}>
              <HowItWorksStep step={1} title="Login"              description="Sign in via Google no new password needed." />
              <HowItWorksStep step={2} title="Choose a Service"   description="Browse our full list of car services and pick what you need." />
              <HowItWorksStep step={3} title="Select Your Vehicle" description="Tell us about your car or pick one you've saved before." />
              <HowItWorksStep step={4} title="Pick a Time Slot"   description="Choose a date and time that works best for you." />
              <HowItWorksStep step={5} title="We Handle the Rest" description="Show up, drop off your keys, and we'll take care of everything." isLast />
            </div>
          </Container>
        </Section>

        {/* -- Testimonials -- */}
        <div className={styles.sectionSpacer} />
        <Section title="What Our Customers Say" align="center">
          <Container>
            <div className={styles.testimonialsGrid}>
              <TestimonialCard name="Patrick F. "  role="Regular Customer"    comment="Excellent, service with a smile. Highly recommended. James very helpful and obliging Nothing is too much trouble" rating={5} />
              <TestimonialCard name="Sarah M. " role="Verified Customer"   comment="The team at United Tyres are true professionals. Highly recommend."  rating={5} />
              <TestimonialCard name="Ali K. "   role="First-time Customer" comment="Booked online in minutes. Easy process and excellent work."            rating={5} />
            </div>
          </Container>
        </Section>

        {/* -- CTA Banner -- */}
        <div className={styles.sectionSpacer} />
        <div className={styles.ctaBannerWrapper}>
          <div className={styles.ctaBanner}>
            <div className={styles.ctaBannerText}>
              <h2 className={styles.ctaBannerTitle}>Ready to book your next service?</h2>
              <p className={styles.ctaBannerSub}>Join thousands of Dublin drivers who trust United Tyres Dundrum. Book online in under 2 minutes.</p>
            </div>
            <div className={styles.ctaBannerActions}>
              <a href="/booking"  className={styles.ctaBtnPrimary}>Book Now ?</a>
              <a href="/services" className={styles.ctaBtnSecondary}>View Services</a>
            </div>
          </div>
        </div>
        <div className={styles.sectionSpacer} />

      </main>
    </div>
  );
};

export default HomePage;
