import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1795476636817 implements MigrationInterface {
  name = 'Migration1795476636817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`payment_method\` SET \`creditDueDateRule\` = JSON_SET(\`creditDueDateRule\`, '$.roll', 'none') WHERE JSON_UNQUOTE(JSON_EXTRACT(\`creditDueDateRule\`, '$.kind')) = 'rrule' AND JSON_EXTRACT(\`creditDueDateRule\`, '$.roll') IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`payment_method\` SET \`creditDueDateRule\` = JSON_REMOVE(\`creditDueDateRule\`, '$.roll') WHERE JSON_UNQUOTE(JSON_EXTRACT(\`creditDueDateRule\`, '$.kind')) = 'rrule'`
    );
  }
}
