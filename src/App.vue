<template>
  <!--
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld :msg='test' />

  -->
  <div id="mapContainer">
      <canvas id="mapDiagram"></canvas>
      <div class="debugContainer" >
        <div class="containerTitle">
          <h4 v-if="showDebug" >Debug Options</h4>
          <div class="toggleButton" @click="toggleDebug">
            <span class="closeWrapper"  v-show="showDebug">
              <i data-eva="close-outline" />
            </span>
            <span class="settingsWrapper" v-show="!showDebug">
              <i data-eva="settings-outline"/>
            </span>
          </div>
        </div>
          <form v-show="showDebug">
              <div class="formRow">
                  <label for="equatorDistance">Render Equator Distance</label>
                  <input type="checkbox" id="equatorDistance" >
              </div>
              <div class="formRow">
                  <label for="equatorDistance">Render Moisture</label>
                  <input type="checkbox" id="renderMoisture" >
              </div>
              <div class="formRow">
                  <label for="equatorDistance">Render Height</label>
                  <input type="checkbox" id="renderHeight" >
              </div>
              <div class="formRow">
                  <label for="drawEquator">Draw Equator</label>
                  <input type="checkbox" id="drawEquator" >
              </div>
              <div class="formRow">
                  <label for="drawCenter">Draw Map Center</label>
                  <input type="checkbox" id="drawCenter" >
              </div>
              <div class="formRow">
                  <label for="drawCenter">Draw Cell Centers</label>
                  <input type="checkbox" id="drawCellCenters" >
              </div>
              <div class="formRow">
                  <label for="drawCenter">Draw Focused Info</label>
                  <input type="checkbox" id="drawFocusedInfo" checked = true>
              </div>
          </form>
      </div>
  </div>
</template>

<script>
import * as eva from 'eva-icons';
// import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  data() {
    return {
      test: "Hello Beans",
      showDebug: false,
    }
  },
  components: {
    //HelloWorld
  },
  mounted() {
    eva.replace();
  },
  methods: {
    toggleDebug(){
      this.showDebug = !this.showDebug;
    }
  }
}




</script>


