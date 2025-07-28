import type { InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import Cookies from 'universal-cookie';

export class InterceptorsService {
  public static setupInterceptors() {
    axios.interceptors.request.use(this.authTokenInterceptor);
  }

  private static authTokenInterceptor(config: InternalAxiosRequestConfig<any>) {
    const authToken = new Cookies(null, { path: '/' }).get('oet_auth_jwt');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  }
}

