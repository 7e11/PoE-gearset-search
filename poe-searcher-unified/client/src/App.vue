<template>
  <div id="app">
    <nav-bar style="grid-area:header"></nav-bar>
    <main-content @searchComplete="searchComplete"></main-content>
    <div id="details_container">
      <gear-details v-for="item in items" :key="item.item.id" :item="item"></gear-details>
    </div>
    <h2 style="grid-area:footer">Footer</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MainContent from './components/MainContent.vue';
import NavBar from './components/NavBar.vue';
import GearDetails from './components/GearDetails.vue';
import { ItemInfo } from './types';

// This class-style setup is required due to typescript
// https://vuejs.org/v2/guide/typescript.html

// The @Component decorator indicates the class is a Vue component
@Component({
  components: {
    NavBar,
    MainContent,
    GearDetails
  },
})
export default class App extends Vue {
  items: ItemInfo[] = [];

  searchComplete(items: ItemInfo[]): void {
    this.items = items;
  }
}
</script>

<style>
#details_container {
  grid-area: geardetails;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  display: grid;
  /* 
  https://university.webflow.com/lesson/css-grid-fractional-unit-fr-overview#:~:text=A%20fraction%20or%201FR%20is,100%25%20of%20the%20available%20space.&text=Then%20each%20fraction(1FR)%20is,the%20total%20number%20of%20fractions.
  A fractional unit is 1 part of the total as long as the content is flexible. 
  Meaning, 1FR tracks are equal in size as long as the content inside can scale to fit 
  the column or row. However, once the content stops scaling to fit in the track, the 
  track with an FR value will adjust to make the content fit. So, if one column has a 
  grid child of fixed width, the width of that column will never be less than the width 
  of the grid child. */
  grid-template-columns: 1fr minmax(0,86rem) 1fr;
  gap: 0.75rem;
  grid-template-areas: 
    ".    header      ."
    ".    main        ."
    ".    geardetails ."
    ".    footer      .";
}
</style>
