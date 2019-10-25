<template>
  <div class="hello">
    <h1>{{ name }}</h1>
    <p>{{ uptime }}</p>
    <p> {{ $AD.name }}</p>
  </div>
</template>

<script>
export default {
  name: 'ADUpTime',
  data: function() {
    return {
      uptime: 0,
    }
  },
  props: {
    name: String,
  },
  created: function() {
    // console.log('ADUpTimeCreated')
    this.$AD.onState("admin", "sensor.appdaemon_uptime", this.upd_uptime)
  },
  methods: {
    upd_uptime: function (data) {
      this.uptime = data.new_state.state
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
