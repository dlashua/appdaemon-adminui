const axios = require('axios')
const uuid = require('uuid/v4')

export default class AD {
    constructor() {
        this.clientName = null
        this.host = null
        this.port = null
        this.password = null

        // Vars
        this.callbacks = {}
        this.state_listeners = {}
        this.entity_change_listeners = []
        this.current_state = {}

        this.events_processed = 0
        this.state_callbacks_fired = 0

        this.request_callbacks = {}

        this.ready_listeners = []

        this._connected = false
        this._state_loaded = false
        this.configured = false

        // setInterval(() => this.report(), 3000)
    }

    connect(host, port, clientName="", password="") {
        this.clientName = clientName
        this.host = host
        this.port = port
        this.password = password

        this.configured = true

        // Connect to Websocket
        this.wsUrl = 'ws://' + this.host + ':' + this.port + '/stream'
        this.ws = new WebSocket(this.wsUrl)
        this.ws.onopen = (event) => this.onopen(event)
        this.ws.onerror = (error) => this.onerror(error)
        this.ws.onclose = (event) => this.onclose(event)

        
        // Setup Web Client
        this.webclient = axios.create({
            baseURL: 'http://' + this.host + ':' + this.port + '/',
            timeout: 5000,
            headers: {
                'Content-Type': 'text/plain',
            },
        })

    }

    report() {
        console.log("State Callbacks Fired", this.state_callbacks_fired)
        console.log("Events Processed", this.events_processed)
        console.log("State Listeners", this.state_listeners)
        console.log("Entity Change Listeners", this.entity_change_listeners)
        console.log("Callbacks",this.callbacks)
    }

    get connected() {
        return this._connected
    }

    set connected(v) {
        this._connected = v
        this.update_state('__INT__', 'connected', v)
        this.ready = v
    }

    get state_loaded() {
        return this._state_loaded
    }

    set state_loaded(v) {
        this._state_loaded = v
        this.update_state('__INT__', 'state_loaded', v)
        this.ready = v
    }

    get ready() {
        return this._state_loaded && this._connected
    }

    set ready(junk) {
        var ready = this._connected && this._state_loaded
        this.update_state('__INT__', 'ready', ready)
    }

    // State Information
    is_ready() {
        return this.connected && this.state_loaded
    }

    // Current State Management
    update_state(namespace, entity_id, data) {
        // if(entity_id.startsWith('app.')) {
        //     console.log('update_state', namespace, entity_id)
        // }

        if (!(namespace in this.current_state)) {
            this.current_state[namespace] = {}
        }

        this.current_state[namespace][entity_id] = data
        this.call_state_listeners(namespace, entity_id)
    }

    remove_state(namespace, entity_id) {
        if (!(namespace in this.current_state)) {
            return
        }
        if (!(entity_id in this.current_state[namespace])) {
            return
        }
        delete this.current_state[namespace][entity_id]
        this.call_state_listeners(namespace, entity_id)
    }

    call_state_listeners(namespace, entity_id) {
        for (var s_namespace in this.state_listeners) {
            if (s_namespace.endsWith('*') && namespace != "__INT__") {
                var s_namespace_beginning = s_namespace.slice(0, -1)
                if (!(namespace.startsWith(s_namespace_beginning))) {
                    continue
                }
            } else {
                if (namespace != s_namespace) {
                    continue
                }
            }

            for(var s_entity_id in this.state_listeners[s_namespace]) {
                if (s_entity_id.endsWith('*')) {
                    var s_entity_id_beginning = s_entity_id.slice(0, -1)
                    if (!(entity_id.startsWith(s_entity_id_beginning))) {
                        continue
                    }
                } else {
                    if (entity_id != s_entity_id) {
                        continue
                    }
                }

                for(var index in this.state_listeners[s_namespace][s_entity_id]) {
                    var handle = this.state_listeners[s_namespace][s_entity_id][index]
                    
                    if (!(handle in this.callbacks)) {
                        delete this.state_listeners[s_namespace][s_entity_id][index]
                        continue
                    }
        
                    var cb = this.callbacks[handle]

                    // if(entity_id.startsWith('app.')) {
                    //     console.log('call_state_listeners', namespace, entity_id, cb)
                    // }

                    cb({
                        namespace: namespace,
                        entity_id: entity_id,
                        state: this.current_state[namespace][entity_id]
                    })
                    this.state_callbacks_fired++
                }
            }
        }
    }

