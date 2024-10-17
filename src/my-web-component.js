/*import { defineCustomElement } from 'vue'
import MyComponent from './components/Sidebar.vue'

// Определяем кастомный элемент
const MyCustomElement = defineCustomElement(MyComponent)

// Регистрируем элемент в браузере
customElements.define('my-custom-element', MyCustomElement)*/
import { createApp } from 'vue'
import MyComponent from './components/Sidebar.vue'

class MyCustomElement extends HTMLElement {
	constructor() {
		super()
	}

	connectedCallback() {
		// Монтируем Vue компонент напрямую в this
		const app = createApp(MyComponent)
		app.mount(this) // Монтируем Vue компонент в сам элемент <my-custom-element>
	}
}

// Регистрируем элемент в браузере
customElements.define('my-custom-element', MyCustomElement)
