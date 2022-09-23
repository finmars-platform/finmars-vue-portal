export default class Stream {

	_streams = {}
	_pingInterval = null

	_ws     = null
	_stack = {}

	constructor( opts ) {
		this._ws = new WebSocket( opts.url )

		this._onMessage()
		this._onOpen(opts.onOpen)
		this._onClose()
		this._onError()
	}

	on(channel, callback) {
		if ( !this._stack[ channel ] ) this._stack[ channel ] = []

		this._stack[ channel ].push( callback )
	}
	off(channel, callback) {
		if ( this._stack[ channel ] ) {
			let index = this._stack[ channel ].findIndex(func => func == callback)
			console.log('index:', index)
		}
	}
	send( data ) {
		return this._ws.send( JSON.stringify( data ) )
	}

	_onMessage() {
		this._ws.onmessage = async (e) => {
			if ( e.data == 'pong' ) return false
			let message = JSON.parse(e.data)

			if ( !message.type ) return false

			let eventName = message.type

			if ( !eventName ) return false

			if ( !this._stack[ eventName ] ) return false

			this._stack[ eventName ].forEach((callback) => {
				callback(message.payload)
			})
		}
	}
	_onOpen( callback ) {
		this._ws.onopen = async (e) => {
			console.log(`[WebSocket] Open`)
			callback()
		}
		this._pingInterval = setInterval(item => {
			this._ws.send('ping')
		}, 30000)
	}
	_onClose(e) {
		this._ws.onclose = async (e) => {
			console.log('[WebSocket] Close')
			clearInterval(this._pingInterval)
		}
	}
	_onError() {
		this._ws.onerror = async (e) => {
			console.log(`[WebSocket] Error`)
		}
	}

	destroy() {
		this._ws.close()
		clearInterval(this._pingInterval)
	}

}