    // WebSocket Control Methods
    onclose() {
        this.connected = false
        console.log('WebSocket Disconnected')
        this.notifyReadyListeners()
    }

    onopen() {
        this.ws.onmessage = (event) => this.onmessage(event)

        var data = {
            client_name: 'ADCP Client',
        }

        if (this.password.length > 0) {
            data['password'] = this.password
        }

        this.send_json('hello', data)
    }

    send_json(type, data = {}) {
        var request = {
            request_type: type,
        }
        if (data != {}) {
            request['data'] = data
        }

        console.log('sending', request)
        this.ws.send(JSON.stringify(request))
    }

    send_json_callback(cb, type, data = {}) {
        var handle = uuid()
        this.request_callbacks[handle] = cb

        var request = {
            request_type: type,
            request_id: handle
        }

        if (data != {}) {
            request['data'] = data
        }

        console.log('sending', request)
        this.ws.send(JSON.stringify(request))
    }

    onerror(error) {
        console.log('WebSocket Error:',error)
    }

    onmessage(event) {
        this.events_processed++

        var event_data = JSON.parse(event.data)

        if (event_data.response_success == false) {
            console.log('Stream Error', event_data)
            return
        }

        if (event_data.response_id in this.request_callbacks) {
            this.request_callbacks[event_data.response_id](event_data.data)
            delete this.request_callbacks[event_data.response_id]
            return
        }

        if (event_data.response_type == "hello") {
            console.log('Auth Message', event_data)
            return this.onauth()
        }

        if (event_data.event_type == "state_changed") {
            return this.stateChangedHandler(event_data)
        }

        if (event_data.event_type == "__AD_ENTITY_ADDED") {
            return this.entityChangedHandler(event_data)
        }

        if (event_data.event_type == "__AD_ENTITY_REMOVED") {
            return this.entityChangedHandler(event_data)
        }

        if ("response_type" in event_data) {
            console.log('Unhandled Response', event_data)
        }
    }

    onauth() {
        this.connected = true
        this.send_json('listen_event', {
            namespace: "*",
            event: "__AD_ENTITY_REMOVED"
        })
        this.send_json('listen_event', {
            namespace: "*",
            event: "__AD_ENTITY_ADDED"
        })
        this.notifyReadyListeners()
    }

    notifyReadyListeners() {
        for(var index in this.ready_listeners) {
            var handle = this.ready_listeners[index]
            if (!(handle in this.callbacks)) {
                this.ready_listeners.splice(index,1)
                continue
            }
            var cb = this.callbacks[handle]
            cb(this.connected)
        }
    }

    // Web Client Ease Methods
    fetchEndpoint(url) {
        var data = {
            params: {},
        }

        if (this.password.length > 0) {
            data.params.api_password = this.password
        }

        return this.webclient(url,data)

    }


    // Request Response Handlers
    processGetAllState(data) {
        console.log('processGetAllState', data)
        for (var namespace in data) {
            for (var entity_id in data[namespace]) {
                this.update_state(namespace, entity_id, data[namespace][entity_id])
            }
        }

        this.state_loaded = true
    }

    processGetNamespace(namespace, data) {
        console.log('processGetNamespace', namespace, data)
        for (var entity_id in data) {
            this.update_state(namespace, entity_id, data[entity_id])
        }
    }

    processGetState(namespace, entity_id, data) {
        console.log('processGetState', namespace, entity_id, data)
        this.update_state(namespace, entity_id, data)
    }


