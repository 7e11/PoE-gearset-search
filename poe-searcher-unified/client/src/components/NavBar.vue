// https://buefy.org/documentation/navbar/
<template>
  <b-navbar>
    <template v-if="storeData.loggedIn" #start>
      <h2>User: {{ storeData.username }}</h2>
    </template>

    <template #end>
      <b-navbar-item tag="div">
        <div class="buttons">
          <b-button
            label="Sign Up"
            type="is-primary"
            @click="isSignupModalActive = true"
          />
          <b-modal
            v-model="isSignupModalActive"
            has-modal-card
            trap-focus
            :destroy-on-hide="false"
          >
            <modal-login @close="isSignupModalActive = false"></modal-login>
          </b-modal>
          <a class="button is-light"> Log in </a>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ModalLogin from "./ModalLogin.vue";
import { data } from "../store";

// This class-style setup is required due to typescript
// https://vuejs.org/v2/guide/typescript.html

// The @Component decorator indicates the class is a Vue component
@Component({
  components: {
    ModalLogin,
  },
})
export default class NavBar extends Vue {
  isLoginModalActive = false;
  isSignupModalActive = false;
  storeData = data;
}
</script>

<style>
</style>