<template>
  <div id="search">
    <section>
      <b-field label="🔥 Fire Resistance">
        <b-numberinput
          min="0"
          v-model="resists.fire"
          controls-alignment="right"
          controls-position="compact"
        ></b-numberinput>
      </b-field>
      <b-field label="❄️ Cold Resistance">
        <b-numberinput
          min="0"
          v-model="resists.cold"
          controls-alignment="right"
          controls-position="compact"
        ></b-numberinput>
      </b-field>
      <b-field label="⚡ Lightning Resistance">
        <b-numberinput
          min="0"
          v-model="resists.lightning"
          controls-alignment="right"
          controls-position="compact"
        ></b-numberinput>
      </b-field>
      <b-field label="☣️ Chaos Resistance">
        <b-numberinput
          min="0"
          v-model="resists.chaos"
          controls-alignment="right"
          controls-position="compact"
        ></b-numberinput>
      </b-field>
      <!-- https://vuejs.org/v2/guide/components.html#Listening-to-Child-Components-Events -->
      <b-button
        type="is-primary"
        label="Search"
        icon-left="magnify"
        @click="$emit('search', resists)"
        v-bind:loading="loading"
      ></b-button>
    </section>
    <br />
    <template v-if="searchResult">
      <section v-if="searchResult.feasible" class="hero is-small is-success">
        <div class="hero-body">
          <p class="title">
						Total Cost: {{ searchResult.price }}
						<img class="chaos_orb" src="../assets/chaos.png" />
					</p>
					<resist-bar :resists="searchResult.resists"></resist-bar>
        </div>
      </section>
      <section v-else class="hero is-small is-danger">
        <div class="hero-body">
          <p class="title">
						Search Failed
					</p>
          <!-- <p class="subtitle">Failure subtitle</p> -->
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import ResistBar from "./ResistBar.vue";
import { Component, Vue, Prop } from "vue-property-decorator";
import { ResistInfo, SolverResult } from "../types";

// The @Component decorator indicates the class is a Vue component
@Component({
	components: {
		ResistBar,
	}
})
export default class Search extends Vue {
  // This is automatically set as "data"
  resists: ResistInfo = new ResistInfo();
  @Prop({ default: false }) readonly loading!: boolean;
  @Prop() readonly searchResult: SolverResult | undefined;
}
</script>

<style>
#search {
  text-align: left;
  padding: 3rem;
  border: 2px solid black;
}
</style>