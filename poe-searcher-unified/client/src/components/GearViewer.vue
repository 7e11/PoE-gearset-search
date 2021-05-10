<template>
  <div id="gear_viewer">
    <h2>Click on the gear slots to search for</h2>
		<div id="inventory">
			<!-- Non interactive items -->
			<item gridArea="weapon"></item>
			<item gridArea="offhand"></item>
			<item gridArea="Flasks"></item>
			<item gridArea="Trinket"></item>

			<item v-for="(entry, index) in slotItemsStore" 
						v-bind:key="entry.slotName" 
						v-bind:gridArea="entry.slotName" 
						v-bind:itemInfo="entry.itemInfo"
						enabled="true"
						@select="(newSelected) => updateSelected(index, newSelected)"></item>
		</div>
  </div>
</template>

<script lang="ts">
import { ItemStore } from '../types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import Item from './Item.vue'

// The @Component decorator indicates the class is a Vue component
@Component({
	// FIXME: Why is this required? Item doesn't show up properly if this isn't here.
	components: {
		Item
	}
})
export default class GearViewer extends Vue {
	helmet = undefined;

	disabled_items = ["weapon", "offhand", "Flasks", "Trinket"];
	@Prop() slotItemsStore!: ItemStore[];

	updateSelected(index: number, selected: boolean): void {
		this.slotItemsStore[index].selected = selected;
		// Propogate the entire array to the parent
		this.$emit('updateSelections', this.slotItemsStore);
	}
}
</script>

<style>
#gear_viewer {
	text-align: center;
}


/* I liked how poeninja displays their inventories, so I modified their grid setup and
	adapted it to vue */
#inventory {
	gap: 0.5rem;
	--cellSize: 4rem;
	--shadow-inner: inset 0 2px 4px 0 rgba(0,0,0,0.06);
	display: grid;
	grid-template-columns: repeat(8, var(--cellSize));
	grid-template-rows: repeat(8, var(--cellSize));
	grid-template-areas: 
		"weapon weapon . helmet helmet . offhand offhand"
		"weapon weapon . helmet helmet . offhand offhand"
		"weapon weapon . chest chest amulet offhand offhand"
		"weapon weapon ring chest chest ring2 offhand offhand"
		". gloves gloves chest chest boots boots ."
		". gloves gloves belt belt boots boots ."
		"Trinket Flasks Flasks Flasks Flasks Flasks Flasks ."
		". Flasks Flasks Flasks Flasks Flasks Flasks .";
}
</style>
