<template>
  <div class="col graph flex-center justify-center">
    <div class="flex flex-row space-between">
      <h3 class="list-title">Graph</h3>
      <icon-hover-and-active
        :class-name="'img-wrapper'"
        :default-url="icons.normal['fullscreen']"
        :hover-url="icons.hover['fullscreen']"
        :active-url="icons.active['fullscreen']"
        @clickFn="zoomOut"
      />
    </div>
    <div v-if="dagData" class="wrapper w-100 pointer">
      <dag
        :id="'graphCanvas'"
        :dag-info="dagData"
        :thumbnail="true"
        :pure-pic="true"
        :operation-list="false"
      />
    </div>
    <el-dialog :visible.sync="showGraph" :close-on-click-modal="false" width="50%" top="10vh">
      <h3 slot="title" class="list-title t-a-c" style="font-size: 14px;color:#3E4052;">GRAPH</h3>
      <div v-if="dagData" class="wrapper w-100" style="width:100%;height:70vh;position:relative;">
        <dag ref="purePicBigerDag" :id="'dialogCanvas'" :dag-info="dagData" :pure-pic="true" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import { mapGetters } from 'vuex'

import Dag from '@/components/CanvasComponent/flowDiagram'
import IconHoverAndActive from '@/components/IconHoverAndActive'

export default {
  components: {
    IconHoverAndActive,
    Dag
  },
  props: {
    dagData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showGraph: false
    }
  },
  computed: {
    ...mapGetters(['icons'])
  },
  methods: {
    zoomOut() {
      this.showGraph = true
    }
  }
}
</script>
