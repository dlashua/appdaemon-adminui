<template>
    <div>
        <ADStateList 
          namespace="*"
          entity="*"
          v-slot="s"
          @pending-count="pending_count = $event"
        >
            <v-card class="mx-auto" outlined>
                <v-card-title>
                    Entities
                    <div class="flex-grow-1"></div>
                    <v-text-field
                        v-model="search"
                        label="Entity ID"
                        single-line
                        hide-details
                        append-icon="mdi-magnify"
                    ></v-text-field>
                </v-card-title>

                <v-data-table
                    :loading="busy"
                    :headers="headers"
                    :items="s.states"
                    :items-per-page="10"
                    :search="search"
                    sort-by="id"
                    item-key="id"
                    :custom-filter="filter_by_entity_id"
                    dense
                    :footer-props="{ 
                        'items-per-page-options': [10, 20, 50, 100, -1],
                        'show-first-last-page': true,
                        'show-current-page': true,
                        'xxdisable-items-per-page': true,
                    }"
                >

                    <template v-slot:item.state.last_changed="{ item }">
                        <span v-if="item.state.last_changed != 'never'">{{ item.state.last_changed | moment('calendar') }}</span>
                        <span v-else>never</span>
                    </template>
                
                    <template v-slot:item.state.attributes="{ item }">
                        <tree-view v-if="item.state && item.state.attributes" :data="item.state.attributes" :options="{rootObjectKey: 'attributes', maxDepth: 0}"/>
                    </template>
                </v-data-table>
            </v-card>
        </ADStateList>
    </div>
</template>

<script>
import ADStateList from './ADStateList'

export default {
  name: 'ViewEntitiesVtf',
  components: {
    ADStateList,
  },
  updated: function() {
      console.log('ViewEntities Updated')
  },
  data: () => ({
    busy: false,
    pending_count: 0,
    search: '',
    headers: [
      {
          text: "Namespace",
          value: "namespace",
      },
      {
          text: "Entity ID",
          value: "entity_id",
      },
      {
          text: "State",
          value: "state.state",
      },
      {
          text: "Last Changed",
          value: "state.last_changed",
      },
      {
          text: "Attributes",
          value: "state.attributes",
      },
    ],
  }),
  methods: {
    filter_by_entity_id: function(value, search, item) {
        return item.entity_id.indexOf(search) !== -1
    },
  },
  watch: {
      pending_count: function(newVal) {
          if (newVal > 10) {
              this.busy = true
          }
          if (newVal < 1) {
              this.busy = false
          }
      }
  }
}
</script>