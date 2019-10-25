<template>
    <!-- <div> -->
    <div v-if="loaded">
        <slot v-bind="{
            state: state,
            entity: entity,
            namespace: namespace,
        }">
        </slot>
    </div>
</template>

<script>

export default {
  name: 'ADState',
  components: {
  },
  data: function () {
    return {
        state: undefined,
        loaded: false,
        handle: false,
    }
  },
  props: {
    entity: {
        type: String,
        required: true,
    },
    namespace: {
        type: String,
        default: 'default',
    },
    debug: {
        type: Boolean,
        default: false
    }
  },
  beforeDestroy: function() {
      console.log('ADSTATE DESTROYED', this.namespace, this.entity)
      this.$AD.offState(this.handle)
      this.handle = false
      this.loaded = false
  },
  created: function() {
      this.listen_state()
  },
  methods: {
    listen_state: function () {
        this.$AD.cancelCallback(this.handle)
        this.loaded = false
        this.handle = this.$AD.onState(this.namespace, this.entity, this.update_state)
    },
    update_state: function (data) {
        if(this.debug) {
            console.log('state', this.namespace, this.entity, this.loaded, data.state)
        }
        this.state = data.state
        if(data.state == undefined) {
            this.loaded = false
        } else {
            this.loaded = true
        }
    },
    log_loaded: function() {
        if(this.debug) {
          console.log('loaded', this.namespace, this.entity, this.loaded)
        }
    },
  },
  watch: {
    entity: function () {
        console.log('entity changed', this.entity)
        this.listen_state()
    },
    namespace: function () {
        console.log('namespace change', this.namespace)
        this.listen_state()
    },
    loaded: function () {
        this.log_loaded()
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
.overline-keepcaps {
    font-size: 0.625rem !important;
    font-weight: 400;
    letter-spacing: 0.1666666667em !important;
    line-height: 1rem;
}
</style>
