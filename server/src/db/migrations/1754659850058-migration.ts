import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754659850058 implements MigrationInterface {
    name = 'Migration1754659850058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`customExchangeRateApiUrl\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`currency\` ADD \`customExchangeRateApiPath\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`customExchangeRateApiPath\``);
        await queryRunner.query(`ALTER TABLE \`currency\` DROP COLUMN \`customExchangeRateApiUrl\``);
    }

}
