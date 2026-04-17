import React, { useState } from 'react';
import { Container } from '../../components/layout/Container/Container';
import { Section }   from '../../components/layout/Section/Section';
import { Input }     from '../../components/ui/Input/Input';
import { Textarea }  from '../../components/ui/Textarea/Textarea';
import { Button }    from '../../components/ui/Button/Button';
import { contactAPI } from '../../services/api';
import styles from './ContactPage.module.css';

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setSending(true);
    try {
      await contactAPI.send(form);
      setMessage('Your message has been sent! We will get back to you shortly.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Section title="Contact Us" subtitle="We'd love to hear from you. Reach out any time.">
          <Container>
            <div className={styles.layout}>

              {/* Left — contact form */}
              <div className={styles.formWrapper}>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <Input label="Full Name" name="name"  value={form.name}  onChange={handleChange} placeholder="John Doe" required />
                    <Input label="Phone"     name="phone" value={form.phone} onChange={handleChange} placeholder="+353 1 234 5678" type="tel" />
                  </div>
                  <Input label="Email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" type="email" required />
                  <Textarea label="Message" name="message" value={form.message} onChange={handleChange} placeholder="How can we help you?" rows={5} required grow />
                  <Button variant="primary" disabled={sending}>
                    {sending ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
                {message && <p className={styles.successMsg}>{message}</p>}
                {error   && <p className={styles.errorMsg}>{error}</p>}
              </div>

              {/* Right — info + map */}
              <div className={styles.info}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>📍</div>
                  <div>
                    <p className={styles.infoLabel}>Address</p>
                    <p className={styles.infoText}>United Tyres Dundrum<br/>14 Ballinteer Rd, Dundrum, Dublin 16</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>📞</div>
                  <div>
                    <p className={styles.infoLabel}>Phone</p>
                    <a href="tel:+35312985000" className={styles.infoLink}>+353 1 298 5000</a>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>✉️</div>
                  <div>
                    <p className={styles.infoLabel}>Email</p>
                    <a href="mailto:info@unitedtyres.ie" className={styles.infoLink}>info@unitedtyres.ie</a>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>🕐</div>
                  <div>
                    <p className={styles.infoLabel}>Opening Hours</p>
                    <p className={styles.infoText}>Mon–Fri: 8:00am – 6:00pm<br/>Saturday: 9:00am – 4:00pm<br/>Sunday: Closed</p>
                  </div>
                </div>
                <div className={styles.map}>
                  <iframe
                    title="United Tyres Dundrum location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2384.5!2d-6.2488!3d53.2944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTPCsDE3JzQwLjAiTiA2wrAxNScxNS40Ilc!5e0!3m2!1sen!2sie!4v1"
                    width="100%"
                    height="380"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
};

export default ContactPage;
