import axios from 'axios';
import type { CredentialResponse, SignUpDto } from '../../model/auth';
import type { Currency, CurrencyDto } from '../../model/currencies';
import type { PaymentMethod, PaymentMethodDto } from '../../model/payment-methods';

export class ApiService {
  private static readonly API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api';

  static async login(body: { username: string; password: string }): Promise<CredentialResponse> {
    return axios.post<CredentialResponse>('http://localhost:3000/api/auth/login', body).then((res) => res.data);
  }

  static async register(body: SignUpDto): Promise<CredentialResponse> {
    if (!body.email) delete body.email;
    return axios.post<CredentialResponse>(`${this.API_BASE_URL}/auth/register`, body).then((res) => res.data);
  }

  static async getCurrenciesAll(): Promise<Currency[]> {
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

  static async seedCurrencies(): Promise<void> {
    return axios.post<void>(`${this.API_BASE_URL}/currencies/seed`).then((res) => res.data);
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
}

