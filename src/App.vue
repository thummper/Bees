<template>
	<div class="topBar">
		<div class="gameStatContainer">
			<div class="gameStat">
				<div class="statIcon coin">
					<div class="coinInner"/>
				</div>
				<div class="statValue"> {{formattedMoney}} </div>
			</div>



		</div>
	</div>

  <div class="tabContainer">
    <div id="mapContainer">
        <canvas id="mapDiagram"></canvas>
        <div class="debugContainer" >
          <div class="containerTitle">
            <h4 v-if="showDebug" >Debug Options</h4>
            <div class="toggleButton" @click="toggleDebug">
              <span class="closeWrapper"  v-show="showDebug">
                <i data-eva="close-outline" data-eva-fill="#ffffff"/>
              </span>
              <span class="settingsWrapper" v-show="!showDebug">
                <i data-eva="settings" data-eva-fill="#ffffff"/>
              </span>
            </div>
          </div>
            <form v-show="showDebug">
                <div class="formRow">
                    <label for="equatorDistance">Render Equator Distance</label>
                    <input type="checkbox" id="equatorDistance" />
                </div>
                <div class="formRow">
                    <label for="equatorDistance">Render Moisture</label>
                    <input type="checkbox" id="renderMoisture" />
                </div>
                <div class="formRow">
                    <label for="equatorDistance">Render Height</label>
                    <input type="checkbox" id="renderHeight" />
                </div>
                <div class="formRow">
                    <label for="drawEquator">Draw Equator</label>
                    <input type="checkbox" id="drawEquator" />
                </div>
                <div class="formRow">
                    <label for="drawCenter">Draw Map Center</label>
                    <input type="checkbox" id="drawCenter" />
                </div>
                <div class="formRow">
                    <label for="drawCenter">Draw Cell Centers</label>
                    <input type="checkbox" id="drawCellCenters" />
                </div>
                <div class="formRow">
                    <label for="drawCenter">Draw Focused Info</label>
                    <input type="checkbox" id="drawFocusedInfo" checked = true />
                </div>
            </form>
        </div>
    </div>

	<div id="gameSettings" class="tab">
		<div class="tabWrapper">
			<div class="generationSettings">
				<button @click="accordionButtonPress" class="accordionButton">Generation Settings (changing these will reset the game)</button>
				<div class="accordionPanel">
					<form>
						<div class="formRow">
							<label for="mapSeed">Map Seed</label>
							<input type="number" id="mapSeed" @input="updateSettings('seed', $event)" :value="mapSettings.seed" />
						</div>
						<div class="formRow">
							<label for="mapStart">Map Start</label>
							<input type="number" id="mapStart" @input="updateSettings('x', $event)" :value="mapSettings.x" />
						</div>
						<div class="formRow">
							<label for="mapEnd">Map End</label>
							<input type="number" id="mapEnd" @input="updateSettings('y', $event)" :value="mapSettings.y" />
						</div>
						<div class="formRow">
							<label for="mapSize">Map Size</label>
							<input type="number" id="mapSize" @input="updateSettings('size', $event)" :value="mapSettings.size" />
						</div>
						<div class="formRow">
							<label for="mapPoints">Map Points</label>
							<input type="number" id="mapPoints" @input="updateSettings('numPoints', $event)" :value="mapSettings.numPoints" />
						</div>
						<div class="formRow">
							<label for="lloydPasses">Lloyd Passes</label>
							<input type="number" id="lloydPasses" @input="updateSettings('relaxationPasses', $event)" :value="mapSettings.relaxationPasses"/>
						</div>
						<div class="formRow formRowPadding">
							<button class="generalButton" @click.prevent="makeNewMap()">Reset Map</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>

	<InfoPanel :closestCell="canvasHandler.closestCell" :show="infoVisible" @close-info-panel="hideInfoPanel()" />




  </div>


  <div class="tabNavigation">
    <div v-for="tab in navigationTabs" :key="tab.name" :class="tab.css" class="tabButton"  v-on:click="tabPress(tab.clickAction, event)"><i :data-eva="tab.icon" data-eva-fill="#ffffff"></i></div>
  </div>





