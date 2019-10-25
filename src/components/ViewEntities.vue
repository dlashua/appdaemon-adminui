<template>
    <div>
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
            <ADStateList namespace="*" entity='*' v-slot="s" v-on:pending-count="pendingCount = $event" :delay="30">
                <b-table 
                    :items="s.states" 
                    primary-key="id"
                    :per-page="perPage"
                    :fields="fields"
                    :current-page="currentPage"
                    sort-by="id"
                    :filter-function="filter"
                    :filter="search"
                    :filter-debounce="250"
                    @filtered="onFiltered"
                    small
                    responsive
                >
                    <template v-slot:cell(state.last_changed)="data">
                        <span v-if="data.item.state.last_changed != 'never'">{{ data.item.state.last_changed | moment('calendar') }}</span>
                        <span v-else>never</span>
                    </template>
                    <template v-slot:cell(state.attributes)="data">
                        <tree-view v-if="data.item.state && data.item.state.attributes" :data="data.item.state.attributes" :options="{rootObjectKey: 'attributes', maxDepth: 0}"/>
                    </template>
                </b-table>
                <b-pagination
                v-model="currentPage"
                :total-rows="totalRows(s.states.length)"
                :per-page="perPage"
                />
                <div>Showing {{ totalRows(s.states.length) }} of {{ s.states.length }}</div>
                <div>Pending {{ pendingCount }}</div>
            </ADStateList>
        </v-card>
    </div>
</template>

<script>
import ADStateList from './ADStateList'

export default {
  name: 'ViewEntities',
  components: {
    ADStateList,
  },
  data() {
    return {
      pendingCount: 0,
      filteredRows: 0,
      search: '',
      perPage: 10,
      currentPage: 1,
      fields: [
        {
            label: "Namespace",
            key: "namespace",
            sortable: true,
        },
        {
            label: "Entity ID",
            key: "entity_id",
            sortable: true,
        },
        {
            label: "State",
            key: "state.state",
            sortable: true,
        },
        {
            label: "Last Changed",
            key: "state.last_changed",
            sortable: true,
        },
        {
            label: "Attributes",
            key: "state.attributes",
        },
      ]
    }
  },
  methods: {
    busyVariant() {
      if (this.pendingCount > 10) {
        return 'danger'
      }

      if (this.pendingCount > 5) {
        return 'warning'
      }

      if (this.pendingCount > 0) {
        return 'info'
      }

      return 'success'
    },
    filter(item, search) {
      return item.entity_id.indexOf(search) !== -1
    },
    onFiltered(data) {
      this.filteredRows = data.length
    },
    totalRows(d) {
      if (this.search == '') {
        return d
      } else {
        return this.filteredRows
      }
    },
  }
}
</script>

<style>
</style>