<template>
  <v-app>



    <v-app-bar clipped-left app dense fixed extension-height="0">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <img  src="./assets/ad-logo.png" height="40px" />
      </v-app-bar-nav-icon>
      <v-toolbar-title class="headline px-0">
        <span>App</span>
        <span class="font-weight-light">Daemon</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-progress-linear
        :active="!ready"
        :indeterminate="true"
        height="4"
        slot="extension"
      ></v-progress-linear>

      <template v-if="ready">
        <ADState namespace="admin" entity="sensor.appdaemon_uptime" v-slot="s">
          {{ s.state.state }}
        </ADState>

        <v-btn
          text
          href="https://github.com/homeassistant/appdaemon"
          target="_blank"
        >
          github
        </v-btn>

        <ADState namespace="admin" entity="sensor.appdaemon_version" v-slot="s">
          {{ s.state.state }}
        </ADState>
      </template>

    </v-app-bar>


    <v-content v-if="ready">
<v-navigation-drawer
        v-model="drawer"
        fixed
        width = "200"
        id = "drawer"
        app
        clipped
      >
        <v-list>
          <v-list-item to="/apps">
            <v-list-item-action>
              A
            </v-list-item-action>
            <v-list-item-content>
              Apps
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/entities">
            <v-list-item-action>
              E
            </v-list-item-action>
            <v-list-item-content>
              Entities 
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/entities2">
            <v-list-item-action>
              E2
            </v-list-item-action>
            <v-list-item-content>
              Entities 2
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/threads">
            <v-list-item-action>
              T
            </v-list-item-action>
            <v-list-item-content>
              Threads
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/callbacks">
            <v-list-item-action>
              C
            </v-list-item-action>
            <v-list-item-content>
              Callbacks
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/test">
            <v-list-item-action>
              T
            </v-list-item-action>
            <v-list-item-content>
              Test
            </v-list-item-content>
          </v-list-item>

        </v-list>
      </v-navigation-drawer>
      <router-view />
    </v-content>

    <v-dialog v-model="need_configure" persistent max-width="290">
      <v-card elevation="24">
        <v-card-title>Login</v-card-title>
      <v-form
        ref="login_form"
        v-model="valid_login_form"
      >
      <v-card-text>
        <v-text-field
          v-model="host"
          :rules="hostRules"
          label="Host"
          required
        ></v-text-field>

        <v-text-field
          v-model="port"
          :rules="portRules"
          label="Port"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          :type="reveal_password ? 'text' : 'password'"
          :append-icon="reveal_password ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="reveal_password = !reveal_password"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn
          :disabled="!valid_login_form"
          color="success"
          class="mr-4"
          @click="process_login_form"
        >
          Login
        </v-btn>

        <v-btn
          color="error"
          class="mr-4"
          @click="reset_login_form"
        >
          Reset
        </v-btn>
      </v-card-actions>
      </v-form>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script>
import ADState from './components/ADState'

export default {
  name: 'App',
  components: {
    ADState,
  },
  data: () => ({
    reveal_password: false,
    drawer: false,
    ready: false,
    need_configure: true,
    host: '',
    port: '',
    password: '',
    valid_login_form: true,
    hostRules: [
      v => !!v || 'Host is required',
    ],
    portRules: [
      v => !!v || 'Port is required',
    ],
  }),
  mounted() {
    if (localStorage.host) {
      this.host = localStorage.host
    }
    if (localStorage.port) {
      this.port = localStorage.port
    }
    if (localStorage.password) {
      this.password = localStorage.password
    }
    this.need_configure = !(this.$AD.configured)
    this.$AD.onReady(this.ready_change)
  },
  methods: {
    ready_change(ready) {
      this.ready = ready
    },
    process_login_form: function () {
      if (this.$refs.login_form.validate()) {
        this.$AD.connect(this.host, this.port, "ADCP Client", this.password)
        this.need_configure = !(this.$AD.configured)
        localStorage.host = this.host
        localStorage.port = this.port
        localStorage.password = this.password
      }
    },
    reset_login_form: function () {
      this.$refs.login_form.reset()
    },
  },
}
</script>

<style>
.v-toolbar__extension {
  padding: 0px !important;
  margin: 0px !important;
}
</style>