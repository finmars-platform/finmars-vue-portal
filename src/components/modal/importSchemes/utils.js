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
