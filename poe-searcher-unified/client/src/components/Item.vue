<template>
	<div class="item" v-bind:style="cssVars" @click="click">
	</div>
</template>

<script lang="ts">
import { ItemInfo } from '../types';
import { Component, Prop, Vue } from 'vue-property-decorator';

// The @Component decorator indicates the class is a Vue component
@Component
export default class Item extends Vue {
	selected = false;
	// https://github.com/kaorun343/vue-property-decorator#Prop
	@Prop(String) readonly gridArea: string | undefined;
	@Prop({ default: false }) readonly enabled!: boolean;
	@Prop() readonly itemInfo: ItemInfo | undefined;

	click(): void {
		this.selected = !this.selected;
		this.$emit('select', this.selected);
	}

	// https://class-component.vuejs.org/guide/class-component.html#computed-properties
	get cssVars(): unknown {

		let bgColor = "gray"
		if (!this.enabled) {
			bgColor = "black"
		} else {
			bgColor = this.selected ? "lightgreen" : "gray"
		}

		return { 
			'--gridArea': this.gridArea,
			'--imageUrl': `url(${this.itemInfo?.item.icon})` || "none", 
			'--imageW': this.itemInfo?.item.w || 1,
			'--imageH': this.itemInfo?.item.h || 1,
			'--bgColor': bgColor,
			};
	}
}
</script>

<style scoped>
.item {
	grid-area: var(--gridArea);
	background-color: var(--bgColor);
	background-image: var(--imageUrl);
	background-position: center center;
	background-repeat: no-repeat;


	background-size: calc(var(--imageW) * var(--cellSize)) calc(var(--imageH) * var(--cellSize));
}
</style>