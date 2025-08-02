import axios from 'axios';
import type { CredentialResponse, SignUpDto } from '../../model/auth';
import type { Currency, CurrencyDto } from '../../model/currencies';
import type { PaymentMethod, PaymentMethodDto } from '../../model/payment-methods';
import type { ExchangeRate } from '../../model/exchange-rates';
import type { Account, AccountDto } from '../../model/accounts';
import type { Income, IncomeDto, RecurringIncome, RecurringIncomeDto } from '../../model/income';
import type { Expense, ExpenseDto, RecurringExpense, RecurringExpenseDto } from '../../model/expenses';
import type { Tax, TaxDto } from '../../model/taxes';
import { DateTime } from 'luxon';

export class ApiService {
  private static readonly API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api';

  static async login(body: { username: string; password: string }): Promise<CredentialResponse> {
    return axios.post<CredentialResponse>(`${this.API_BASE_URL}/auth/login`, body).then((res) => res.data);
  }

  static async register(body: SignUpDto): Promise<CredentialResponse> {
    if (!body.email) delete body.email;
    return axios.post<CredentialResponse>(`${this.API_BASE_URL}/auth/register`, body).then((res) => res.data);
  }

  static async getHomeExpensesByPaymentMethod(queryParams: { rangeStart: string; rangeEnd: string }): Promise<any> {
    return axios
      .get<any>(`${this.API_BASE_URL}/stats/expenses/by-payment-method`, { params: queryParams })
      .then((res) => res.data);
  }

  static async getHomeIncomeByAccount(queryParams: { rangeStart: string; rangeEnd: string }): Promise<any> {
    return axios
      .get<any>(`${this.API_BASE_URL}/stats/income/by-account`, { params: queryParams })
      .then((res) => res.data);
  }

  static async getUserSummary(queryParams: { filterBy: string }): Promise<any> {
    return axios
      .get<any>(`${this.API_BASE_URL}/stats/summary`, { params: queryParams })
      .then((res) => res.data)
      .then((data) => {
        return data.map((item: any) => ({
          date: DateTime.fromISO(item.date).toFormat('MMM'),
          Expenses: item.Expenses,
          Income: item.Income,
        }));
      });
  }

  static async getUserUpcomingDueDates(): Promise<any> {
    return axios.get<any>(`${this.API_BASE_URL}/stats/upcoming-due-dates`).then((res) => res.data);
  }

  static async getCurrencies(): Promise<Currency[]> {
    return axios.get<Currency[]>(`${this.API_BASE_URL}/currencies`).then((res) => res.data);
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

  static async getUserIncome(): Promise<Income[]> {
    return axios.get<Income[]>(`${this.API_BASE_URL}/income/onetime`).then((res) => res.data);
  }

  static async getUserIncomeByUuid(incomeUuid: string): Promise<Income> {
    return axios.get<Income>(`${this.API_BASE_URL}/income/onetime/${incomeUuid}`).then((res) => res.data);
  }

  static async getUserRecurringIncome(): Promise<RecurringIncome[]> {
    return axios.get<RecurringIncome[]>(`${this.API_BASE_URL}/income/recurring`).then((res) => res.data);
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

  static async getUserExpenses(params: { rangeStart: string | null; rangeEnd: string | null }): Promise<Expense[]> {
    return axios.get<Expense[]>(`${this.API_BASE_URL}/expenses/onetime`, { params }).then((res) => res.data);
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

  static async getUserExpensesRecurring(): Promise<RecurringExpense[]> {
    return axios.get<RecurringExpense[]>(`${this.API_BASE_URL}/expenses/recurring`).then((res) => res.data);
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
}

