<template>
  <div id="app">
    <nav class="navbar sticky-top navbar-dark bg-dark mb-3">
      <router-link tag="a" to="/" class="navbar-brand">PDT configurator</router-link>
    </nav>
    <div class="container-fluid">
    <router-view></router-view>
    </div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
