import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754091085242 implements MigrationInterface {
    name = 'Migration1754091085242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_settings\` (\`uuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`uuid\` uuid NOT NULL, \`username\` text NOT NULL, \`email\` text NULL, \`isAdmin\` tinyint NOT NULL DEFAULT 0, \`passwordHash\` text NOT NULL, \`settingsUuid\` uuid NOT NULL, UNIQUE INDEX \`REL_a8a0f575ca29ee9b028cb8b2a1\` (\`settingsUuid\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tax\` (\`uuid\` uuid NOT NULL, \`name\` text NOT NULL, \`rate\` decimal(5,2) NOT NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`userUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`currency\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(3) NOT NULL, \`name\` text NOT NULL, \`visible\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_723472e41cae44beb0763f4039\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`account\` (\`uuid\` uuid NOT NULL, \`name\` text NOT NULL, \`balance\` decimal(19,2) NOT NULL, \`icon\` text NOT NULL, \`iconColor\` text NOT NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`userUuid\` uuid NOT NULL, \`currencyId\` int NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recurring_income\` (\`uuid\` uuid NOT NULL, \`description\` text NOT NULL, \`amount\` decimal(19,2) NOT NULL, \`status\` tinyint NOT NULL DEFAULT 1, \`recurrenceRule\` text NOT NULL, \`nextOccurrence\` datetime NULL, \`lastOccurrence\` datetime NULL, \`userUuid\` uuid NOT NULL, \`currencyId\` int NOT NULL, \`accountUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment_method\` (\`uuid\` uuid NOT NULL, \`name\` text NOT NULL, \`icon\` text NOT NULL, \`iconColor\` text NOT NULL, \`credit\` tinyint NOT NULL DEFAULT 0, \`creditClosingDateRule\` text NULL, \`creditDueDateRule\` text NULL, \`nextClosingOccurrence\` datetime NULL, \`nextDueOccurrence\` datetime NULL, \`lastClosingOccurrence\` datetime NULL, \`lastDueOccurrence\` datetime NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userUuid\` uuid NOT NULL, \`accountUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recurring_expense\` (\`uuid\` uuid NOT NULL, \`description\` text NOT NULL, \`amount\` decimal(19,2) NOT NULL, \`status\` tinyint NOT NULL DEFAULT 1, \`recurrenceRule\` text NOT NULL, \`nextOccurrence\` datetime NULL, \`lastOccurrence\` datetime NULL, \`userUuid\` uuid NOT NULL, \`currencyId\` int NOT NULL, \`paymentMethodUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`income\` (\`uuid\` uuid NOT NULL, \`description\` text NOT NULL, \`amount\` decimal(19,2) NOT NULL, \`date\` datetime NOT NULL, \`fromExchangeRate\` decimal(19,6) NOT NULL DEFAULT '1.000000', \`toExchangeRate\` decimal(19,6) NOT NULL DEFAULT '1.000000', \`userUuid\` uuid NOT NULL, \`currencyId\` int NOT NULL, \`accountUuid\` uuid NOT NULL, \`toCurrencyId\` int NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`expense\` (\`uuid\` uuid NOT NULL, \`description\` text NOT NULL, \`amount\` decimal(19,2) NOT NULL, \`date\` datetime NOT NULL, \`fromExchangeRate\` decimal(19,6) NOT NULL DEFAULT '1.000000', \`toExchangeRate\` decimal(19,6) NOT NULL DEFAULT '1.000000', \`userUuid\` uuid NOT NULL, \`currencyId\` int NOT NULL, \`paymentMethodUuid\` uuid NULL, \`toCurrencyId\` int NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`exchange_rate\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rate\` decimal(19,6) NOT NULL DEFAULT '1.000000', \`lastUpdated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`currencyId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`api_key\` (\`uuid\` uuid NOT NULL, \`userUuid\` uuid NOT NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recurring_expense_taxes_tax\` (\`recurringExpenseUuid\` uuid NOT NULL, \`taxUuid\` uuid NOT NULL, INDEX \`IDX_781625b66d54f518c194abcd79\` (\`recurringExpenseUuid\`), INDEX \`IDX_213857952cb276e02824bc8361\` (\`taxUuid\`), PRIMARY KEY (\`recurringExpenseUuid\`, \`taxUuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`expense_taxes_tax\` (\`expenseUuid\` uuid NOT NULL, \`taxUuid\` uuid NOT NULL, INDEX \`IDX_48fca156e8d3f4d25db070fb75\` (\`expenseUuid\`), INDEX \`IDX_85563d6914de14c6125afe8f13\` (\`taxUuid\`), PRIMARY KEY (\`expenseUuid\`, \`taxUuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_a8a0f575ca29ee9b028cb8b2a1c\` FOREIGN KEY (\`settingsUuid\`) REFERENCES \`user_settings\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tax\` ADD CONSTRAINT \`FK_15d53a4119b2296c4f2ef438483\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`account\` ADD CONSTRAINT \`FK_838c93e50d7e0d3096d7e294f22\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`account\` ADD CONSTRAINT \`FK_f6cf13404290564d6992f5e4158\` FOREIGN KEY (\`currencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` ADD CONSTRAINT \`FK_c1e5e6436460acfa329b33087d5\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` ADD CONSTRAINT \`FK_ecd01cf575b87648fe01b7f58f1\` FOREIGN KEY (\`currencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` ADD CONSTRAINT \`FK_945e38574c8d12a25d8ad484bea\` FOREIGN KEY (\`accountUuid\`) REFERENCES \`account\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_method\` ADD CONSTRAINT \`FK_cc1c3ecac2cc6caf991e8665fb1\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_method\` ADD CONSTRAINT \`FK_7d095a533665bd8d36386a56f20\` FOREIGN KEY (\`accountUuid\`) REFERENCES \`account\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` ADD CONSTRAINT \`FK_7dc55dd556e8a2ae600761aa6e9\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` ADD CONSTRAINT \`FK_3bb15ca76e04029081c3f30e28e\` FOREIGN KEY (\`currencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` ADD CONSTRAINT \`FK_3b9767e4376f2df34a17e7ccdda\` FOREIGN KEY (\`paymentMethodUuid\`) REFERENCES \`payment_method\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD CONSTRAINT \`FK_7d8ea373c13e7054ededd2fec3b\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD CONSTRAINT \`FK_e63893cc5604abe13010c355be7\` FOREIGN KEY (\`currencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD CONSTRAINT \`FK_01d1827e6069ccd75efea20a730\` FOREIGN KEY (\`accountUuid\`) REFERENCES \`account\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`income\` ADD CONSTRAINT \`FK_86299ba198601cbac8f90942436\` FOREIGN KEY (\`toCurrencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD CONSTRAINT \`FK_f732a48281896146febd58d4f2f\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD CONSTRAINT \`FK_cf05486337b769f6c0e0cd1fac0\` FOREIGN KEY (\`currencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD CONSTRAINT \`FK_af8574404a31e25a356319d7a74\` FOREIGN KEY (\`paymentMethodUuid\`) REFERENCES \`payment_method\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense\` ADD CONSTRAINT \`FK_d55dfffa460c30fcb883c9b44bf\` FOREIGN KEY (\`toCurrencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`exchange_rate\` ADD CONSTRAINT \`FK_260c65baaaa4cba14b85d6e26d1\` FOREIGN KEY (\`currencyId\`) REFERENCES \`currency\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`api_key\` ADD CONSTRAINT \`FK_2bef20937d8a3f23d66d65c2a7b\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurring_expense_taxes_tax\` ADD CONSTRAINT \`FK_781625b66d54f518c194abcd790\` FOREIGN KEY (\`recurringExpenseUuid\`) REFERENCES \`recurring_expense\`(\`uuid\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`recurring_expense_taxes_tax\` ADD CONSTRAINT \`FK_213857952cb276e02824bc8361c\` FOREIGN KEY (\`taxUuid\`) REFERENCES \`tax\`(\`uuid\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`expense_taxes_tax\` ADD CONSTRAINT \`FK_48fca156e8d3f4d25db070fb75c\` FOREIGN KEY (\`expenseUuid\`) REFERENCES \`expense\`(\`uuid\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`expense_taxes_tax\` ADD CONSTRAINT \`FK_85563d6914de14c6125afe8f135\` FOREIGN KEY (\`taxUuid\`) REFERENCES \`tax\`(\`uuid\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`expense_taxes_tax\` DROP FOREIGN KEY \`FK_85563d6914de14c6125afe8f135\``);
        await queryRunner.query(`ALTER TABLE \`expense_taxes_tax\` DROP FOREIGN KEY \`FK_48fca156e8d3f4d25db070fb75c\``);
        await queryRunner.query(`ALTER TABLE \`recurring_expense_taxes_tax\` DROP FOREIGN KEY \`FK_213857952cb276e02824bc8361c\``);
        await queryRunner.query(`ALTER TABLE \`recurring_expense_taxes_tax\` DROP FOREIGN KEY \`FK_781625b66d54f518c194abcd790\``);
        await queryRunner.query(`ALTER TABLE \`api_key\` DROP FOREIGN KEY \`FK_2bef20937d8a3f23d66d65c2a7b\``);
        await queryRunner.query(`ALTER TABLE \`exchange_rate\` DROP FOREIGN KEY \`FK_260c65baaaa4cba14b85d6e26d1\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP FOREIGN KEY \`FK_d55dfffa460c30fcb883c9b44bf\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP FOREIGN KEY \`FK_af8574404a31e25a356319d7a74\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP FOREIGN KEY \`FK_cf05486337b769f6c0e0cd1fac0\``);
        await queryRunner.query(`ALTER TABLE \`expense\` DROP FOREIGN KEY \`FK_f732a48281896146febd58d4f2f\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP FOREIGN KEY \`FK_86299ba198601cbac8f90942436\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP FOREIGN KEY \`FK_01d1827e6069ccd75efea20a730\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP FOREIGN KEY \`FK_e63893cc5604abe13010c355be7\``);
        await queryRunner.query(`ALTER TABLE \`income\` DROP FOREIGN KEY \`FK_7d8ea373c13e7054ededd2fec3b\``);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` DROP FOREIGN KEY \`FK_3b9767e4376f2df34a17e7ccdda\``);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` DROP FOREIGN KEY \`FK_3bb15ca76e04029081c3f30e28e\``);
        await queryRunner.query(`ALTER TABLE \`recurring_expense\` DROP FOREIGN KEY \`FK_7dc55dd556e8a2ae600761aa6e9\``);
        await queryRunner.query(`ALTER TABLE \`payment_method\` DROP FOREIGN KEY \`FK_7d095a533665bd8d36386a56f20\``);
        await queryRunner.query(`ALTER TABLE \`payment_method\` DROP FOREIGN KEY \`FK_cc1c3ecac2cc6caf991e8665fb1\``);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` DROP FOREIGN KEY \`FK_945e38574c8d12a25d8ad484bea\``);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` DROP FOREIGN KEY \`FK_ecd01cf575b87648fe01b7f58f1\``);
        await queryRunner.query(`ALTER TABLE \`recurring_income\` DROP FOREIGN KEY \`FK_c1e5e6436460acfa329b33087d5\``);
        await queryRunner.query(`ALTER TABLE \`account\` DROP FOREIGN KEY \`FK_f6cf13404290564d6992f5e4158\``);
        await queryRunner.query(`ALTER TABLE \`account\` DROP FOREIGN KEY \`FK_838c93e50d7e0d3096d7e294f22\``);
        await queryRunner.query(`ALTER TABLE \`tax\` DROP FOREIGN KEY \`FK_15d53a4119b2296c4f2ef438483\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_a8a0f575ca29ee9b028cb8b2a1c\``);
        await queryRunner.query(`DROP INDEX \`IDX_85563d6914de14c6125afe8f13\` ON \`expense_taxes_tax\``);
        await queryRunner.query(`DROP INDEX \`IDX_48fca156e8d3f4d25db070fb75\` ON \`expense_taxes_tax\``);
        await queryRunner.query(`DROP TABLE \`expense_taxes_tax\``);
        await queryRunner.query(`DROP INDEX \`IDX_213857952cb276e02824bc8361\` ON \`recurring_expense_taxes_tax\``);
        await queryRunner.query(`DROP INDEX \`IDX_781625b66d54f518c194abcd79\` ON \`recurring_expense_taxes_tax\``);
        await queryRunner.query(`DROP TABLE \`recurring_expense_taxes_tax\``);
        await queryRunner.query(`DROP TABLE \`api_key\``);
        await queryRunner.query(`DROP TABLE \`exchange_rate\``);
        await queryRunner.query(`DROP TABLE \`expense\``);
        await queryRunner.query(`DROP TABLE \`income\``);
        await queryRunner.query(`DROP TABLE \`recurring_expense\``);
        await queryRunner.query(`DROP TABLE \`payment_method\``);
        await queryRunner.query(`DROP TABLE \`recurring_income\``);
        await queryRunner.query(`DROP TABLE \`account\``);
        await queryRunner.query(`DROP INDEX \`IDX_723472e41cae44beb0763f4039\` ON \`currency\``);
        await queryRunner.query(`DROP TABLE \`currency\``);
        await queryRunner.query(`DROP TABLE \`tax\``);
        await queryRunner.query(`DROP INDEX \`REL_a8a0f575ca29ee9b028cb8b2a1\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`user_settings\``);
    }

}
