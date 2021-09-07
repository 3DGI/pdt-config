<template>
  <div id="app">
    <nav class="navbar sticky-top navbar-dark bg-dark mb-3">
      <router-link tag="a" to="/" class="navbar-brand">PDT configurator</router-link>
      <span class="navbar-brand">
      <button type="button" class="btn btn-sm btn-dark" v-on:click="aboutModal.toggle()">
          Made by <b>3DGI</b>
      </button>
      </span>
    </nav>
    <div class="container-fluid">
    <router-view></router-view>
    </div>
    <!-- Modal About -->
    <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="aboutModalLabel">About PDT configurator</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>
              This proof of concept was developed by <a href="https://3dgi.nl/">3DGI</a> for <a href="https://www.buildingsmart.org/">buildingSMART</a>. It demonstrates how one can compose a product data template straight from the <a href="https://github.com/buildingSMART/bSDD">buildingSMART Data Dictionary</a> using the <a href="https://bs-dd-api-prototype.azurewebsites.net/swagger/index.html">bSDD API</a>.
            </p>
            <p>
              The XML specification is preliminary as there is no definitive PDT XSD available yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import { Modal } from 'bootstrap';

export default {
  name: 'App',
  mounted(){
    this.aboutModal = new Modal(document.getElementById('aboutModal'), {
          keyboard: false
        });
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.iconl {
  font-size:1.25rem
}
</style>
