import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777589653085 implements MigrationInterface {
    name = 'Migration1777589653085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_settings\` ADD \`showDeletedOptions\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_settings\` DROP COLUMN \`showDeletedOptions\``);
    }

}
