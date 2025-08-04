import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754270452632 implements MigrationInterface {
    name = 'Migration1754270452632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`expense_category\` (\`uuid\` uuid NOT NULL, \`name\` text NOT NULL, \`icon\` text NOT NULL, \`iconColor\` text NOT NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`userUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`income_source\` (\`uuid\` uuid NOT NULL, \`name\` text NOT NULL, \`color\` text NOT NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`userUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` ADD \`categoryUuid\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` ADD \`sourceUuid\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD \`sourceUuid\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD \`categoryUuid\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`expense_category\` ADD CONSTRAINT \`FK_383e65b2495c609da6aa9eb64d2\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` ADD CONSTRAINT \`FK_ea0654e4f01c22d7a454e15b09d\` FOREIGN KEY (\`categoryUuid\`) REFERENCES \`expense_category\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`income_source\` ADD CONSTRAINT \`FK_b472c762cce8bd249d20096a7c7\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` ADD CONSTRAINT \`FK_f681d78af1cf152c9d4a7af8c53\` FOREIGN KEY (\`sourceUuid\`) REFERENCES \`income_source\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD CONSTRAINT \`FK_737ddaba7a94d25317a288164be\` FOREIGN KEY (\`sourceUuid\`) REFERENCES \`income_source\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD CONSTRAINT \`FK_e0ced3ca2a05dae776a62dbaa1c\` FOREIGN KEY (\`categoryUuid\`) REFERENCES \`expense_category\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`expense\` DROP FOREIGN KEY \`FK_e0ced3ca2a05dae776a62dbaa1c\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP FOREIGN KEY \`FK_737ddaba7a94d25317a288164be\``);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` DROP FOREIGN KEY \`FK_f681d78af1cf152c9d4a7af8c53\``);
        await queryRunner.query(`ALTER TABLE \`income_source\` DROP FOREIGN KEY \`FK_b472c762cce8bd249d20096a7c7\``);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` DROP FOREIGN KEY \`FK_ea0654e4f01c22d7a454e15b09d\``);
        await queryRunner.query(`ALTER TABLE \`expense_category\` DROP FOREIGN KEY \`FK_383e65b2495c609da6aa9eb64d2\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP COLUMN \`categoryUuid\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP COLUMN \`sourceUuid\``);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` DROP COLUMN \`sourceUuid\``);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` DROP COLUMN \`categoryUuid\``);
        await queryRunner.query(`DROP TABLE \`income_source\``);
        await queryRunner.query(`DROP TABLE \`expense_category\``);
    }

}
