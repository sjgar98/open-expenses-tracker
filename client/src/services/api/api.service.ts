import axios from 'axios';
import type { CredentialResponse, SignUpDto } from '../../model/auth';
import type { Currency, CurrencyDto, CurrencyFilterDto } from '../../model/currencies';
import type { PaymentMethod, PaymentMethodDto } from '../../model/payment-methods';
import type { ExchangeRate } from '../../model/exchange-rates';
import type { Account, AccountDto } from '../../model/accounts';
import type { Income, IncomeDto, IncomeFilterDto, RecurringIncome, RecurringIncomeDto, RecurringIncomeFilterDto, } from '../../model/income';
import type { Expense, ExpenseDto, ExpenseFilterDto, RecurringExpense, RecurringExpenseDto, RecurringExpenseFilterDto, } from '../../model/expenses';
import type { Tax, TaxDto } from '../../model/taxes';
import { DateTime } from 'luxon';
import type { PaginatedResults } from '../../model/pagination';
import type { ExpenseCategory, ExpenseCategoryDto } from '../../model/expense-categories';
import type { IncomeSource, IncomeSourceDto } from '../../model/income-source';
import type { MonthlySummary, PieChartData, StatisticsResponse, UpcomingDueDate } from '../../model/widget';
import type { UserSettings, UserSettingsDto } from '../../model/user-settings';

export class ApiService {
  private static readonly API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api';

  static async login(body: { username: string; password: string }): Promise<CredentialResponse> {
    return axios.post<CredentialResponse>(`${this.API_BASE_URL}/auth/login`, body).then((res) => res.data);
  }

  static async register(body: SignUpDto): Promise<CredentialResponse> {
    if (!body.email) delete body.email;
    return axios.post<CredentialResponse>(`${this.API_BASE_URL}/auth/register`, body).then((res) => res.data);
  }

  static async getUserSettings(): Promise<UserSettings> {
    return axios.get<UserSettings>(`${this.API_BASE_URL}/user-settings`).then((res) => res.data);
  }

  static async updateUserSettings(settingsDto: UserSettingsDto): Promise<UserSettings> {
    return axios.put<UserSettings>(`${this.API_BASE_URL}/user-settings`, settingsDto).then((res) => res.data);
  }

  static async getHomeExpensesByPaymentMethod(queryParams: {
    rangeStart: string;
    rangeEnd: string;
  }): Promise<StatisticsResponse<PieChartData>> {
    return axios
      .get<
        StatisticsResponse<PieChartData>
      >(`${this.API_BASE_URL}/stats/expenses/by-payment-method`, { params: queryParams })
      .then((res) => res.data);
  }

  static async getHomeExpensesByCategory(queryParams: {
    rangeStart: string;
    rangeEnd: string;
  }): Promise<StatisticsResponse<PieChartData>> {
    return axios
      .get<StatisticsResponse<PieChartData>>(`${this.API_BASE_URL}/stats/expenses/by-category`, { params: queryParams })
      .then((res) => res.data);
  }

  static async getHomeIncomeByAccount(queryParams: {
    rangeStart: string;
    rangeEnd: string;
  }): Promise<StatisticsResponse<PieChartData>> {
    return axios
      .get<StatisticsResponse<PieChartData>>(`${this.API_BASE_URL}/stats/income/by-account`, { params: queryParams })
      .then((res) => res.data);
  }

  static async getHomeIncomeBySource(queryParams: {
    rangeStart: string;
    rangeEnd: string;
  }): Promise<StatisticsResponse<PieChartData>> {
    return axios
      .get<StatisticsResponse<PieChartData>>(`${this.API_BASE_URL}/stats/income/by-source`, { params: queryParams })
      .then((res) => res.data);
  }

  static async getUserSummary(queryParams: { filterBy: string }): Promise<StatisticsResponse<MonthlySummary>> {
    return axios
      .get<StatisticsResponse<MonthlySummary>>(`${this.API_BASE_URL}/stats/summary`, { params: queryParams })
      .then((res) => res.data)
      .then((response) => {
        return {
          displayCurrency: response.displayCurrency,
          data: response.data.map((item: any) => ({
            date: DateTime.fromISO(item.date).toFormat('MMM'),
            Expenses: item.Expenses,
            Income: item.Income,
          })),
        };
      });
  }

