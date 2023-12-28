<template>
  <FContext
    :maps="map"
    :title="'title1'"
    :title-class-name="'title-class-name'"
    :content-class-name="'content-class-name'"
    :label-class-name="'label-class-name'"
    :label-width="120"
    :width="400"
    class="txt-container"
  />
  <FImply :label="'Key'" :content="'Content'"></FImply>
</template>

<script lang="ts" setup>
const map = {
  key1: 'context1',
  key2: 'context2'
}
</script>

<style lang="scss" scoped>
.txt-container {
  justify-content: flex-start;
  min-width: 500px;
  min-height: 300px;
}
</style>
