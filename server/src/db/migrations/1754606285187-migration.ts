import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754606285187 implements MigrationInterface {
    name = 'Migration1754606285187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`income\` DROP FOREIGN KEY \`FK_86299ba198601cbac8f90942436\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP FOREIGN KEY \`FK_d55dfffa460c30fcb883c9b44bf\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP COLUMN \`fromExchangeRate\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP COLUMN \`toExchangeRate\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP COLUMN \`toCurrencyId\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP COLUMN \`fromExchangeRate\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP COLUMN \`toExchangeRate\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP COLUMN \`toCurrencyId\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`expense\` ADD \`toCurrencyId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD \`toExchangeRate\` decimal(19,6) NOT NULL DEFAULT 1.000000`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD \`fromExchangeRate\` decimal(19,6) NOT NULL DEFAULT 1.000000`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD \`toCurrencyId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD \`toExchangeRate\` decimal(19,6) NOT NULL DEFAULT 1.000000`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD \`fromExchangeRate\` decimal(19,6) NOT NULL DEFAULT 1.000000`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD CONSTRAINT \`FK_d55dfffa460c30fcb883c9b44bf\` FOREIGN KEY (\`toCurrencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD CONSTRAINT \`FK_86299ba198601cbac8f90942436\` FOREIGN KEY (\`toCurrencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
