import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782412992878 implements MigrationInterface {
    name = 'Migration1782412992878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`saving\` (\`uuid\` uuid NOT NULL, \`description\` text NOT NULL, \`amount\` decimal(19,2) NOT NULL, \`date\` datetime NOT NULL, \`userUuid\` uuid NOT NULL, \`currencyId\` int NOT NULL, \`bucketUuid\` uuid NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`saving\` ADD CONSTRAINT \`FK_b03ce591cab042fa3957d398ced\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`saving\` ADD CONSTRAINT \`FK_ee4306f0e43293baa6a8dadcbdc\` FOREIGN KEY (\`currencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`saving\` ADD CONSTRAINT \`FK_a31063dfe8f6b7a8d4b7ef1ae1d\` FOREIGN KEY (\`bucketUuid\`) REFERENCES \`savings_bucket\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`saving\` DROP FOREIGN KEY \`FK_a31063dfe8f6b7a8d4b7ef1ae1d\``);
        await queryRunner.query(`ALTER TABLE \`saving\` DROP FOREIGN KEY \`FK_ee4306f0e43293baa6a8dadcbdc\``);
        await queryRunner.query(`ALTER TABLE \`saving\` DROP FOREIGN KEY \`FK_b03ce591cab042fa3957d398ced\``);
        await queryRunner.query(`DROP TABLE \`saving\``);
    }

}
