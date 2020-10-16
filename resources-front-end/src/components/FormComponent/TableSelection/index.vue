<template>
  <div class="filter__container">
    <e-button :label="'select'" @clickBtn="showSelection" />
    <div v-show="selectionDialog" class="dialog__container">
      <header class="dialog__header">
        <i class="el-icon-close" @click.stop="cancelFilter" />
      </header>
      <main class="dialog__main">
        <div class="checkbox__container">
          <header>
            <e-title :content="'Cluster label'" />
            <span class="dialog__link" @click.stop="selectAllCluster">select all</span>
          </header>
          <main>
            <e-checkbox
              ref="clusterCheckbox"
              :options="clusterOptions"
              :group-class-name="'checkBox-group__row'"
              @change="clusterChange"
            />
          </main>
          <footer>
            <span
              :class="{'dialog__footer-disable': nextCluster.length < 1}"
              class="dialog__footer-s"
            >{{ clusterSelected }}</span>
          </footer>
        </div>
        <div class="checkbox__container">
          <header>
            <e-title :content="'True label'" />
            <span class="dialog__link" @click.stop="SelectAllTrue">select all</span>
          </header>
          <main>
            <e-checkbox
              ref="trueCheckbox"
              :options="trueOptions"
              :group-class-name="'checkBox-group__row'"
              @change="trueChange"
            />
          </main>
          <footer>
            <span
              :class="{'dialog__footer-disable': nextTrue.length < 1}"
              class="dialog__footer-s"
            >{{ trueSelected }}</span>
          </footer>
        </div>
      </main>
      <footer class="dialog__footer">
        <e-button
          ref="submitBtn"
          :label="'OK'"
          :disabled="nextCluster.length < 1 || nextTrue.length < 1"
          style="width:20%;"
          @clickBtn="comfirmFilter"
        />
        <e-button :label="'cancel'" type="info" style="width:20%;" @clickBtn="cancelFilter" />
      </footer>
    </div>
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

import eButton from '../Button'
import eCheckbox from '../Checkbox'
import eTitle from '../Text/Title'
export default {
  name: 'TableSelection',

  components: {
    eButton,
    eCheckbox,
    eTitle
  },

  props: {
    clusterLabel: {
      type: Array,
      default: () => []
    },
    trueLabel: {
      type: Array,
      default: () => []
    },
    clusterFormat: {
      type: Function,
      default: str => `cluster${str}`
    },
    trueFormat: {
      type: Function,
      default: str => `label${str}`
    }
  },

  data() {
    return {
      currentCluster: [],
      nextCluster: [],
      currentTrue: [],
      nextTrue: [],
      selectionDialog: false,
      inited: false
    }
  },

  computed: {
    clusterOptions() {
      const res = []
      for (const val of this.clusterLabel) {
        res.push({
          label: this.clusterFormat(val.toString()),
          value: val.toString()
        })
      }
      return res
    },

    trueOptions() {
      const res = []
      for (const val of this.trueLabel) {
        res.push({
          label: this.trueFormat(val.toString()),
          value: val.toString()
        })
      }
      return res
    },

    clusterSelected() {
      return this.nextCluster.length <= 0
        ? 'at least 1 selected'
        : this.nextCluster.length + ' selected'
    },

    trueSelected() {
      return this.nextTrue.length === 0
        ? 'at least 1 selected'
        : this.nextTrue.length + ' selected'
    }
  },

  watch: {
    nextCluster() {
      if (this.nextCluster.length < 1 || this.nextTrue.length < 1) {
        this.$refs.submitBtn.disable()
      } else {
        this.$refs.submitBtn.able()
      }
    },
    nextTrue() {
      if (this.nextCluster.length < 1 || this.nextTrue.length < 1) {
        this.$refs.submitBtn.disable()
      } else {
        this.$refs.submitBtn.able()
      }
    }
  },

  methods: {
    selectAllCluster() {
      this.$refs.clusterCheckbox.selectAll()
    },
    SelectAllTrue() {
      this.$refs.trueCheckbox.selectAll()
    },
    clusterChange(res) {
      this.nextCluster = res
      if (!this.inited) {
        this.currentCluster = res
      }
    },
    trueChange(res) {
      this.nextTrue = res
      if (!this.inited) {
        this.currentTrue = res
      }
    },
    filterChange() {
      this.currentCluster = this.nextCluster
      this.currentTrue = this.nextTrue
      this.inited = true
      this.$emit('filterTable', {
        headerFilter: this.currentCluster,
        dataFilter: [
          {
            filter: this.currentTrue,
            property: 'trueLabel'
          }
        ]
      })
    },
    cancelFilter() {
      this.hideSelection()
      this.inited = true
      this.$refs.clusterCheckbox.setOptions(this.currentCluster)
      this.$refs.trueCheckbox.setOptions(this.currentTrue)
    },
    showSelection() {
      this.selectionDialog = true
    },
    hideSelection() {
      this.selectionDialog = false
    },
    comfirmFilter() {
      this.filterChange()
      this.hideSelection()
    },
    setDefault() {
      if (this.$refs.clusterCheckbox) {
        if (!this.$refs.clusterCheckbox.setDefault()) {
          return false
        }
        this.selectAllCluster()
      } else {
        return false
      }
      if (this.$refs.trueCheckbox) {
        if (!this.$refs.trueCheckbox.setDefault()) {
          return false
        }
        this.SelectAllTrue()
      } else {
        return false
      }
      return true
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../styles/position';
@import '../../../styles/common_style';
.filter__container {
	position: relative;
	.dialog__header {
		width: 100%;
		@include flex(row, flex-end, center);
	}
	.dialog__container {
		@include flex(column, flex-start, center);
		min-width: 230px;
		padding: 12px;
		@include shadow(#aaa);

		position: absolute;
		top: 0;
		right: 0;
		z-index: 100;
		background-color: #fff;
	}
	.dialog__main {
		@include flex(row, flex-start, flex-start);
		margin-bottom: 12px;
		.checkbox__container {
			min-width: 250px;
			padding: 0px 12px;
			@include flex(column, flex-start, center);
			& > header {
				width: 100%;
				@include flex(row, space-between, center);
			}
			& > main {
				width: 100%;
				height: 240px;
				overflow: auto;
			}
			& > footer {
				width: 100%;
				@include flex(row, flex-start, flex-start);
			}
			&:first-child {
				border-right: 1px solid;
			}
			&:last-child {
				margin-right: 0px;
			}
		}
		.dialog__link {
			color: #494ece;
			cursor: pointer;
			font-size: 12px;
		}
	}
}

.dialog__footer {
	width: 100%;
	@include flex(row, center, center);
}

.dialog__footer-s {
	@include flex(row, flex-start, center);
}

.dialog__footer-disable {
	color: rgb(255, 109, 90);
}
</style>
