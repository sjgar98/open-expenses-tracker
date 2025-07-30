export interface Tax {
  uuid: string;
  name: string;
  rate: number;
  isDeleted: boolean;
}

export interface TaxDto {
  name: string;
  rate: number;
}

