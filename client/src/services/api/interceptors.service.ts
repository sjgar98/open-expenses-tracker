import type { InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

export class InterceptorsService {
  public static setupInterceptors() {
    axios.interceptors.request.use(this.authTokenInterceptor);
  }

  private static authTokenInterceptor(config: InternalAxiosRequestConfig<any>) {
    const authToken = localStorage.getItem('oet_auth_jwt');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  }
}

