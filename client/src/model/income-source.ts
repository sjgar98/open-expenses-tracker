export interface IncomeSource {
  uuid: string;
  name: string;
  color: string;
  isDeleted: boolean;
}

export interface IncomeSourceDto {
  name: string;
  color: string;
}
