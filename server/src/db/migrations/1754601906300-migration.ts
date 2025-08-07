import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754601906300 implements MigrationInterface {
    name = 'Migration1754601906300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`historic_exchange_rate\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`rates\` json NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_settings\` ADD \`displayCurrency\` text NOT NULL DEFAULT 'USD'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_settings\` DROP COLUMN \`displayCurrency\``);
        await queryRunner.query(`DROP TABLE \`historic_exchange_rate\``);
    }

}
