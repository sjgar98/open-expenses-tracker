import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1784921954813 implements MigrationInterface {
    name = 'Migration1784921954813'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`expense\` ADD \`savingsBucketUuid\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD CONSTRAINT \`FK_c712e41b63e8478e6a65fcdf32f\` FOREIGN KEY (\`savingsBucketUuid\`) REFERENCES \`savings_bucket\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`expense\` DROP FOREIGN KEY \`FK_c712e41b63e8478e6a65fcdf32f\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP COLUMN \`savingsBucketUuid\``);
    }

}
