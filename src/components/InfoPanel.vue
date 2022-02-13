<template>

<Transition>
    <div class="infoPanel" v-show="show">
            <div class="containerTitle">
            <h4>Info Panel</h4>
            <div class="toggleButton" @click="closeButtonPressed(event)">
                <span class="closeWrapper"  >
                <i data-eva="close-outline" data-eva-fill="#ffffff" />
                </span>
            </div>
            </div>
    </div>
</Transition>

</template>
<script>
export default {
    props: ['show', 'closeFunc'],
    name: "InfoPanel",
    data() {
        return {
            panel: null
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

}
</script>