<template>
    <div>
        <ADStateList 
          :namespace="namespace"
          :entity="entity"
          :headers="headers"
          :debug="debug"
          v-slot="s"
        >
            <v-card class="mx-auto" outlined>
                <v-card-title>
                    {{ name }}
                    <div class="flex-grow-1"></div>
                    <v-text-field
                        v-model="search"
                        label="Search"
                        single-line
                        hide-details
                        append-icon="mdi-magnify"
                    ></v-text-field>
                </v-card-title>

                <v-data-table
                    :headers="headers"
                    :items="s.states"
                    :items-per-page="5"
                    :search="search"
                    item-key="id"
                    :custom-filter="filter_by_entity_id"
                    sort-by="id"
                    dense
                    :footer-props="{ 'items-per-page-options': [5, 10, 15, 20, -1] }"

                >
                  <template v-slot:item.state="{ item }">
                    {{ item.state }}
                  </template>

                  <template v-slot:item.state.attributes.fired="{ item }">
                    {{ item.state.attributes.executed }} / {{ item.state.attributes.fired }}
                  </template>

                  <template v-slot:item.state.attributes.pinned_thread="{ item }">
                    <span v-if="item.state.attributes.pinned">
                      {{ item.state.attributes.pinned_thread }}
                    </span>
                    <span v-else>Not Pinned</span>
                  </template>

                  <template v-slot:item.state.attributes.kwargs="{ item }">
                    <tree-view 
                      v-if="item.state && item.state.attributes && item.state.attributes.kwargs && Object.keys(item.state.attributes.kwargs).length > 0"
                      :data="item.state.attributes.kwargs"
                      :options="{rootObjectKey: 'kwargs', maxDepth: 0}"/>
                  </template>
                </v-data-table>

            </v-card>
        </ADStateList>
    </div>
</template>

<script>
import ADStateList from './ADStateList'

export default {
  name: 'ViewStateCallbacks',
  components: {
    ADStateList,
  },
  props: {
    entity: {
        type: String,
        default: "state_callback.*"
    },
    namespace: {
        type: String,
        default: 'admin',
    },
    debug: {
        type: Boolean,
        default: false,
    },
    name: {
      type: String,
      default: 'State Callbacks',
    },
  }, 
  data: () => ({
    search: '',
    headers: [
      // {
      //     text: "StateObj",
      //     value: "state",
      // },
      {
          text: "App",
          value: 'state.attributes.app',

      },
      {
          text: "Last Executed",
          value: 'state.last_changed',

      },
      {
          text: "Entity",
          value: 'state.attributes.listened_entity',
 
      },
      {
          text: "Callback",
          value: 'state.attributes.function',

      },
      {
          text: "Fired/Executed",
          value: 'state.attributes.fired',

      },
      {
          text: "Thread",
          value: 'state.attributes.pinned_thread',
      },
      {
          text: "Kwargs",
          value: 'state.attributes.kwargs',
      },
    ],
  }),
  methods: {
    filter_by_entity_id: function(value, search, item) {
        return item.entity_id.indexOf(search) !== -1
    },
  }
}
</script>