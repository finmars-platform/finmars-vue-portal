import formbricks from "@formbricks/js";

if (typeof window !== "undefined") {
	formbricks.init({
		environmentId: "clnr8525g0009ld01nrnhv5bx",
		apiHost: "https://survey.finmars.com",
		debug: true, // remove when in production
	});
}

export default formbricks;
