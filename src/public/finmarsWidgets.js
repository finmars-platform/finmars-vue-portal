export default class FinmarsWidgets {

	widgetsUrl = 'http://localhost:3000/v/widgets/'

	constructor({
		widgets
	}) {
		this._initWidgets( widgets )

		window.addEventListener("message", this._onMessage);
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

		let frame = document.createElement('iframe')
		let widgetId = this._generateWidgetId( widget.name )

		frame.src = this.widgetsUrl + widget.name + '?wId=' + widgetId
		frame.name = widgetId
		frame.width = '100%'
		frame.height = '300px'

		let container = document.querySelector(widget.container)

		if ( !container ) throw new Error(`Bad container "${widget.container}"`)

		container.append(frame)
	}
	_onMessage( e ) {
		if ( !e.data.action ) return false

		console.log('data:', e.data)
	}

	_checkName( name ) {
		let names = ['barchart']

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
