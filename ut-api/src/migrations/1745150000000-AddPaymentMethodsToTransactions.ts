import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Expands `payment_method` enum on `transactions` to cover the new payment
 * providers (PayPal, Google Pay, Direct Debit, Pay in Person) and adds two
 * new columns to store external provider identifiers:
 *
 *   - `payment_intent_id`              — the intent/order/billing-request id
 *     captured before the user completes payment.
 *   - `payment_provider_reference`     — the final provider reference
 *     (PayPal capture id, Stripe charge id, GoCardless payment id).
 *
 * Run after the AddRoleToUsersAndSoftDeleteAppointments migration.
 */
export class AddPaymentMethodsToTransactions1745150000000
  implements MigrationInterface
{
  name = 'AddPaymentMethodsToTransactions1745150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Expand the enum. MySQL 8 allows MODIFY to rewrite an enum in place.
    await queryRunner.query(`
      ALTER TABLE \`transactions\`
      MODIFY COLUMN \`payment_method\`
      ENUM('cash','card','paypal','google_pay','direct_debit','pay_in_person')
      NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`transactions\`
      ADD COLUMN \`payment_provider_reference\` VARCHAR(512) DEFAULT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`transactions\`
      ADD COLUMN \`payment_intent_id\` VARCHAR(255) DEFAULT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX \`idx_transactions_payment_intent_id\`
      ON \`transactions\` (\`payment_intent_id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`idx_transactions_payment_intent_id\` ON \`transactions\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP COLUMN \`payment_intent_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP COLUMN \`payment_provider_reference\``,
    );

    // Restore the prior (narrower) enum. Any rows using the new values will
    // fail the MODIFY — callers must scrub / update those rows first.
    await queryRunner.query(`
      ALTER TABLE \`transactions\`
      MODIFY COLUMN \`payment_method\`
      ENUM('cash','card','online','other')
      NULL
    `);
  }
}
