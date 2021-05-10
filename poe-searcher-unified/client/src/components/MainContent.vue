<template>
  <div id="main_content">
    <search ref="search" v-on:search="solve" v-bind:loading="loading" :searchResult="searchResult"></search>
    <gear-viewer :slotItemsStore="slotItemsStore" @updateSelections="updateStore"></gear-viewer>
  </div>
</template>

<script lang="ts">
import { ResistInfo, Slot, SolverResult, ItemStore } from '../types';
import { Component, Vue } from 'vue-property-decorator';
import GearViewer from './GearViewer.vue';
import Search from './Search.vue';

// The @Component decorator indicates the class is a Vue component
@Component({
  components: {
    Search,
    GearViewer
  },
})
export default class Main extends Vue {
  searchResult: SolverResult | null = null;

  loading = false;
  slotItems = ["helmet", "chest", "amulet", "ring", "ring2", "gloves", "boots", "belt"];
	slotItemsStore: ItemStore[] = this.slotItems.map(item => {
		return { "slotName": item, "itemInfo": undefined, "selected": false };
	});

  updateStore(newStore: ItemStore[]): void {
    this.slotItemsStore = newStore;
  }

  async solve(resists: ResistInfo): Promise<void> {
    // Make the button loading (so much effort and bindings just for this -_-)
    this.loading = true;

    // Get Slots from gear-viewer.
    const slots: Slot[] = this.slotItemsStore.filter(entry => entry.selected).map(entry => {
      if (entry.slotName == 'ring2') {
        return Slot.Ring;
      } else {
        return entry.slotName as Slot;
      }
    })

    console.log(`Starting Query`, resists, slots);

    const response = await fetch('/api/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'resists': resists, 'slots': slots }),
    });
    const result: SolverResult = await response.json();
    // Update searchResult
    this.searchResult = result;

    // Clear all previous items
    for (const entry of this.slotItemsStore) {
      entry.itemInfo = undefined;
    }

    // Gearset state
    // FIXME: Really move the slotItemStore into a object mapping "slot" -> SlotItem.
    let secondRing = false;
    for (const item of result.items) {
      if (item.slot === Slot.Ring && !secondRing) {
        const slotStore = this.slotItemsStore.find(entry => entry.slotName === "ring")!;
        // if it's not selected, put it into the second ring position.
        if (slotStore.selected) {
          slotStore.itemInfo = item;
        } else {
          const slotStore2 = this.slotItemsStore.find(entry => entry.slotName === "ring2")!;
          slotStore2.itemInfo = item;
        }
        secondRing = true;
      } else if (item.slot === Slot.Ring && secondRing) {
        const slotStore = this.slotItemsStore.find(entry => entry.slotName === "ring2")!;
        slotStore.itemInfo = item;
      } else {
        const slotStore = this.slotItemsStore.find(entry => entry.slotName === item.slot as string)!;
        slotStore.itemInfo = item;
      }
    }
    console.log(this.slotItemsStore);

    // Tell the main content to send stuff to the gearviewer
    this.$emit('searchComplete', result.items);

    // Snackbar banner for fun.
    if (result.feasible) {
      this.$buefy.snackbar.open(`Search Successful: ${result.price} chaos`);
    } else {
      this.$buefy.snackbar.open({
        message: `Search Failed - Best Result: ${result.price} chaos`,
        type: 'is-danger',
      });
    }

    console.log(result);
    this.loading = false;
  }
}
</script>

<style>
#main_content {
  grid-area: main;

  display: grid;
  /* FIXME: Hacky. Maybe I should create a flexbox or something to contain the inventory? */
  grid-template-columns: 2fr 1fr;
  column-gap: 1rem;
}
</style>