import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { deletePersistedCache } from '../query/query-client';

export class InterceptorsService {
  public static setupInterceptors() {
    axios.interceptors.request.use(this.authTokenInterceptor);
    axios.interceptors.response.use(...this.unauthorizedInterceptor());
  }

  private static authTokenInterceptor(config: InternalAxiosRequestConfig<any>) {
    const authToken = localStorage.getItem('oet_auth_jwt');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
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