  static async getUserUpcomingDueDates(): Promise<UpcomingDueDate[]> {
    return axios.get<any>(`${this.API_BASE_URL}/stats/upcoming-due-dates`).then((res) => res.data);
  }

  static async getUserUpcomingExpenses(filterBy: string): Promise<RecurringExpense[]> {
    return axios
      .get<any>(`${this.API_BASE_URL}/stats/upcoming-expenses`, { params: { filterBy } })
      .then((res) => res.data);
  }

  static async getCurrenciesPaginated(params: CurrencyFilterDto): Promise<PaginatedResults<Currency>> {
    return axios.get<PaginatedResults<Currency>>(`${this.API_BASE_URL}/currencies`, { params }).then((res) => res.data);
  }

  static async getCurrencies(): Promise<Currency[]> {
    return axios.get<Currency[]>(`${this.API_BASE_URL}/currencies/all`).then((res) => res.data);
  }

  static async saveNewCurrency(data: CurrencyDto): Promise<void> {
    return axios.post<void>(`${this.API_BASE_URL}/currencies/new`, data).then((res) => res.data);
  }

  static async getCurrencyById(id: string): Promise<Currency> {
    return axios.get<Currency>(`${this.API_BASE_URL}/currencies/${id}`).then((res) => res.data);
  }

  static async updateCurrency(id: number, data: CurrencyDto): Promise<void> {
    return axios.put<void>(`${this.API_BASE_URL}/currencies/${id}`, data).then((res) => res.data);
  }

