<template>
    <div>
        <slot 
            v-bind="{
                states: real_states,
                entity: entity,
                namespace: namespace,
            }"
        >
        </slot>
    </div>
</template>

<script>
export default {
  name: 'ADStateList',
  data: function () {
    return {
        real_states: [],
        pending_states: {},
        handle: false,
        interval: false,
        changed: false,
        busy: false,
        current_items: [],
        pending_count: 0,
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
    update: {
        default: false,
    }
  },
  beforeDestroy: function() {
        this.$AD.offState(this.handle)
        clearTimeout(this.interval)
        this.interval = false
        this.handle = false
  },
  created: function() {
    this.listen_state()
  },
  methods: {
    states() {
        return this.real_states.splice(0)
    },
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
        this.real_states = []
        this.pending_states = {}
        this.handle = this.$AD.onState(this.namespace, this.entity, this.update_state)
    },
    update_state(data) {
        var id = data.namespace + "://" + data.entity_id
        // console.log('update', id)
        this.pending_states[id] = data
        // this.pending_count = Object.keys(this.pending_states).length
        // this.update_one_pending_state(data, this.real_states)

        this.$emit('pending-count', Object.keys(this.pending_states).length)
        this.process_pending()
    },
    async process_pending() {
        if(this.busy) {
            return
        }
        this.busy = true
        await new Promise(r => setTimeout(r, 1))
        var throttle = new Promise(r => setTimeout(r, 1000))

        let batch = []
        let ids = Object.keys(this.pending_states)
        for(var id_index in ids) {
            batch.push(this.pending_states[ids[id_index]])
            delete this.pending_states[ids[id_index]]
        }

        // var states_copy = this.real_states.splice(0)
        var promises = []
        while(batch.length > 0) {
            var data = batch.pop()
            if (data) {
                promises.push(this.update_one_pending_state(data, this.real_states))
            }
        }
        await Promise.all(promises)
        // this.real_states = states_copy.splice(0)
        this.$emit('pending-count', Object.keys(this.pending_states).length)
        await throttle
        this.busy = false
    },
    async update_one_pending_state(data, states) {
        if (!("namespace" in data)) {
            console.log("no namespace", data)
            return
        }

        if (!("entity_id" in data)) {
            console.log('no entity', data)
            return
        }
        var namespace = data.namespace
        var entity_id = data.entity_id
        var state = data.state

        var id = namespace + "://" + entity_id

        var found = false
        for (var index in states) {
            if(states[index] == null) {
                continue
            }
            if(states[index].id == id) {
                found = index
                break
            }
        }

        if (state === undefined || state === null) {
            if (found !== false) {
                states.splice(found, 1)
                // delete states[found]
            }
        } else {

            var new_item = {
                id: id,
                namespace: namespace,
                entity_id: entity_id,
                state: state,
            }

            if (found !== false) {
                states[found] = new_item
            } else {
                states.push(new_item)
            }
        }
        return true
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
