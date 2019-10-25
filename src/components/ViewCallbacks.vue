<template>
    <div>
      <ViewSchedulerCallbacks />
      <ViewStateCallbacks />
      <ViewEventCallbacks />
    </div>
</template>

<script>
import ViewSchedulerCallbacks from './ViewSchedulerCallbacks'
import ViewStateCallbacks from './ViewStateCallbacks'
import ViewEventCallbacks from './ViewEventCallbacks'

export default {
  name: 'ViewCallbacks',
  components: {
    ViewSchedulerCallbacks,
    ViewStateCallbacks,
    ViewEventCallbacks,
  },
  data: () => ({

  }),
  methods: {

  }
}
</script>