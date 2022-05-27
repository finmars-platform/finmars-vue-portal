let prefix = '/{client}/api/v1'

export default {
	pricingProc: {
		get: prefix + "/procedures/pricing-procedure/",
	},
	pricingProcInstance: {
		get: prefix + "/procedures/pricing-parent-procedure-instance/",
	}
};
