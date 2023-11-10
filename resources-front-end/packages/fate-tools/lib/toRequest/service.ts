/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosResponse,
  CreateAxiosDefaults
} from 'axios';
import { isBoolean } from 'lodash';
import toFile from '../toFile';

export interface BasicConfigForParameter extends CreateAxiosDefaults<unknown> {
  ConsolePrinting?: boolean;
}

export interface BasicResponseData {
  code: number;
  msg: string;
  data: unknown;
}

export interface ErrorCode {
  [code: number | string]: (response: BasicResponseData) => unknown;
}

let service: AxiosInstance | undefined = undefined;

/**
 * Create or Get service instance from axios
 * @returns axios service instance
 */
export default function HTTPRequest(
  mockOrConfig: boolean,
  errorCode: ErrorCode
): AxiosInstance;

export default function HTTPRequest<B extends BasicConfigForParameter>(
  mockOrConfig: B,
  errorCode: ErrorCode
): AxiosInstance;

export default function HTTPRequest<B extends BasicConfigForParameter>(
  mockOrConfig: B | boolean,
  errorCode: ErrorCode
): AxiosInstance {
  if (!service) {
    /**
     * create service instance
     */
    service = axios.create(
      isBoolean(mockOrConfig)
        ? {
            baseURL: mockOrConfig ? '/' : window.location.origin,
            withCredentials: !mockOrConfig,
            timeout: 20000,
          }
        : mockOrConfig
    );

    /**
     * request interceptor
     */
    service.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        if (
          isBoolean(mockOrConfig) ? mockOrConfig : mockOrConfig.ConsolePrinting
        ) {
          console.error(error);
        }
        return Promise.reject(error);
      }
    );

    /**
     * response interceptor
     *
     * structure for response: {
     *  msg: string
     *  code: number
     *  data: unknown
     * }
     */
    service.interceptors.response.use(
      (response: AxiosResponse<any, any>): any => {
        const rspHead: any = response.headers;
        const rspBody: BasicResponseData | string = response.data;
        const reqConfig = response.config

        const bodyExplain = (body: BasicResponseData) => {
          if (body.code === 0) {
            return Promise.resolve(body.data || true);
          } else {
            return Promise.resolve((errorCode[body.code] || errorCode['error'])(body)).then((request: unknown) => {
              if (request && service) {
                return <any>service(reqConfig)
              } else {
                return body
              }
            })
          }
        };

        if (
          rspHead['content-disposition'] ||
          rspBody.toString().match(/blob/i)
        ) {
          return new Promise((resolve) => {
            const filename = rspHead['content-disposition']
              ? rspHead['content-disposition'].split('=')[1]
              : '';

            const fileReader: FileReader = new FileReader();

            fileReader.addEventListener('loadend', function () {
              const result = JSON.parse(<string>fileReader.result);
              if (result.code !== undefined) {
                resolve(<unknown>bodyExplain(result));
              } else {
                toFile(<string>result, filename);
                resolve({ code: 0, data: '', msg: 'file download' });
              }
            });

            fileReader.readAsText(<any>rspBody);
          });
        } else {
          return bodyExplain(<BasicResponseData>rspBody);
        }
      },

      (error) => {
        if (
          isBoolean(mockOrConfig) ? mockOrConfig : mockOrConfig.ConsolePrinting
        ) {
          console.error(error);
        }
        return Promise.reject(error);
      }
    );
  }
  return service;
}
