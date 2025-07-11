import axios from 'axios';
import type { CredentialResponse } from '../../model/auth';
import type { Currency } from '../../model/currencies';

export class ApiService {
  private static readonly API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api';

  static async login(body: { username: string; password: string }): Promise<CredentialResponse> {
    return axios.post<CredentialResponse>('http://localhost:3000/api/auth/login', body).then((res) => res.data);
  }

  static async register(body: {
    username: string;
    password: string;
    repeatPassword: string;
    email?: string;
  }): Promise<CredentialResponse> {
    if (!body.email) delete body.email;
    return axios.post<CredentialResponse>(`${this.API_BASE_URL}/auth/register`, body).then((res) => res.data);
  }

  static async getCurrenciesAll(): Promise<Currency[]> {
    return axios.get<Currency[]>(`${this.API_BASE_URL}/currencies/all`).then((res) => res.data);
  }

  static async saveNewCurrency(data: Omit<Currency, 'id'>): Promise<void> {
    return axios.post<void>(`${this.API_BASE_URL}/currencies/new`, data).then((res) => res.data);
  }

  static async saveEditCurrency(data: Currency): Promise<void> {
    return axios.patch<void>(`${this.API_BASE_URL}/currencies/${data.id}`, data).then((res) => res.data);
  }

  static async deleteCurrency(id: number): Promise<void> {
    return axios.delete<void>(`${this.API_BASE_URL}/currencies/${id}`).then((res) => res.data);
  }
}
