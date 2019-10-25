<template>
    <ADState :namespace="namespace" :entity="entity" v-slot="s">
        <v-card>
            <v-list-item three-line>
                <v-list-item-content>
                    <div class="overline-keepcaps mb-0 pb-0 blue--text accent-2">
                        {{ s.namespace }}://{{ s.entity }}
                    </div>
                    <v-list-item-title class="headline mt-1 pt-1">
                        {{ s.state.state }}
                        <span v-if="s.state.attributes && s.state.attributes.unit_of_measurement" class="red--text">
                            {{ s.state.attributes.unit_of_measurement }}
                        </span>
                    </v-list-item-title>
                    <template v-if="s.state.attributes && s.state.attributes.friendly_name">
                        <v-list-item-title class="title mt-0 pt-0 mb-0 pb-0 blue--text accent-1">{{ s.state.attributes.friendly_name }}</v-list-item-title>
                    </template>
                </v-list-item-content>
            </v-list-item>
        </v-card>
    </ADState>
</template>

<script>
import ADState from './ADState';

export default {
    components: {
        ADState
    },
    name: 'ADSensor',
    props: ['entity', 'namespace']
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.overline-keepcaps {
    font-size: 0.625rem !important;
    font-weight: 400;
    letter-spacing: 0.1666666667em !important;
    line-height: 1rem;
}
</style>
