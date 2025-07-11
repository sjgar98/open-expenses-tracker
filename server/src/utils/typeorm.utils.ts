export enum SupportedDriver {
  MARIADB = 'mariadb',
  SQLITE = 'better-sqlite3',
}

export function getDataSourceDriver(dbDriver: string | undefined): SupportedDriver | null {
  switch (dbDriver) {
    case 'mariadb':
      return SupportedDriver.MARIADB;
    case 'sqlite':
      return SupportedDriver.SQLITE;
    case undefined:
      return null;
    default:
      throw new Error(`Unsupported database driver: ${dbDriver}`);
  }
}
