import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds a `role` column to the `users` table (for admin panel access control)
 * and a `deleted_at` column to the `appointments` table (for soft deletes).
 *
 * Run after the initial schema migration.
 *   npx typeorm migration:run -d src/data-source.ts
 */
export class AddRoleToUsersAndSoftDeleteAppointments1713571200000
  implements MigrationInterface
{
  name = 'AddRoleToUsersAndSoftDeleteAppointments1713571200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Add role column to users
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`role\` ENUM('admin','customer') NOT NULL DEFAULT 'customer'
      AFTER \`avatar\`
    `);

    await queryRunner.query(`
      CREATE INDEX \`idx_users_role\` ON \`users\` (\`role\`)
    `);

    // 2) Add deleted_at column to appointments for soft delete
    await queryRunner.query(`
      ALTER TABLE \`appointments\`
      ADD COLUMN \`deleted_at\` DATETIME DEFAULT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX \`idx_appointments_deleted_at\` ON \`appointments\` (\`deleted_at\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`idx_appointments_deleted_at\` ON \`appointments\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`appointments\` DROP COLUMN \`deleted_at\``,
    );
    await queryRunner.query(`DROP INDEX \`idx_users_role\` ON \`users\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
  }
}
