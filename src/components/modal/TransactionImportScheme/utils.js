import cloneDeep from 'lodash/cloneDeep';
import { getRandomString } from '@finmars/ui';
import useApi from '~/composables/useApi';
import useNotify from '~/composables/useNotify';

export function generalTabFormatItem(i) {
	const item = cloneDeep(i);
	item.frontOptions = {
		key: getRandomString(5)
	};
	return item;
}

export function schemeTabFormatItem(i, fields, dryRunActiveResultItem) {
	const item = cloneDeep(i);
	if (!item.frontOptions?.key) {
		item.frontOptions = {
			key: getRandomString(5)
		};
	}

	switch (fields) {
		case 'inputs':
		case 'calculated_inputs':
			// eslint-disable-next-line no-case-declarations
			const block = fields === 'inputs' ? 'conversion_inputs' : 'inputs';
			if (dryRunActiveResultItem && dryRunActiveResultItem[block]) {
				const keys = Object.keys(dryRunActiveResultItem[block]);
				keys.includes(item.name) &&
					(item.dryRunResult = dryRunActiveResultItem[block][item.name]);
			}
			break;
		case 'scenarios':
			// eslint-disable-next-line no-case-declarations
			const transactionTypeUserCode = item.transaction_type_object?.user_code;
			if (
				dryRunActiveResultItem &&
				dryRunActiveResultItem.transaction_inputs &&
				dryRunActiveResultItem.transaction_inputs[transactionTypeUserCode]
			) {
				const keys = Object.keys(
					dryRunActiveResultItem.transaction_inputs[transactionTypeUserCode]
				);
				keys.includes(item.name) &&
					(item.dryRunResult =
						dryRunActiveResultItem.transaction_inputs[transactionTypeUserCode][
							item.name
						]);
			}
			break;
	}

	return item;
}

export function getFunctions(data = []) {
	return data.map((input) => ({
		name: `Imported: ${input.name} (column #${input.column})`,
		description: `Imported: ${input.name} (column #${input.column}) -> ${input.name_expr}`,
		groups: 'input',
		func: input.name,
		validation: {
			func: input.name
		}
	}));
}

export function getRuleScenarioTplt({
	name,
	is_default_rule_scenario,
	is_error_rule_scenario
}) {
	return {
		name: name ?? '-',
		value: '',
		transaction_type: null,
		is_default_rule_scenario: is_default_rule_scenario ?? false,
		is_error_rule_scenario: is_error_rule_scenario ?? false,
		fields: [],
		selector_values: [],
		frontOptions: {
			key: getRandomString(5),
			transactionTypeInputs: []
		}
	};
}

function createScheme(scheme) {
	return useApi('importSchemeInstance.post', { body: scheme });
}

async function updateScheme(scheme) {
	return useApi('importSchemeInstance.patch', {
		params: { id: scheme.id },
		body: scheme
	});
}

export async function createOrUpdateScheme(scheme) {
	try {
		if (scheme.id) {
			await updateScheme(scheme);
		} else {
			await createScheme(scheme);
		}

		useNotify({
			type: 'success',
			title: `The transaction import scheme ${scheme.user_code} was successfully saved`
		});
	} catch (err) {
		console.error(
			`The error ${scheme.id ? 'updating' : 'creating'} the transaction import scheme. `,
			err
		);
		useNotify({
			type: 'error',
			title: `The error saving the transaction import scheme ${scheme.user_code}`
		});
	}
}
