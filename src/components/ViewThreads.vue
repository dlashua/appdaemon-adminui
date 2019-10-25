<template>
    <div>
        <ADStateList 
          namespace="admin"
          entity="thread.*"
          v-slot="s"
        >
            <v-card class="mx-auto" outlined>
                <v-card-title>
                    Threads
                    <div class="flex-grow-1"></div>
                    <v-text-field
                        v-model="search"
                        label="App Name"
                        single-line
                        hide-details
                        append-icon="mdi-magnify"
                    ></v-text-field>
                </v-card-title>

                <v-data-table
                    :headers="headers"
                    :items="s.states"
                    :items-per-page="20"
                    :search="search"
                    item-key="id"
                    :custom-filter="filter_by_entity_id"
                    sort-by="entity_id"
                    dense
                    :footer-props="{ 'items-per-page-options': [10, 20, 50, 100, -1] }"

                >
                    <template v-slot:item.entity_id="{ item }">
                    {{ item.entity_id.slice(7) }}
                    </template>

                    <template v-slot:item.callbacks="{ item }">
                        #?
                    </template>

                    <template v-slot:item.state.attributes.is_alive="{ item }">
                        <span v-if="item.state.attributes.is_alive">alive</span>
                        <span v-else>dead</span>
                    </template>
                </v-data-table>

            </v-card>
        </ADStateList>
    </div>
</template>

<script>
import ADStateList from './ADStateList'

export default {
  name: 'ViewThreads',
  components: {
    ADStateList,
  },
  data: () => ({
    search: '',
    headers: [
      {
          text: "ID",
          value: "entity_id",
      },
      {
          text: "Queue Size",
          value: "state.attributes.q",
      },
      {
          text: "Callbacks",
          value: "callbacks",
      },
      {
          text: "Time Called",
          value: "state.attributes.time_called",
      },
      {
          text: "Alive",
          value: "state.attributes.is_alive"
      },
      {
          text: "Pinned Apps",
          value: "state.attributes.pinned_apps"
      }
    ],
  }),
  methods: {
    filter_by_entity_id: function(value, search, item) {
        return item.entity_id.indexOf(search) !== -1
    },
  }
}
</script>