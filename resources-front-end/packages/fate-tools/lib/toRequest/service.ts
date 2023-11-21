/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosResponse,
  CreateAxiosDefaults
} from 'axios';
import { ElMessage } from 'element-plus';
import { isBoolean, isNull, isObject, isUndefined } from 'lodash';
import toFile from '../toFile';

export interface BasicConfigForParameter extends CreateAxiosDefaults<unknown> {
  ConsolePrinting?: boolean;
}

export interface BasicResponseData {
  code: number;
  msg: string;
  data: unknown;
}

type CodeCheck = (response: BasicResponseData, reqConfig: any, service: any) => unknown

export interface ErrorCode {
  [code: number | string]: CodeCheck | {
    operation: CodeCheck,
    time?: number,
    message?: string
  };
}

let service: AxiosInstance | undefined = undefined;

const maxReConnect = 5
const reConnectMap = new Map()

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
          if (body.code === 0 || body.code === 200) {
            const data = isNull(body.code) ? true : (body.data || !!body.data)
            return Promise.resolve(data);
          } else {
            const check: any = errorCode[body.code] || errorCode['error']
            let maxTime = maxReConnect
            let operation:any = check
            let hintMsg: any
            if (isObject(check)) {
              maxTime = !isUndefined((check as any).time) ? (check as any).time : maxTime
              operation = operation.operation || (() => true)
              hintMsg = (check as any).message
            }

            const message = () => {
              if (process.env.NODE_ENV === 'development' || hintMsg)
              ElMessage({
                type: 'error',
                message: hintMsg || `code: ${body.code} - message: ${body.msg || String(body.data)}`,
                showClose: true,
                center: true
              })
              return Promise.reject(body)
            }

            const times = reConnectMap.get(reqConfig.url) || 0
            if (times < maxTime) {
              reConnectMap.set(reqConfig.url, times + 1)
              return Promise.resolve(operation(body, reqConfig, service)).then((res?: boolean) => {
                if (res === false) return message()
                else return (<any>service)(reqConfig)
              })
            } else {
              reConnectMap.delete(reqConfig.url)
              return message()
            }
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
