import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777593877566 implements MigrationInterface {
    name = 'Migration1777593877566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`account\` DROP COLUMN \`balance\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`account\` ADD \`balance\` decimal(19,2) NOT NULL`);
    }

}
