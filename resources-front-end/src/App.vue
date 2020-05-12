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
      version: 'v1.4.1',
      packageTime: '2020/4/27-12:21'
    }
  }
}
</script>
