<template>
  <section :class="className" class="editor__container">
    <div class="editor_edit">
      <slot
        :operation="{
          toDisplay:toDisplay,
          disabled: disabledSet
        }"
        name="prepend"
      />
      <cinput v-model="editorContent" :disabled="disabledSet" />
      <slot
        :operation="{
          toDisplay:toDisplay,
          disabled: disabledSet
        }"
        name="append"
      >
        <i class="el-icon-success editor__btn" @click="toDisplay(true)" />
        <i class="el-icon-failed editor__btn" @click="toDisplay(false)" />
      </slot>
    </div>
    <div v-show="!showEditor" class="editor__display">
      <slot
        :content="{
          content: displayContent,
          toEditor: toEditor,
          disabled: disabledSet
        }"
        name="content"
      >
        <span class="editor__display-text">{{ displayContent }}</span>
        <i class="el-icon-editor editor__btn" @click="toEditor" />
      </slot>
    </div>
  </section>
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

export default {
  name: '',
  components: {
    cinput: () => import('../Input')
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    editorFirst: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      editorContent: '',
      displayContent: '',
      showEditor: false,
      disabledSet: false
    }
  },
  watch: {
    value: {
      handler() {
        this.displayContent = this.value
        this.editorContent = this.value
      },
      deep: true
    },
    disabled() {
      this.disabledSet = this.disabled
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.disabledSet = this.disabled
      this.displayContent = this.value
      if (this.editorFirst) {
        this.toEditor()
      }
    },
    toEditor() {
      if (!this.disabledSet) {
        this.editorContent = this.displayContent
        this.showEditor = true
      }
    },
    toDisplay(change) {
      if (change && this.displayContent !== this.editorContent) {
        this.displayContent = this.editorContent
        this.updated()
      }
      this.showEditor = false
    },
    updated() {
      if (this.$listeners['input']) {
        this.$emit('input', this.displayContent)
      }
      this.$emit('change', this.displayContent)
    },
    disable() {
      this.disabledSet = false
    },
    able() {
      this.disabledSet = true
    }
  }
}
</script>

<style lang="" scoped>
</style>
