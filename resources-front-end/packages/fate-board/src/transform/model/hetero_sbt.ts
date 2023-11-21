import { FTreeDisplay } from '@/components/TreeSelection';
import { isUndefined } from 'lodash';
import getModelData from '../tools/getModelData';

function TreeNodesExplain(
  nodes: any,
  hyper: any,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const TreeNodes: any = [];
  let TreeRoot: any;
  for (const node of nodes) {
    const instance = TreeNodeExplain(
      node,
      hyper,
      role,
      partyId,
      component,
      comp_type,
      id
    );
    if (!TreeRoot) {
      TreeRoot = instance.data;
    } else {
      const cursor = TreeNodes.findIndex(
        (node: any) => node.id === instance.parent
      );
      if (cursor >= 0) {
        const parent = TreeNodes[cursor].data || TreeNodes[cursor];
        if (!parent.children) parent.children = [];
        parent.children.push(instance.data);
      }
    }
    TreeNodes.unshift(instance);
  }
  return TreeRoot;
}

function TreeNodeExplain(
  node: any,
  hyper: any,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const {
    parent_nodeid: pid,
    nid,
    sitename,
    split_id,
    is_leaf: isLeaf,
    is_left_node: isLeftNode,
    weight,
    missing_dir: missDir,
    fid,
    bid,
    sample_num: sample,
  } = node;
  const [nRole, nPartyId] = sitename.split('_');
  const isHomoBoost = !!comp_type.match(/homo/i);
  const isMixMode = false;
  const isMultiNodes = isMixMode && role.match(/guest/i);

  const FidVariable = 'FidMapping'; // F
  const TreePartyId = 'TreePartyId';

  // node title or id
  let key =
    (isMultiNodes && isUndefined(fid) ? 'Multi nodes' : `ID: ${nid}`);
  // node comparison
  if (
    nRole &&
    nRole.match(role) &&
    nPartyId &&
    nPartyId.match(partyId) &&
    !isLeaf &&
    !isHomoBoost
  ) {
    key += ` \n ${FidVariable} <= ${fid || bid || 0}`;

    // node missing
    if (isUndefined(missDir) || missDir !== 1) {
      key += ' \n or missing';
    }
  } else if (isHomoBoost && !isLeaf && FidVariable) {
    key += ` \n ${FidVariable} <= ${bid || 0}`;

    // node missing
    if (missDir === -1) {
      key += ' \n is a missing value';
    }
  }

  // node weight (none)
  // node partyId
  if (!isHomoBoost) {
    key +=
      isMixMode && role.match(/guest/i) && isUndefined(pid)
        ? ` \n HOST ${TreePartyId ? `:${TreePartyId}` : ''}`
        : ` \n ${nRole && nRole.toUpperCase()} ${
            nPartyId ? ':' + nPartyId : TreePartyId ? ':' + TreePartyId : ''
          }`;
  }

  // node count
  if (isLeaf && sample) {
    key += ` \n count: ${sample}`;
  }

  return {
    id: nid,
    parent: pid,
    data: {
      name: key,
      value: nid,
      tooltip: {
        formatter: key,
      }
    },
  };
}

export default function Coordinated_lr(
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const modelInstance = getModelData(modelData);

  const { hyper_param, trees } = modelInstance.train_model_output;
  const { num_class: classes } = hyper_param;

  const TabsOptions = <any>{};

  if (Array.isArray(trees)) {
    for (let i = 0; i < trees.length; i++) {
      const CurrentClass = (i % (parseInt(classes) || 1)) + 1;

      const TabLabel = role.match(/guest/i)
        ? `model_${CurrentClass}`
        : CurrentClass;
      if (!TabsOptions[TabLabel]) {
        TabsOptions[TabLabel] = <any>[];
      }

      const { feature_importance, hyper_param, nodes } = trees[i];
      const SubTabs = {
        label: `weight: ${nodes.length}`,
        weight: nodes.length,
        value: <any>{},
      };

      if (Object.keys(feature_importance).length > 0) {
        // TODO 添加 SubTans.value.data
      }

      if (Array.isArray(nodes) && nodes.length > 0) {
        SubTabs.value.chart = () =>
          TreeNodesExplain(
            nodes,
            hyper_param,
            role,
            partyId,
            component,
            comp_type,
            id
          );
      }

      TabsOptions[TabLabel].push(SubTabs)
    }
  }

  return {
    id: 'SBTModelContainer',
    tag: 'section',
    prop: { class: 'f-d-container' },
    children: [{
      id: 'SBTTreeSelection',
      tag: FTreeDisplay,
      prop: {
        options: TabsOptions
      }
    }]
  }
}
