import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { onlineManager } from '@tanstack/react-query';
import { OfflineError } from '../../utils/offline.utils';
import { deletePersistedCache } from '../query/query-client';
import { isServerUnreachableError, markServerReachable, markServerUnreachable, } from '../connectivity/connectivity.service';

const GET_TIMEOUT_MS = 15000;

export class InterceptorsService {
  public static setupInterceptors() {
    axios.interceptors.request.use(this.authTokenInterceptor);
    axios.interceptors.response.use(...this.connectivityInterceptor());
    axios.interceptors.response.use(...this.unauthorizedInterceptor());
  }

  private static authTokenInterceptor(config: InternalAxiosRequestConfig<any>) {
    if (!onlineManager.isOnline()) {
      throw new OfflineError();
    }
    if ((config.method ?? 'get') === 'get' && !config.timeout) {
      config.timeout = GET_TIMEOUT_MS;
    }
    const authToken = localStorage.getItem('oet_auth_jwt');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  }

  private static connectivityInterceptor() {
    const onFulfilled = (response: AxiosResponse) => {
      markServerReachable();
      return response;
    };
    const onRejected = (error: unknown) => {
      if (isServerUnreachableError(error)) {
        markServerUnreachable();
      } else if (axios.isAxiosError(error) && error.response) {
        markServerReachable();
      }
      return Promise.reject(error);
    };
    return [onFulfilled, onRejected] as const;
  }

  private static unauthorizedInterceptor() {
    const onFulfilled = (response: AxiosResponse<any, any>) => response;
    const onRejected = async (error: any) => {
      const PUBLIC_URLS = ['/api/auth/login', '/api/auth/register'];
      if (error.status === 401 && !PUBLIC_URLS.includes(error.config.url)) {
        localStorage.removeItem('oet_auth_jwt');
        await deletePersistedCache();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    };
    return [onFulfilled, onRejected];
  }
}
