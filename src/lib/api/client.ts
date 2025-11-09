/**
 * Enhanced API Client
 *
 * Production-grade API client with:
 * - Exponential backoff retry logic
 * - Request/response interceptors
 * - Custom error handling
 * - Request timeout management
 * - Comprehensive logging
 * - Type-safe responses
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "@/constants";
import {
  ApiError,
  NetworkError,
  TimeoutError,
  createErrorFromResponse,
} from "./errors";
import { createLogger } from "@/lib/logger";

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  shouldRetry: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: API_CONFIG.RETRY_ATTEMPTS,
  retryDelay: API_CONFIG.RETRY_DELAY,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error: AxiosError): boolean => {
    if (!error.response) {
      // Network errors are retryable
      return true;
    }
    return DEFAULT_RETRY_CONFIG.retryableStatuses.includes(
      error.response.status
    );
  },
};

function calculateBackoffDelay(attempt: number, baseDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createAxiosInstance(): AxiosInstance {
  return axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

class ApiClient {
  private instance: AxiosInstance;
  private retryConfig: RetryConfig;
  private logger = createLogger("ApiClient");

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.instance = createAxiosInstance();
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        this.logger.apiRequest(
          config.method || "GET",
          config.url || "",
          config.params as Record<string, unknown>
        );
        return config;
      },
      (error: AxiosError) => {
        this.logger.error("Request interceptor error", error);
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => {
        this.logger.apiResponse(
          response.status,
          response.config.url || "",
          response.data
        );
        return response.data;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const config = error.config as AxiosRequestConfig & {
      _retryCount?: number;
    };

    if (!config._retryCount) {
      config._retryCount = 0;
    }

    const shouldRetry = this.retryConfig.shouldRetry(error);
    const canRetry = config._retryCount < this.retryConfig.maxRetries;

    if (shouldRetry && canRetry) {
      config._retryCount += 1;
      const delay = calculateBackoffDelay(
        config._retryCount,
        this.retryConfig.retryDelay
      );

      this.logger.warn(
        `Retry attempt ${config._retryCount}/${this.retryConfig.maxRetries}`,
        {
          url: config.url,
          delayMs: delay,
          error: error.message,
        }
      );

      await sleep(delay);
      return this.instance.request(config);
    }

    const apiError = this.convertToApiError(error);
    this.logger.apiError(config.url || "", apiError);
    return Promise.reject(apiError);
  }

  private convertToApiError(error: AxiosError): ApiError {
    const endpoint = error.config?.url;

    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        return new TimeoutError("Request timeout", endpoint, {
          code: error.code,
          details: { message: error.message },
        });
      }
      return new NetworkError(
        error.message || "Network connection failed",
        endpoint,
        { code: error.code, details: { message: error.message } }
      );
    }

    const { status, data } = error.response;
    const message =
      (data as { message?: string })?.message ||
      error.message ||
      "API request failed";

    return createErrorFromResponse(status, message, endpoint, {
      details: data as Record<string, unknown>,
    });
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<T, T>(url, config);
  }

  public async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.post<T, T, D>(url, data, config);
  }

  public async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.put<T, T, D>(url, data, config);
  }

  public async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.patch<T, T, D>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<T, T>(url, config);
  }

  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient();

export { ApiClient };
