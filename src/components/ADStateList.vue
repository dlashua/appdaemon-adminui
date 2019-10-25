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
        updating: false,
        current_items: [],
        pending_count: 0,
        pending_batch_count: 0, 
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
    },
    delay: {
        type: Number,
        default: 10,
    }
  },
  beforeUpdate() {
    // this.updating = true
  },
  updated() {
    // this.updating = false
    // this.process_pending()
  },
  beforeDestroy: function() {
        this.$AD.offState(this.handle)
        clearTimeout(this.interval)
        this.interval = false
        this.handle = false
  },
  mounted: function() {
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
        this.pending_states[id] = data
        this.pending_count = Object.keys(this.pending_states).length
        this.$emit('pending-count', this.pending_count + this.pending_batch_count)
        this.process_pending().then()
    },
    async process_pending() {
        if(this.busy) {
            return false
        }
        if(this.updating) {
            return false
        }
        if(this.pending_count === 0) {
            return false
        } 
        this.busy = true

        while(this.pending_count > 0) {
            let batch = []
            let ids = Object.keys(this.pending_states)
            for(var id_index in ids) {
                batch.push(this.pending_states[ids[id_index]])
                delete this.pending_states[ids[id_index]]
            }
            this.pending_count = Object.keys(this.pending_states).length
            var batch_length = batch.length
            this.pending_batch_count = batch_length
            this.$emit('pending-count', this.pending_count + this.pending_batch_count)

            var promises = []
            // promises.push(new Promise(r => setTimeout(r, Math.min(batch_length * 10, 5000))))

            while(batch.length > 0) {
                var data = batch.pop()
                if (data) {
                    promises.push(  
                        this.update_one_pending_state(data, this.real_states)
                            // .then( (r) => {
                            //     this.pending_batch_count = this.pending_batch_count - 1
                            //     // this.$emit('pending-count', this.pending_count + this.pending_batch_count)
                            // })
                    )
                }
            }
            await Promise.all(promises)
            this.pending_batch_count = 0
            this.$emit('pending-count', this.pending_count + this.pending_batch_count)
            await new Promise(r => setTimeout(r, Math.min(batch_length * this.delay, 5000)))


        }
        this.busy = false
        return true
    },
    async update_one_pending_state(data, states) {
        // console.log('updating')
        if (!("namespace" in data)) {
            console.log("no namespace", data)
            return false
        }

        if (!("entity_id" in data)) {
            console.log('no entity', data)
            return false
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
                states.splice(found, 1, new_item)
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
