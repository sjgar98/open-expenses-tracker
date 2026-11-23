import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1795460579565 implements MigrationInterface {
  name = 'Migration1795460579565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`holiday_date\` (\`uuid\` uuid NOT NULL, \`date\` date NOT NULL, \`label\` text NOT NULL, \`calendarUuid\` uuid NOT NULL, UNIQUE INDEX \`IDX_f87b255d045bc4af42e3e0c6f2\` (\`calendarUuid\`, \`date\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`holiday_calendar\` (\`uuid\` uuid NOT NULL, \`name\` text NOT NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`userUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`credit_cycle\` (\`uuid\` uuid NOT NULL, \`closingDate\` date NOT NULL, \`dueDate\` date NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`paymentMethodUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(`ALTER TABLE \`payment_method\` ADD \`holidayCalendarUuid\` uuid NULL`);
    await queryRunner.query(
      `UPDATE \`payment_method\` SET \`creditClosingDateRule\` = JSON_OBJECT('kind', 'rrule', 'rrule', \`creditClosingDateRule\`, 'roll', 'none') WHERE \`creditClosingDateRule\` IS NOT NULL`
    );
    await queryRunner.query(
      `UPDATE \`payment_method\` SET \`creditDueDateRule\` = JSON_OBJECT('kind', 'rrule', 'rrule', \`creditDueDateRule\`) WHERE \`creditDueDateRule\` IS NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE \`payment_method\` MODIFY \`creditClosingDateRule\` json NULL`);
    await queryRunner.query(`ALTER TABLE \`payment_method\` MODIFY \`creditDueDateRule\` json NULL`);
    await queryRunner.query(
      `ALTER TABLE \`holiday_date\` ADD CONSTRAINT \`FK_a080d8e2e2eeed6a924d577f927\` FOREIGN KEY (\`calendarUuid\`) REFERENCES \`holiday_calendar\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`holiday_calendar\` ADD CONSTRAINT \`FK_ebe7f8caef4bfd76db9d1208ce8\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_method\` ADD CONSTRAINT \`FK_e5ce2b5a9016d71e4708f6777c4\` FOREIGN KEY (\`holidayCalendarUuid\`) REFERENCES \`holiday_calendar\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`credit_cycle\` ADD CONSTRAINT \`FK_2b61ceaaa234c5da1baf855cf73\` FOREIGN KEY (\`paymentMethodUuid\`) REFERENCES \`payment_method\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`credit_cycle\` DROP FOREIGN KEY \`FK_2b61ceaaa234c5da1baf855cf73\``);
    await queryRunner.query(`ALTER TABLE \`payment_method\` DROP FOREIGN KEY \`FK_e5ce2b5a9016d71e4708f6777c4\``);
    await queryRunner.query(`ALTER TABLE \`holiday_calendar\` DROP FOREIGN KEY \`FK_ebe7f8caef4bfd76db9d1208ce8\``);
    await queryRunner.query(`ALTER TABLE \`holiday_date\` DROP FOREIGN KEY \`FK_a080d8e2e2eeed6a924d577f927\``);
    await queryRunner.query(
      `ALTER TABLE \`payment_method\` MODIFY \`creditDueDateRule\` text COLLATE "utf8mb4_general_ci" NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_method\` MODIFY \`creditClosingDateRule\` text COLLATE "utf8mb4_general_ci" NULL`
    );
    await queryRunner.query(
      `UPDATE \`payment_method\` SET \`creditDueDateRule\` = IF(JSON_UNQUOTE(JSON_EXTRACT(\`creditDueDateRule\`, '$.kind')) = 'rrule', JSON_UNQUOTE(JSON_EXTRACT(\`creditDueDateRule\`, '$.rrule')), NULL) WHERE \`creditDueDateRule\` IS NOT NULL`
    );
    await queryRunner.query(
      `UPDATE \`payment_method\` SET \`creditClosingDateRule\` = IF(JSON_UNQUOTE(JSON_EXTRACT(\`creditClosingDateRule\`, '$.kind')) = 'rrule', JSON_UNQUOTE(JSON_EXTRACT(\`creditClosingDateRule\`, '$.rrule')), NULL) WHERE \`creditClosingDateRule\` IS NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE \`payment_method\` DROP COLUMN \`holidayCalendarUuid\``);
    await queryRunner.query(`DROP TABLE \`credit_cycle\``);
    await queryRunner.query(`DROP TABLE \`holiday_calendar\``);
    await queryRunner.query(`DROP INDEX \`IDX_f87b255d045bc4af42e3e0c6f2\` ON \`holiday_date\``);
    await queryRunner.query(`DROP TABLE \`holiday_date\``);
  }
}
