<template>
  <div class="resists">
    <div class="has-text-centered">
      <div>
        <p class="heading">🔥Fire</p>
        <p class="title" id="fire">{{ resists.fire }}</p>
      </div>
    </div>
    <div class="has-text-centered">
      <div>
        <p class="heading">❄️Cold</p>
        <p class="title" id="cold">{{ resists.cold }}</p>
      </div>
    </div>
    <div class="has-text-centered">
      <div>
        <p class="heading">⚡Lightning</p>
        <p class="title" id="lightning">{{ resists.lightning }}</p>
      </div>
    </div>
    <div class="has-text-centered">
      <div>
        <p class="heading">☣️Chaos</p>
        <p class="title" id="chaos">{{ resists.chaos }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ResistInfo } from "../types";

// The @Component decorator indicates the class is a Vue component
@Component
export default class ResistBar extends Vue {
  @Prop({ default: new ResistInfo()}) readonly resists!: ResistInfo;
}
</script>

<style>
.resists {
	display: flex;
	gap: 2.5rem;
}
</style>