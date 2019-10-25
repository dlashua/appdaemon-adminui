<template>
    <div>
        <ADStateList namespace="admin" entity="*" />
    </div>
</template>

<script>
import ADStateList from './ADStateList'

export default {
  name: 'ViewAdmin',
  components: {
    ADStateList,
  },
  data: () => ({

  }),
}
</script>