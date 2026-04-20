/**
 * Lightweight admin action audit trail.
 *
 * Writes a structured line to the server log for every admin mutation
 * (create / update / delete). This is intentionally minimal — it can
 * be swapped for a DB-backed implementation later without touching the
 * callers. See Phase 6 of the admin panel checklist.
 */
export interface AdminAuditEntry {
  at: string;
  actor_id: number | null;
  action: string;
  context?: Record<string, unknown>;
}

export class AdminAuditService {
  log(actorId: number | null | undefined, action: string, context?: Record<string, unknown>) {
    const entry: AdminAuditEntry = {
      at: new Date().toISOString(),
      actor_id: actorId ?? null,
      action,
      context,
    };

    // eslint-disable-next-line no-console
    console.log(`[admin-audit] ${JSON.stringify(entry)}`);
  }
}
