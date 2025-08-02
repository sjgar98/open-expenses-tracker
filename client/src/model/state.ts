import type { AuthState } from './auth';
import type { ExpensesState } from './expenses';
import type { IncomeState } from './income';
import type { LangState } from './lang';

export interface AppState {
  auth: AuthState;
  lang: LangState;
  income: IncomeState;
  expenses: ExpensesState;
}

