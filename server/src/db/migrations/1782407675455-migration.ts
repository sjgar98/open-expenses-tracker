import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782407675455 implements MigrationInterface {
    name = 'Migration1782407675455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`savings_bucket\` (\`uuid\` uuid NOT NULL, \`name\` text NOT NULL, \`icon\` text NOT NULL, \`iconColor\` text NOT NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`targetAmount\` decimal(19,2) NULL, \`deadline\` datetime NULL, \`userUuid\` uuid NOT NULL, \`currencyId\` int NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`savings_bucket\` ADD CONSTRAINT \`FK_90f9953de9da27397905d066069\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`savings_bucket\` ADD CONSTRAINT \`FK_8395ca2a37de4e1f6ee523fd19f\` FOREIGN KEY (\`currencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`savings_bucket\` DROP FOREIGN KEY \`FK_8395ca2a37de4e1f6ee523fd19f\``);
        await queryRunner.query(`ALTER TABLE \`savings_bucket\` DROP FOREIGN KEY \`FK_90f9953de9da27397905d066069\``);
        await queryRunner.query(`DROP TABLE \`savings_bucket\``);
    }

}
