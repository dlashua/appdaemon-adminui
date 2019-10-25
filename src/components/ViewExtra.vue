<template>
    <div>
        <!-- <ADStateCard namespace="admin" entity="sensor.appdaemon_uptime" />
        <ADStateCard namespace="default" entity="sensor.time" />
        <ADStateCard namespace="default" entity="sensor.house_max_temp" />
        <ADSensor namespace="default" entity="sensor.kitchen_temperature" />
        <ADSensor namespace="default" entity="sensor.living_temperature" /> -->
        <ADState namespace="admin" entity="app.app_watcher" v-slot="s">
            <pre>{{ s.state}}</pre>
        </ADState>
    </div>
</template>

<script>
import ADStateCard from './ADStateCard'
import ADSensor from './ADSensor'
import ADState from './ADState'

export default {
  name: 'ViewExtra',
  components: {
    ADStateCard,
    ADSensor,
    ADState,
  },
  data: () => ({

  }),
}
</script>