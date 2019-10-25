<template>
    <div>
        <div>
            Entities
            <b-badge :variant="busyVariant()">
                BUSY
            </b-badge>
        </div>
        <div>
            <b-form-input v-model="search" placeholder="Search..."></b-form-input>
        </div>
        <ADStateList namespace="*" entity='*' v-slot="s" v-on:pending-count="pendingCount = $event">
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
            />
            <b-pagination
            v-model="currentPage"
            :total-rows="totalRows(s.states.length)"
            :per-page="perPage"
            />
            <div>Showing {{ totalRows(s.states.length) }} of {{ s.states.length }}</div>
            <div>Pending {{ pendingCount }}</div>
        </ADStateList>
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
      perPage: 50,
      currentPage: 1,
      fields: [
        {
          key: 'id',
          sortable: true
        },
        {
          key: 'state.state',
          sortable: true
        }
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