/**
 * Created by szhitenev on 16.06.2016.
 *
 * Deprecated. Use shell/scripts/app/services/cookieService instead.
 *
 */
import jQuery from 'jquery'

var getCookie = function (name) {
    var cookieValue = null
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';')
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i])
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == name + '=') {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}

var setCookie = function (name, value, options) {
    options = options || {}

    if (!options.path) {
        options.path = '/'
    }

    var expires = options.expires

    if (typeof expires == 'number' && expires) {
        var d = new Date()
        d.setTime(d.getTime() + expires * 1000)
        expires = options.expires = d
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString()
    }

    value = encodeURIComponent(value)

    var updatedCookie = name + '=' + value

    for (var propName in options) {
        updatedCookie += '; ' + propName
        var propValue = options[propName]
        if (propValue !== true) {
            updatedCookie += '=' + propValue
        }
    }

    document.cookie = updatedCookie
}

var deleteCookie = function (name) {
    setCookie(name, '', { expires: -1 })
}

export default {
    getCookie: getCookie,
    setCookie: setCookie,
    deleteCookie: deleteCookie,
}