</template>
<script>

import * as eva from 'eva-icons';
import CanvasHandler from "@/assets/js/canvasHandler.js";
import Map from "@/assets/js/map.js";
import Game from "@/assets/js/game.js";
import InputHandler from "@/assets/js/inputHandler.js";
import InfoPanel from "@/components/InfoPanel.vue";

export default {
	name: 'App',
	data() {
		return {
			mapSettings: {
				'seed': 42,
				'x': -5000,
				'y': -5000,
				'size': 5000,
				'numPoints': 1000,
				'relaxationPasses': 2,
			},
			map: null,
			mapContainer: null,
			canvas: null,
			canvasHandler: new CanvasHandler(),

			infoVisible: true,
			showDebug: false,
			navigationTabs: [
			{name: "home", css:"home-tab", icon: "home", clickAction: "mapContainer"},
			{name: "settings", css:"settings-tab", icon: "settings-2", clickAction: "gameSettings"},
			],
			activeTab: null,
			game: new Game(),
		}
	},
	computed: {
		formattedMoney() {
			return this.nFormatter(this.game.money);
		}


	},
	watch: {
		'canvasHandler.closestCell': function() {
			this.showInfoPanel();
			console.log("closestCell has updated");
		}
	},
	components: {
		InfoPanel
	},
	methods: {
		nFormatter(num, digits = 2) {
			let lookup = [
				{value: 1, symbol: ""},
				{value: 1e3, symbol: "k"},
				{value: 1e6, symbol: "M"},
				{value: 1e9, symbol: "B"},
				{value: 1e12, symbol: "T"},
				{value: 1e15, symbol: "P"},
				{value: 1e18, symbol: "E"},
			];
			const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
			let item = lookup.slice().reverse().find(function(item) {
				return num >= item.value;
			});
			return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
		},



		hideInfoPanel() {
			this.infoVisible = false;
		},
		showInfoPanel() {
			this.infoVisible = true;
		},
		updateSettings(settingKey, event) {
			console.log("Updated: ", settingKey);
			this.mapSettings[settingKey] = parseInt(event.target.value);
		},
		toggleDebug() {
			this.showDebug = !this.showDebug;
		},
		removeActiveTab() {
			this.activeTab.style.display = "none";
			this.activeTab.style.zIndex  = "-100";
			this.activeTab = null;
		},
		showActiveTab() {
			this.activeTab.style.display = "flex";
			this.activeTab.style.zIndex  = "1000";
		},
		tabPress(tab, event) {
			let newTab = document.getElementById(tab);
			if(tab == "mapContainer") {
				if(this.activeTab != null) {
					this.removeActiveTab();
				}
			} else if(newTab == this.activeTab) {
				this.removeActiveTab();
			} else {

				if(this.activeTab != null) {
					this.removeActiveTab();

				}
				this.activeTab = newTab;
				this.showActiveTab();
			}
		},
		accordionButtonPress(event) {
			let accButton = event.target;
			let panel = accButton.nextElementSibling;

			accButton.classList.toggle("active");

			if(panel.style.display == "flex") {
				panel.style.display = "none";
			} else {
				panel.style.display = "flex";
			}
		},



		makeNewMap() {

			this.mapContainer  = document.querySelector('#mapContainer'),
			this.canvas        = this.mapContainer.querySelector("#mapDiagram"),
			this.map           = new Map(this.mapSettings);

			this.canvasHandler.setContainer(this.mapContainer);
			this.canvasHandler.setCanvas(this.canvas);



			this.canvasHandler.attachMap(this.map);
			this.canvasHandler.init();


			let inputHandler  = new InputHandler(this.canvasHandler);
			let debugPanel    = document.querySelector(".debugContainer");
			inputHandler.attachDebug(debugPanel);
		}
	},

	mounted() {
		eva.replace();
		this.makeNewMap();
	},
}

</script>
