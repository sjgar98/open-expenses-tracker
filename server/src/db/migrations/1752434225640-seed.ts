import { MigrationInterface } from 'typeorm';

export class Seed1752434225640 implements MigrationInterface {
  name = 'Seed1752434225640';
  public async up(queryRunner: any): Promise<void> {
    const currenciesFromApi = await fetch('https://openexchangerates.org/api/currencies.json')
      .then((r) => r.json())
      .then((data) => Object.entries(data).map(([code, name]: [string, string]) => ({ code, name })));
    await queryRunner.query(`
        INSERT INTO currency (code, name, visible)
        VALUES ${currenciesFromApi.map(({ code, name }) => `('${code}', '${name.replace("'", "''")}', 'false')`).join(',\n')};
    `);
  }
  public async down(queryRunner: any): Promise<void> {}
}

