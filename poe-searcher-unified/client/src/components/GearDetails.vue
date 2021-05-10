<template>
  <div id="gear_details" class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img :src="item.item.icon" alt="Placeholder image" />
          </figure>
        </div>
        <div class="media-content">
          <p class="title is-4">{{ item.item.name }}</p>
          <p class="subtitle is-6">{{ item.item.baseType }}</p>
        </div>
      </div>
			<!-- Resist Bar -->
			<resist-bar :resists="item.resists"></resist-bar>
    </div>
    <footer class="card-footer">
      <a class="card-footer-item" @click="whisper">
				<p>Whisper @{{ item.stash.lastCharacterName }} price {{ item.solver_info.price }}</p>
				<img class="chaos_orb" src="../assets/chaos.png" />
			</a>
    </footer>
  </div>
</template>

<script lang="ts">
import ResistBar from "./ResistBar.vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  ItemInfo, PriceUnit,
} from "../types";

// The @Component decorator indicates the class is a Vue component
@Component({
  components: {
		ResistBar
	},
})
export default class GearDetails extends Vue {
  @Prop() readonly item!: ItemInfo;

	async whisper(): Promise<void> {
		// Convert unit to string
		let unit = this.item.unit === PriceUnit.Chaos ? "chaos" : "exalted";
		// Oh well, the author of the API library didn't set this type correctly. Just ignore the error.
    // @ts-ignore
		const text = `@${this.item.stash.lastCharacterName} Hi, I would like to buy your ${this.item.item.name} ${this.item.item.baseType!} listed for ${this.item.price} ${unit} in Ultimatum`;
		await navigator.clipboard.writeText(text);
		this.$buefy.snackbar.open(`Copied: "${text}"`);
	}
}
</script>

<style>
.chaos_orb {
	height: 2rem;
}

.gear_details {
}
</style>