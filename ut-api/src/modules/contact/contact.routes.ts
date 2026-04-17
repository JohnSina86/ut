import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// POST /api/contact
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;
    console.log('Contact form submission:', { name, email, phone, message });
    // TODO: integrate with email service or store in database
    res.json({ success: true, message: 'Thank you for contacting us!' });
  } catch (err) {
    console.error('Contact endpoint error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;