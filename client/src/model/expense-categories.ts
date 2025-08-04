export interface ExpenseCategory {
  uuid: string;
  name: string;
  icon: string;
  iconColor: string;
  isDeleted: boolean;
}

export interface ExpenseCategoryDto {
  name: string;
  icon: string;
  iconColor: string;
}
