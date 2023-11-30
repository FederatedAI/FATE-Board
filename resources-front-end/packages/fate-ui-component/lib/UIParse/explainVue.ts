/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApp } from 'vue';
import explain, { ExplainableConfiguration } from './AST/explain';
import Configuration from './configuration';
import ASTNodeVue from './nodeVue';

export default async function explainWithVue(
  configuration: ExplainableConfiguration,
  root?: Element,
  options?: {
    replace?: boolean
  }
) {
  Configuration.Basic = 'vue';
  const node: ASTNodeVue<any> = <any>await explain(configuration, options);
  if (root) {
    const vueComponent = node.toVue((tag: any) => tag);
    const app = createApp(vueComponent);
    app.mount(root);
  }
  return node;
}

explainWithVue.Configuration = Configuration;
