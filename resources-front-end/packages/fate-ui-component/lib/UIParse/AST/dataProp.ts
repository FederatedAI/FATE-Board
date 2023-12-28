import DataAsync from './dataAsync';
import ASTNode from './node';

export default class DataProp<C extends object> extends DataAsync<C> {
  constructor(defaultValue: C, node: ASTNode<C>) {
    super(defaultValue, node, false, true);
  }
}
