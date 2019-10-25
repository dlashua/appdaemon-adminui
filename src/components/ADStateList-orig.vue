<template>
    <div v-if="loaded">
        <slot 
            v-bind="{
                states: states,
                entity: entity,
                namespace: namespace,
            }"
            v-bind:current_items_update="current_items_update"
        >
        </slot>
    </div>
</template>

<script>
export default {
  name: 'ADStateList',
  data: function () {
    return {
        states: [],
        real_states: [],
        loaded: false,
        handle: false,
        interval: false,
        changed: false,
        current_items: [],
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
    },
  },
  beforeDestroy: function() {
        console.log('ADSTATELIST DESTROYED', this.namespace, this.entity)
        this.$AD.cancelCallback(this.handle)
        clearTimeout(this.interval)
        this.interval = false
        this.handle = false
        this.loaded = false
  },
  created: function() {
    this.listen_state()
  },
  updated: function() {
      console.log('ADStateList Updated', this.namespace, this.entity)
  },
  methods: {
    current_items_update: function (data) {
        var ret = []
        for (var index in data) {
            ret.push(data[index].id)
        }
        this.current_items = ret
    },
    listen_state: function () {
        this.$AD.cancelCallback(this.handle)
        clearTimeout(this.interval)
        this.loaded = false
        this.handle = this.$AD.onState(this.namespace, this.entity, this.update_state)
        this.interval = setTimeout(this.map_real_states, 100)
    },
    map_real_states: function() {
        clearTimeout(this.interval)
        if (this.changed) {
            this.states = this.real_states.slice(0)
            this.changed = false
        }
        this.interval = setTimeout(this.map_real_states, 5000)
    },
    update_state: function (data) {
        var namespace = data.namespace
        var entity_id = data.entity_id
        var state = data.state

        var id = namespace + "://" + entity_id
        var key
        if (state && state.last_changed) {
            key = id + "_" + state.last_changed
        } else {
            key = id + "_no_change"
        }

        var new_item = {
            id: id,
            namespace: namespace,
            entity_id: entity_id,
            state: state,
            key: key
        }

        var found = false
        for (var index in this.real_states) {
            if(this.real_states[index].id == new_item.id) {
                this.real_states.splice(index, 1)
                found = true
                break
            }
        }

        if (state === undefined || state === null) {
            // nothing
        } else {
            this.real_states.push(new_item)
        }

        this.changed = true
        if ((!(found)) || this.current_items.includes(id)) {
            this.map_real_states()
        }
        this.loaded = true
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
