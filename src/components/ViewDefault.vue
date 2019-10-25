<template>
    <div>
        <ADStateList namespace="default" entity="*" />
    </div>
</template>

<script>
import ADStateList from './ADStateList'

export default {
  name: 'ViewDefault',
  components: {
    ADStateList,
  },
  data: () => ({

  }),
}
</script>