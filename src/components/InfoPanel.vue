<template>

<Transition>
    <div class="infoPanel" v-show="show">
            <div class="containerTitle">
                <h4>Selected Cell</h4>
                <div class="toggleButton" @click="closeButtonPressed(event)">
                    <span class="closeWrapper"  >
                    <i data-eva="close-outline" data-eva-height="32" data-eva-width="32" data-eva-fill="#ffffff" />
                    </span>
                </div>
            </div>
            <div class="containerContent">
                <table class="cellTable" v-show="showCellInfo">
                    <tr>
                        <td> X </td>
                        <td> {{closestCell.x}} </td>
                    </tr>
                    <tr>
                        <td> Y </td>
                        <td> {{closestCell.y}} </td>
                    </tr>
                    <tr>
                        <td> Biome </td>
                        <td> {{closestCell.biome}} </td>
                    </tr>
                    <tr>
                        <td> Colour </td>
                        <td id="biomeColour"> {{closestCell.colour}} </td>
                    </tr>
                    <tr>
                        <td> Equator Distance </td>
                        <td> {{closestCell.equatorDistance}} </td>
                    </tr>
                    <tr>
                        <td> Height </td>
                        <td> {{closestCell.height}} </td>
                    </tr>
                    <tr>
                        <td> Moisture </td>
                        <td> {{closestCell.moisture}} </td>
                    </tr>





                </table>


            </div>
    </div>
</Transition>

</template>
<script>
export default {
    props: ['show', 'closeFunc', 'closestCell'],
    name: "InfoPanel",
    data() {
        return {
            panel: null,
            showCellInfo: false
        }
    },
    mounted(){
        this.panel = document.getElementsByClassName("infoPanel")[0];
    },
    methods: {
        closeButtonPressed() {
            this.$emit('close-info-panel');
        }
    },
    watch: {
        closestCell: function() {
            if(this.closestCell != null) {
                console.log(document.getElementById("biomeColour"));
                document.getElementById("biomeColour").style.backgroundColor = this.closestCell.colour;
                this.showCellInfo = true;
            } else {
                this.showCellInfo = false;
            }



            console.log("Closest cell: ", this.closestCell);
        }
    },

}
</script>