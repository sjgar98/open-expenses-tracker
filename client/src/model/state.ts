import type { AuthState } from './auth';
import type { ExpensesState } from './expenses';
import type { HomeState } from './home';
import type { IncomeState } from './income';
import type { LangState } from './lang';
import type { SavingsState } from './savings';

export interface AppState {
  auth: AuthState;
  lang: LangState;
  home: HomeState;
  income: IncomeState;
  expenses: ExpensesState;
  savings: SavingsState;
}

