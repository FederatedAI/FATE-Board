import { FFeatureImportance } from '@/components/FeatureImportance';
import { FTreeDisplay } from '@/components/TreeSelection';
import { isUndefined } from 'lodash';
import fixed from '../tools/fixed';
import getModelData from '../tools/getModelData';

function TreeNodesExplain(
  nodes: any,
  hyper: any,
  FidMapping: any,
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
      FidMapping,
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
  FidMapping: string,
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

  const FidVariable = FidMapping;
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

  // node weight
  if (isLeaf) {
    key += ` \n weight: ${fixed(weight)}`
  }

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

function FeatureImportanceTable (feature_importance: any) {
  const importanceTableData: any = []
  const importanceTableHeader = [{
    label: 'FEATURE',
    prop: 'label',
    width: '120px',
  }, {
    type: 'progress',
    label: '',
    prop: 'split',
  }]

  const gainTableData: any = []
  const gainTableHeader = [{
    label: 'FEATURE',
    prop: 'label',
    width: '120px',
  }, {
    type: 'progress',
    label: '',
    prop: 'gain',
  }]
  let maxSplit, maxGain
  for (const label in feature_importance) {
    const value = feature_importance[label]
    if (!maxSplit || value.split > maxSplit) maxSplit = value.split
    if (!maxGain || value.gain > maxGain) maxGain = value.gain
  }
  for (const label in feature_importance) {
    importanceTableData.push({
      label,
      split: {
        value: fixed(feature_importance[label].split || 0),
        percentage: fixed(((feature_importance[label].split || 0) / maxSplit) * 100)
      }
    })
    gainTableData.push({
      label,
      gain: {
        value: fixed(feature_importance[label].gain || 0),
        percentage: fixed(((feature_importance[label].gain || 0) / maxGain) * 100)
      }
    })
  }
  importanceTableData.sort((a: any, b: any) => {
    if (a.split.value > b.split.value) return -1
    else return 0
  })
  gainTableData.sort((a: any, b: any) => {
    if (a.gain.value > b.gain.value) return -1
    else return 0
  })

  const configuration = {
    id: 'FeatureImportanceTable',
    tag: FFeatureImportance,
    prop: {
      title: 'Feature Importance',
      data: {
        'gain': {
          header: gainTableHeader,
          data: gainTableData
        },
        'split': { 
          header: importanceTableHeader,
          data: importanceTableData
        },
      }
    }
  }
  return configuration
}

export default function Hetero_sbt(
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const modelInstance = getModelData(modelData);

  const { hyper_param, trees, fid_name_mapping, feature_importance } = modelInstance.train_model_output;
  let { num_class: classes } = hyper_param;

  if (!classes || classes <= 2) {
    classes = 1
  }

  const TabsOptions = <any>{};

  // SBT Tree explain
  if (Array.isArray(trees)) {
    for (let i = 0; i < trees.length; i++) {
      const CurrentClass = (i % (parseInt(classes) || 1)) + 1;

      const TabLabel = !!role.match(/guest/i)
        ? `model_${CurrentClass}`
        : CurrentClass;
      if (!TabsOptions[TabLabel]) {
        TabsOptions[TabLabel] = <any>[];
      }

      const { feature_importance, hyper_param, nodes } = trees[i];
      const SubTabs = {
        label: `id: ${i}`,
        id: 0,
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
            fid_name_mapping ? fid_name_mapping[i] : i,
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

  // Feature Importance
  const parsable = {
    id: 'SBTModelContainer',
    tag: 'section',
    prop: { class: 'f-d-container f-d-seperator' },
    children: [{
      id: 'SBTTreeSelection',
      tag: FTreeDisplay,
      prop: {
        options: TabsOptions
      }
    }, FeatureImportanceTable(feature_importance)]
  }

  return parsable
}
