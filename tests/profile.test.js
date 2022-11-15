import {render, fireEvent} from '@testing-library/vue'
import Component from '../src/pages/home.vue'

test('properly handles v-model', async () => {
  const {getByLabelText, getByText} = render(Component)

  getByText('Workspace')
})
