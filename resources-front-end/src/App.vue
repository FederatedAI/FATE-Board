<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data: () => {
    return {
      version: 'v1.4.2',
      packageTime: '2020/5/27-14:55'
    }
  }
}
</script>
