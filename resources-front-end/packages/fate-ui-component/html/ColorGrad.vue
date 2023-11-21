<template>
  <section class="scroll-container">
    <FColorGradient></FColorGradient>
    <FColorGradient startFromMin></FColorGradient>
    <FColorGradient max="100" min="10"></FColorGradient>
    <FColorGradient column></FColorGradient>
    <FColorGradient size="5"></FColorGradient>
    <FColorGradient maxColor="#111" minColor="#eee"></FColorGradient>
  </section>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.scroll-container {
  width: 800px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>
