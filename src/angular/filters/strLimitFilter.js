/**
 * Created by szhitenev on 29.06.2016.
 */

export default function ($filter) {
    return function (value, wordwise, max, tail) {

        if (!value) return ''
        var val = value.$$unwrapTrustedValue()

        max = parseInt(max, 10)
        if (!max) return value
        if (val.length <= max) return val

        val = val.substr(0, max)
        if (wordwise) {
            var lastspace = val.lastIndexOf(' ')
            if (lastspace != -1) {
                //Also remove . and , so its gives a cleaner result.
                if (
                    val.charAt(lastspace - 1) == '.' ||
                    val.charAt(lastspace - 1) == ','
                ) {
                    lastspace = lastspace - 1
                }
                val = val.substr(0, lastspace)
            }
        }

        return val + (tail || ' …')
    }
}
