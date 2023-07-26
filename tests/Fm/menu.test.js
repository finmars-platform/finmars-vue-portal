import { render, fireEvent, screen } from '@testing-library/vue'
import FmMenu from './src/components/Fm/Menu.vue'

describe('FmMenu', () => {
	it('Is open', async () => {
		const { debug, container } = render(FmMenu, {
			slots: {
				btn: '<div>button</div>',
				default: '<div>test list</div>',
			},
			props: {
				opened: true,
				modelValue: 1,
				items: [
					{ id: 1, name: 'test' },
					{ id: 2, name: 'test2' },
				],
			},
		})
		const activator = screen.getByText('button')

		await fireEvent.click(activator)

		let drop = screen.queryByText('test list')

		expect(drop).toBeTruthy()

		await fireEvent.click(activator)
	})
})

// test('increments value on click', async () => {
// 	const { debug, container } = render(Select, {
// 		slot
// 		props: {
// 			opened: true,
// 			modelValue: 1,
// 			items: [
// 				{ id: 1, name: 'test' },
// 				{ id: 2, name: 'test2' },
// 			],
// 		},
// 	})
// 	let select = container.firstChild

// 	await fireEvent.click(select)
// 	debug()
// })
