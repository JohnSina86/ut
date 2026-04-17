import React from 'react';
import { Footer }    from '../../components/layout/Footer/Footer';
import { Container } from '../../components/layout/Container/Container';
import { Section }   from '../../components/layout/Section/Section';
import { Grid }      from '../../components/layout/Grid/Grid';
import styles from './AboutPage.module.css';

const TEAM = [
  { name: 'Liam O\'Brien',  role: 'Founder & Head Mechanic', initials: 'LO' },
  { name: 'Emma Walsh',     role: 'Service Manager',          initials: 'EW' },
  { name: 'Sean Murphy',    role: 'Lead Technician',          initials: 'SM' },
  { name: 'Claire Doyle',   role: 'Customer Relations',       initials: 'CD' },
];

export const AboutPage = () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>

        {/* Hero banner */}
        <div className={styles.heroBanner}>
          <Container>
            <h1 className={styles.heroTitle}>About United Tyres Dundrum</h1>
            <p className={styles.heroSub}>
              Serving Dublin drivers since 2005 with honest, expert auto care.
            </p>
          </Container>
        </div>

        {/* Story */}
        <Section title="Our Story">
          <Container maxWidth="md">
            <p className={styles.bodyText}>
              Founded in 2005, United Tyres Dundrum started as a small tyre shop with a big commitment
              to quality and transparency. Over the years we've grown into a full-service auto workshop
              trusted by thousands of customers across South Dublin.
            </p>
            <p className={styles.bodyText}>
              We believe every driver deserves honest advice and skilled service�no upselling, no surprises.
              Our team of certified technicians uses the latest tools and genuine parts to keep your car
              safe and roadworthy.
            </p>
          </Container>
        </Section>

        {/* Values */}
        <Section title="Our Values" background="gray">
          <Container>
            <Grid columns={3} gap="lg">
              {[
                { icon: '??', title: 'Expertise',     desc: 'Certified technicians with years of hands-on experience.' },
                { icon: '??', title: 'Transparency',  desc: 'Clear pricing and honest advice, every time.'            },
                { icon: '?', title: 'Speed',          desc: 'Efficient service that respects your time.'              },
              ].map((v) => (
                <div key={v.title} className={styles.valueCard}>
                  <span className={styles.valueIcon}>{v.icon}</span>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              ))}
            </Grid>
          </Container>
        </Section>

        {/* Team */}
        <Section title="Meet the Team">
          <Container>
            <Grid columns={4} gap="md">
              {TEAM.map((member) => (
                <div key={member.name} className={styles.teamCard}>
                  <div className={styles.teamAvatar}>{member.initials}</div>
                  <h4 className={styles.teamName}>{member.name}</h4>
                  <p className={styles.teamRole}>{member.role}</p>
                </div>
              ))}
            </Grid>
          </Container>
        </Section>

      </main>
      <Footer copyright="� 2025 United Tyres Dundrum." />
    </div>
  );
};

export default AboutPage;

