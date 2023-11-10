/* eslint-disable @typescript-eslint/no-explicit-any */
import { capitalize, isString } from 'lodash';
import Configuration from '../configuration';
import { ASTNodeConfiguration } from './declare';
import ASTNode from './node';

export interface ExplainableConfiguration extends ASTNodeConfiguration<object> {
  children?: ExplainableConfiguration[];
}

export default async function explain(configuration: ExplainableConfiguration) {
  const building = (configuration: ExplainableConfiguration) => {
    const children: object[] = [];
    if (configuration.children) {
      for (const child of configuration.children) {
        children.push(building(<ExplainableConfiguration>child));
      }
    }

    let current: any
    if (!isString(configuration)) {
      const Constructor: any = <ASTNode<object>>(
        (Configuration as any)[`${capitalize(Configuration.Basic)}Node`]
      );
      current = new Constructor(configuration);
      current.addChildren(<any>children);
    } else {
      current = configuration
    }

    return current;
  };
  const root = building(configuration);
  await root.init();
  return root;
}

explain.Configuration = Configuration;