  static async deleteCurrency(id: number): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/currencies/${id}`).then((res) => res.data);
  }

  static async seedCurrencies(): Promise<number> {
    return axios.post<number>(`${this.API_BASE_URL}/currencies/seed`).then((res) => res.data);
  }

  static async getExchangeRates(): Promise<ExchangeRate[]> {
    return axios.get<ExchangeRate[]>(`${this.API_BASE_URL}/exchange-rates`).then((res) => res.data);
  }

  static async seedExchangeRates(): Promise<void> {
    return axios.post<void>(`${this.API_BASE_URL}/exchange-rates/update`).then((res) => res.data);
  }

  static async getHistoricExchangeRates(date: string): Promise<Record<string, number>> {
    return axios
      .get<Record<string, number>>(`${this.API_BASE_URL}/exchange-rates/historic/${date}`)
      .then((res) => res.data);
  }

  static async updateHistoricExchangeRates(date: string, rates: Record<string, number>): Promise<void> {
    return axios.put<void>(`${this.API_BASE_URL}/exchange-rates/historic/${date}`, rates).then((res) => res.data);
  }

  static async getUserPaymentMethods(): Promise<PaymentMethod[]> {
    return axios.get<PaymentMethod[]>(`${this.API_BASE_URL}/payment-methods`).then((res) => res.data);
  }

  static async getUserPaymentMethodByUuid(uuid: string): Promise<PaymentMethod> {
    return axios.get<PaymentMethod>(`${this.API_BASE_URL}/payment-methods/${uuid}`).then((res) => res.data);
  }

  static async saveNewPaymentMethod(data: PaymentMethodDto): Promise<void> {
    return axios.post<void>(`${this.API_BASE_URL}/payment-methods`, data).then((res) => res.data);
  }

  static async getPaymentMethod(uuid: string): Promise<PaymentMethod> {
    return axios.get<PaymentMethod>(`${this.API_BASE_URL}/payment-methods/${uuid}`).then((res) => res.data);
  }

  static async updatePaymentMethod(uuid: string, data: PaymentMethodDto): Promise<void> {
    return axios.put<void>(`${this.API_BASE_URL}/payment-methods/${uuid}`, data).then((res) => res.data);
  }

  static async deletePaymentMethod(uuid: string): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/payment-methods/${uuid}`).then((res) => res.data);
  }

  static async getAccounts(): Promise<Account[]> {
    return axios.get<Account[]>(`${this.API_BASE_URL}/accounts`).then((res) => res.data);
  }

  static async getAccountByUuid(uuid: string): Promise<Account> {
    return axios.get<Account>(`${this.API_BASE_URL}/accounts/${uuid}`).then((res) => res.data);
  }

  static async createAccount(accountDto: AccountDto): Promise<Account> {
    return axios.post<Account>(`${this.API_BASE_URL}/accounts`, accountDto).then((res) => res.data);
  }

  static async updateAccount(accountUuid: string, accountDto: AccountDto): Promise<Account> {
    return axios.put<Account>(`${this.API_BASE_URL}/accounts/${accountUuid}`, accountDto).then((res) => res.data);
  }

  static async deleteAccount(accountUuid: string): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/accounts/${accountUuid}`).then((res) => res.data);
  }

  static async getUserIncome(params: IncomeFilterDto): Promise<PaginatedResults<Income>> {
    return axios
      .get<PaginatedResults<Income>>(`${this.API_BASE_URL}/income/onetime`, { params })
      .then((res) => res.data);
  }

  static async getUserIncomeByUuid(incomeUuid: string): Promise<Income> {
    return axios.get<Income>(`${this.API_BASE_URL}/income/onetime/${incomeUuid}`).then((res) => res.data);
  }

  static async getUserRecurringIncome(params: RecurringIncomeFilterDto): Promise<PaginatedResults<RecurringIncome>> {
    return axios
      .get<PaginatedResults<RecurringIncome>>(`${this.API_BASE_URL}/income/recurring`, { params })
      .then((res) => res.data);
  }

  static async getUserRecurringIncomeByUuid(recurringIncomeUuid: string): Promise<RecurringIncome> {
    return axios
      .get<RecurringIncome>(`${this.API_BASE_URL}/income/recurring/${recurringIncomeUuid}`)
      .then((res) => res.data);
  }

  static async createUserIncome(incomeDto: IncomeDto): Promise<Income> {
    return axios.post<Income>(`${this.API_BASE_URL}/income/onetime`, incomeDto).then((res) => res.data);
  }

  static async createUserRecurringIncome(recurringIncomeDto: RecurringIncomeDto): Promise<RecurringIncome> {
    return axios
      .post<RecurringIncome>(`${this.API_BASE_URL}/income/recurring`, recurringIncomeDto)
      .then((res) => res.data);
  }

  static async updateUserIncome(incomeUuid: string, incomeDto: IncomeDto): Promise<Income> {
    return axios.put<Income>(`${this.API_BASE_URL}/income/onetime/${incomeUuid}`, incomeDto).then((res) => res.data);
  }

  static async updateUserRecurringIncome(
    recurringIncomeUuid: string,
    recurringIncomeDto: RecurringIncomeDto
  ): Promise<RecurringIncome> {
    return axios
      .put<RecurringIncome>(`${this.API_BASE_URL}/income/recurring/${recurringIncomeUuid}`, recurringIncomeDto)
      .then((res) => res.data);
  }

  static async deleteUserIncome(incomeUuid: string): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/income/onetime/${incomeUuid}`).then((res) => res.data);
  }

  static async deleteUserRecurringIncome(recurringIncomeUuid: string): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/income/recurring/${recurringIncomeUuid}`).then((res) => res.data);
  }

  static async getUserExpenses(params: ExpenseFilterDto): Promise<PaginatedResults<Expense>> {
    return axios
      .get<PaginatedResults<Expense>>(`${this.API_BASE_URL}/expenses/onetime`, { params })
      .then((res) => res.data);
  }

  static async getUserExpenseByUuid(expenseUuid: string): Promise<Expense> {
    return axios.get<Expense>(`${this.API_BASE_URL}/expenses/onetime/${expenseUuid}`).then((res) => res.data);
  }

  static async createUserExpense(expenseDto: ExpenseDto): Promise<Expense> {
    return axios.post<Expense>(`${this.API_BASE_URL}/expenses/onetime`, expenseDto).then((res) => res.data);
  }

  static async updateUserExpense(expenseUuid: string, expenseDto: ExpenseDto): Promise<Expense> {
    return axios
      .put<Expense>(`${this.API_BASE_URL}/expenses/onetime/${expenseUuid}`, expenseDto)
      .then((res) => res.data);
  }

  static async deleteUserExpense(expenseUuid: string): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/expenses/onetime/${expenseUuid}`).then((res) => res.data);
  }

  static async getUserExpensesRecurring(
    params: RecurringExpenseFilterDto
  ): Promise<PaginatedResults<RecurringExpense>> {
    return axios
      .get<PaginatedResults<RecurringExpense>>(`${this.API_BASE_URL}/expenses/recurring`, { params })
      .then((res) => res.data);
  }

  static async getUserExpenseRecurringByUuid(recurringExpenseUuid: string): Promise<RecurringExpense> {
    return axios
      .get<RecurringExpense>(`${this.API_BASE_URL}/expenses/recurring/${recurringExpenseUuid}`)
      .then((res) => res.data);
  }

  static async createUserExpenseRecurring(recurringExpenseDto: RecurringExpenseDto): Promise<RecurringExpense> {
    return axios
      .post<RecurringExpense>(`${this.API_BASE_URL}/expenses/recurring`, recurringExpenseDto)
      .then((res) => res.data);
  }

  static async updateUserExpenseRecurring(
    recurringExpenseUuid: string,
    recurringExpenseDto: RecurringExpenseDto
  ): Promise<RecurringExpense> {
    return axios
      .put<RecurringExpense>(`${this.API_BASE_URL}/expenses/recurring/${recurringExpenseUuid}`, recurringExpenseDto)
      .then((res) => res.data);
  }

  static async deleteUserExpenseRecurring(recurringExpenseUuid: string): Promise<void> {
    return axios
      .delete<void>(`${this.API_BASE_URL}/expenses/recurring/${recurringExpenseUuid}`)
      .then((res) => res.data);
  }

  static async getUserTaxes(): Promise<Tax[]> {
    return axios.get<Tax[]>(`${this.API_BASE_URL}/taxes`).then((res) => res.data);
  }

  static async getUserTaxByUuid(uuid: string): Promise<Tax> {
    return axios.get<Tax>(`${this.API_BASE_URL}/taxes/${uuid}`).then((res) => res.data);
  }

  static async createUserTax(taxDto: TaxDto): Promise<Tax> {
    return axios.post<Tax>(`${this.API_BASE_URL}/taxes`, taxDto).then((res) => res.data);
  }

  static async updateUserTax(uuid: string, taxDto: TaxDto): Promise<Tax> {
    return axios.put<Tax>(`${this.API_BASE_URL}/taxes/${uuid}`, taxDto).then((res) => res.data);
  }

  static async deleteUserTax(uuid: string): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/taxes/${uuid}`).then((res) => res.data);
  }

  static async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return axios.get<ExpenseCategory[]>(`${this.API_BASE_URL}/expense-categories`).then((res) => res.data);
  }

  static async getExpenseCategoryByUuid(uuid: string): Promise<ExpenseCategory> {
    return axios.get<ExpenseCategory>(`${this.API_BASE_URL}/expense-categories/${uuid}`).then((res) => res.data);
  }

  static async createExpenseCategory(categoryDto: ExpenseCategoryDto): Promise<ExpenseCategory> {
    return axios.post<ExpenseCategory>(`${this.API_BASE_URL}/expense-categories`, categoryDto).then((res) => res.data);
  }

  static async updateExpenseCategory(uuid: string, categoryDto: ExpenseCategoryDto): Promise<ExpenseCategory> {
    return axios
      .put<ExpenseCategory>(`${this.API_BASE_URL}/expense-categories/${uuid}`, categoryDto)
      .then((res) => res.data);
  }

  static async deleteExpenseCategory(uuid: string): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/expense-categories/${uuid}`).then((res) => res.data);
  }

  static async getIncomeSources(): Promise<IncomeSource[]> {
    return axios.get<IncomeSource[]>(`${this.API_BASE_URL}/income-sources`).then((res) => res.data);
  }

  static async getIncomeSourceByUuid(uuid: string): Promise<IncomeSource> {
    return axios.get<IncomeSource>(`${this.API_BASE_URL}/income-sources/${uuid}`).then((res) => res.data);
  }

  static async createIncomeSource(sourceDto: IncomeSourceDto): Promise<IncomeSource> {
    return axios.post<IncomeSource>(`${this.API_BASE_URL}/income-sources`, sourceDto).then((res) => res.data);
  }

  static async updateIncomeSource(uuid: string, sourceDto: IncomeSourceDto): Promise<IncomeSource> {
    return axios.put<IncomeSource>(`${this.API_BASE_URL}/income-sources/${uuid}`, sourceDto).then((res) => res.data);
  }

  static async deleteIncomeSource(uuid: string): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/income-sources/${uuid}`).then((res) => res.data);
  }
}

