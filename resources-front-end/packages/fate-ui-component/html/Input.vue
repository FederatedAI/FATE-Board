<template>
  <section class="f-input">
    <FInput v-model="content" label="input_label" column @change="change" @input="input"></FInput>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const content = ref('text')
const change = () => {
  console.log('change:', content.value)
}
const input = () => {
  console.log('input:', content.value)
}
</script>

<style lang="scss" scoped>
.f-input {
  width: 300px;
}
</style>
