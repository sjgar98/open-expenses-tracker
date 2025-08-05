import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

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
    const onRejected = (error: any) => {
      if (error.status === 401) {
        localStorage.removeItem('oet_auth_jwt');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    };
    return [onFulfilled, onRejected];
  }
}

