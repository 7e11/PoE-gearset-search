 <template>
  <form>
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Login</p>
        <button type="button" class="delete" @click="$emit('close')" />
      </header>
      <section class="modal-card-body">
        <b-field label="Username">
          <b-input
            type="text"
            name="username"
            :value="username"
            required
          >
          </b-input>
        </b-field>

        <b-field label="Password">
          <b-input
            type="password"
            name="password"
            :value="password"
            password-reveal
            required
          >
          </b-input>
        </b-field>

        <!-- <b-checkbox>Remember me</b-checkbox> -->
      </section>
      <footer class="modal-card-foot">
        <b-button label="Close" @click="$emit('close')" />
        <b-button label="Login" type="is-primary" @click="login" />
      </footer>
    </div>
  </form>
</template>
 
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { data } from "../store";

// The @Component decorator indicates the class is a Vue component
@Component
export default class ModalLogin extends Vue {
  username = "";
  password = "";
  storeData = data;
  async login(): Promise<void> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'username': this.username, 'password': this.password }),
    });
    const jsonData = await response.json();
  }
}
</script>

<style>
</style>