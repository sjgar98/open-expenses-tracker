import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782500188898 implements MigrationInterface {
    name = 'Migration1782500188898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`savings_bucket\` ADD \`initialAmount\` decimal(19,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`savings_bucket\` DROP COLUMN \`initialAmount\``);
    }

}
