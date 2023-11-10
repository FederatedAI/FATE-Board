import HTTPRequest, { ErrorCode } from './service';

interface APIConfiguration {
  [APIName: string]: {
    url: string;
    method: string;
  };
}

/**
 * API initing
 * @param APIs APIConfiguration | api configuration
 * @param mock boolean | is mock
 * @param codes object | error code
 * @returns apis
 */
export default function HTTPInit(
  APIs: APIConfiguration,
  mock: boolean,
  codes: ErrorCode
) {
  const service = HTTPRequest(mock, codes);
  const apis: any = {};

  for (const APIId in APIs) {
    const configuration = APIs[APIId];
    const request = <P extends object>(parameter: P) => {
      return service(Object.assign({ [ configuration.method.match(/post/i) ? 'data' : 'params']: parameter }, configuration));
    };
    apis[APIId] = request
  }
  return apis;
}
