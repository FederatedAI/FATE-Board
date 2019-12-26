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
      version: 'v1.2.0',
      packageTime: '2019/12/23'
    }
  }
}
</script>
