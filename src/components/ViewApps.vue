<template>
    <div>
        <ADStateList 
          namespace="admin"
          entity="app.*"
          v-slot="s"
        >
            <v-card class="mx-auto" outlined>
                <v-card-title>
                    Apps
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
                    sort-by="id"
                    dense
                    :footer-props="{ 'items-per-page-options': [10, 20, 50, 100, -1] }"

                >
                  <template v-slot:item.entity_id="{ item }">
                    {{ item.entity_id.slice(4) }}
                  </template>
                  <template v-slot:item.state.attributes.args="{ item }">
                    <tree-view 
                      v-if="item.state && item.state.attributes && item.state.attributes.args"
                      :data="item.state.attributes.args"
                      :options="{rootObjectKey: 'args', maxDepth: 0}"/>
                  </template>
                </v-data-table>

            </v-card>
        </ADStateList>
    </div>
</template>

<script>
import ADStateList from './ADStateList'

export default {
  name: 'ViewApps',
  components: {
    ADStateList,
  },
  data: () => ({
    search: '',
    headers: [
      {
          text: "Name",
          value: "entity_id",
          width: "15%",
      },
      {
          text: "State",
          value: "state.state",
          width: "15%",
      },
      {
          text: "Callbacks",
          value: "state.attributes.callbacks",
          width: "15%",
      },
      {
          text: "Arguments",
          value: "state.attributes.args",
          width: "55%",
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