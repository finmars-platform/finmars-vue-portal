export default class FinmarsWidgets {

	widgetsUrl = 'http://localhost:3000/v/widgets/'
	_widgets = {}
	apiToken = ''
	_workspace = ''
	_options = {}

	constructor({
		apiToken,
		apiUrl,
		workspace,
		options,
		widgets
	}) {
		this.apiToken = apiToken
		this.widgetsUrl = apiUrl + 'widgets/'
		this._workspace = workspace
		this._options = options

		this._initWidgets( widgets )

		let inits = 0

		window.addEventListener("message", (e) => {
			if ( !e.data.action ) return false
			if ( e.data.action == 'init' ) {
				inits++

				if ( inits == widgets.length ) {
					for ( let prop in this._widgets ) {
						this._widgets[prop].postMessage( {action: 'ready'}, "*" )
					}
				}
			}

			if ( "clickOnChart" == e.data.action ) {
				this._widgets['balance'].postMessage(
					e.data,
					"*"
				)
				this._widgets['pl'].postMessage(
					e.data,
					"*"
				)
			}
		});
	}

	async _initWidgets( widgets ) {
		if ( !widgets ) {
			return false;
		}
		widgets.forEach((widget) => {
			this._createWidget(widget)
		})
	}
	async _createWidget( widget ) {
		this._checkName( widget.name )
		let heights = {
			'balance': '340px',
			'pl': '340px',
			'nav': '100px',
		}

		let frame = document.createElement('iframe')
		let widgetId = this._generateWidgetId( widget.name )

		frame.src = this.widgetsUrl + widget.name +
			'?wId=' + widgetId +
			'&token=' + this.apiToken +
			'&workspace=' + this._workspace

		let opts = Object.entries(this._options)
			.map(item => item.join('='))
			.join('&')

		frame.src += '&' + opts
		frame.name = widgetId
		frame.width = '100%'
		frame.height = heights[widget.name] || '400px'

		let container = document.querySelector(widget.container)

		if ( !container ) throw new Error(`Bad container "${widget.container}"`)

		container.append(frame)

		frame.onload = () => {
			this._widgets[widget.name] = frame.contentWindow
		}
	}
	_checkName( name ) {
		let names = ['barchart', 'balance', 'pl', 'nav']

		if ( names.includes(name) ) return true
		else throw new Error('Bad widget name')
	}
	_generateWidgetId( widgetName ) {
		return widgetName + '_' + Date.now()
	}
	destroy() {
		window.removeEventListener("message", this._onMessage)
	}
}
