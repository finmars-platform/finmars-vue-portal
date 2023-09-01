/**
 * Created by szhitenev on 24.06.2016.
 */

export default function ($sce) {
	return function (val) {
		//;
		if (val) {
			return $sce.trustAsHtml(val.toString())
		}
	}
}
