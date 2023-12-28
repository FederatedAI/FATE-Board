import ActionCol from './ActionCol.vue';
import EditbleCol from './EditableCol.vue';
import IndexCol from './IndexCol.vue';
import LinkCol from './LinkCol.vue';
import NormalCol from './NormalCol.vue';
import ProgressCol from './ProgressCol.vue';

export type ColumnConfig = {
  prop: string;
  label: string;
  type?: string;
  [attr: string]: unknown;
};

export const columnExplain = (col: ColumnConfig) => {
  if (col.type) {
    if (col.type.match(/link/i)) {
      return LinkCol;
    } else if (col.type.match(/edit/i)) {
      return EditbleCol;
    } else if (col.type.match(/action/i)) {
      return ActionCol;
    } else if (col.type.match(/progress/i)) {
      return ProgressCol;
    } else if (col.type.match(/index/i)) {
      return IndexCol
    }
  } else {
    return NormalCol;
  }
};