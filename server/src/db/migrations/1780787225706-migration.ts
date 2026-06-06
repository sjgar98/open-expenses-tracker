import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1780787225706 implements MigrationInterface {
    name = 'Migration1780787225706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_method\` ADD \`sortWeight\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_method\` DROP COLUMN \`sortWeight\``);
    }

}