    // Stream Handlers
    entityChangedHandler(data) {
        var change_type
        if (data.event_type == "__AD_ENTITY_ADDED") {
            change_type = "added"
        } else if (data.event_type == "__AD_ENTITY_REMOVED") {
            change_type = "removed"
        } else {
            return
        }

        var namespace = data.namespace
        var entity_id = data.data.entity_id

        var state
        if (change_type == "added") {
            this.update_state(namespace, entity_id, data.data.state)
            state = data.data.state
        }

        if (change_type == "removed") {
            this.remove_state(namespace, entity_id)
        }
        
        var that = this
        this.entity_change_listeners.forEach(function (listener_data) {
            if (listener_data.namespace instanceof RegExp) {
                if (!listener_data.namespace.test(namespace)) {
                    return
                } 
            } else {
                if (listener_data.namespace != namespace) {
                    return
                }
            }

            if (listener_data.entity_id instanceof RegExp) {
                if (!listener_data.entity_id.test(entity_id)) {
                    return
                } 
            } else {
                if (listener_data.entity_id != entity_id) {
                    return
                }
            }

            var handle = listener_data.handle
            if (!(handle in that.callbacks)) {
                var index = that.entity_change_listeners.indexOf(listener_data)
                that.entity_change_listeners.splice(index, 1)
                return
            }

            var cb = that.callbacks[handle]
            cb({
                entity_id: entity_id,
                namespace: namespace,
                state: state,
            })

        })
    }

    stateChangedHandler(data) {
        this.update_state(data.namespace, data.data.entity_id, data.data.new_state)
    }


    //// Client Methods
    // Stream Listeners
    onState(namespace, entity_id, cb, retained=true) {
        if (!(namespace in this.state_listeners)) {
            this.state_listeners[namespace] = {}
        }

        if (!(entity_id in this.state_listeners[namespace])) {
            this.state_listeners[namespace][entity_id] = []
        }

        var handle = uuid()

        this.callbacks[handle] = cb

        this.state_listeners[namespace][entity_id].push(handle)

        this.send_json('listen_state', {
            namespace: namespace,
            entity_id: entity_id,
            handle: handle,
        })

        if(retained) {
            if(namespace.endsWith('*')) {
                this.send_json_callback(
                    (data) => this.processGetAllState(data),
                    'get_state',
                )
            } else if (entity_id.endsWith('*')) {
                this.send_json_callback(
                    (data) => this.processGetNamespace(namespace, data),
                    'get_state', {
                        namespace: namespace,
                    }
                )
            } else {
                this.send_json_callback(
                    (data) => this.processGetState(namespace, entity_id, data),
                    'get_state', {
                        namespace: namespace,
                        entity_id: entity_id,
                    }
                )
            }
        }

        console.log('state listeners', this.state_listeners)

        return handle
    }

    offState(handle) {
        if (handle in this.callbacks) {
            delete this.callbacks[handle]
        }

        this.send_json('cancel_listen_state', {
            handle: handle
        })
    }

    onReady(cb) {
        var handle = uuid()

        this.callbacks[handle] = cb

        this.ready_listeners.push(handle)
        return handle
    }

    onEntityChange(namespace, entity_id, cb) {
        var handle = uuid()

        this.callbacks[handle] = cb

        var data = {
            namespace: namespace,
            entity_id: entity_id,
            handle: handle
        }

        this.entity_change_listeners.push(data)
        return handle
    }


    // Callback Helpers
    cancelCallback(handle) {
        if (handle in this.callbacks) {
            delete this.callbacks[handle]
        }
    }


    // State Getters
    getState(namespace, entity_id, cb) {
        // Handle Wildcards
        if (namespace.endsWith('*') || entity_id.endsWith('*')) {
            return this.getStates(namespace, entity_id, cb)
        }

        // not a wildcard
        if (!(namespace in this.current_state)) {
            return
        }
        if (!(entity_id in this.current_state[namespace])) {
            return
        }

        cb({
            namespace: namespace,
            entity_id: entity_id,
            state: this.current_state[namespace][entity_id]
        })
    }

    getStates(s_namespace, s_entity_id, cb) {
        for (var namespace in this.current_state) {
            if (s_namespace.endsWith('*') && namespace != '__INT__') {
                var s_namespace_beginning = s_namespace.slice(0, -1)
                if (!(namespace.startsWith(s_namespace_beginning))) {
                    continue
                }
            } else {
                if (namespace != s_namespace) {
                    continue
                }
            }

            for(var entity_id in this.current_state[namespace]) {
                if (s_entity_id.endsWith('*')) {
                    var s_entity_id_beginning = s_entity_id.slice(0, -1)
                    if (!(entity_id.startsWith(s_entity_id_beginning))) {
                        continue
                    }
                } else {
                    if (entity_id != s_entity_id) {
                        continue
                    }
                }

                cb({
                    namespace: namespace,
                    entity_id: entity_id,
                    state: this.current_state[namespace][entity_id]
                })
            }
        }
    }


}
