import axios, { AxiosRequestConfig } from "axios";

class ApiClient {
  private apiClient;

  constructor() {
    this.apiClient = axios.create({
      withCredentials: false,
    });
  }

  // GET_METHOD
  public async get<T>(
    url: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.apiClient.get<T>(url, { params, ...config });
    return response.data;
  }

  //POST_METHOD
  public async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.apiClient.post<T>(url, data, config);
    return response.data;
  }

  //PUT_METHOD
  public async put<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.apiClient.put<T>(url, data, config);
    return response.data;
  }

  //DELETE_METHODS
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.apiClient.delete<T>(url, config);
    return response.data;
  }
}
const API = new ApiClient();
export default API;
