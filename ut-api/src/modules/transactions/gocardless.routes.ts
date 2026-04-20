import { Router, raw } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { GocardlessController } from './gocardless.controller.js';

const router = Router();
const controller = new GocardlessController();

// Authenticated: initiate Direct Debit request from the booking flow.
router.post(
  '/direct-debit/create-request',
  requireAuth,
  (req, res) => controller.createRequest(req, res),
);

// Public: GoCardless redirects the user here after completing authorisation.
router.get('/direct-debit/callback', (req, res) => controller.callback(req, res));

// Public, RAW body: GoCardless webhook — must not be parsed as JSON so we can
// verify the signature against the exact bytes that were sent.
router.post(
  '/direct-debit/webhook',
  raw({ type: 'application/json' }),
  (req, res) => controller.webhook(req, res),
);

export default router;
