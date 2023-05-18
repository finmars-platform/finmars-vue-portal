/**
 * Created by szhitenev on 15.06.2016.
 */

(function(){

    'use strict';

    var themeColors = {
        property: '65,199,132',
        collection: '79,195,247',
        event: '239,83,80',
        controller: '224,224,224',
        component: '179,157,219',
        service: '236,64,122'
    };

    var importanceResolve = function(color, importance){
        if(importance < 10) {
            return 'rgba(' + color +' ,.' + importance + ')';
        } else {
            return 'rgba(' + color +' , 1)';
        }
    };

    var property = function(name, value, importance, styles){
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.property, imp);
        console.log('%c{"property": "' + name +'", "value": "', css, value, '"}');
    };

    var collection = function(name, value, importance, styles){
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.collection, imp);
        console.log('%c{"collection": "' + name +'", "data":', css, value , '}');
    };

    var event = function(name, event, importance, styles){
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.event, imp);
        console.log('%c{"event": "' + name +'", "data": "' + event + '"}', css);
    };

    var controller = function(name, status, importance, styles) {
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.controller, imp);
        console.log('%c{"controller": "' + name +'", "status": "' + status + '"}', css);
    };

    var component = function(name, status, importance, styles) {
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.component, imp);
        console.log('%c{"component": "' + name +'", "status": "' + status + '"}', css);
    };

    var service = function(name, status, importance, styles) {
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.service, imp);
        console.log('%c{"service": "' + name +'", "status": "' + status + '"}', css);
    };

    module.exports = {
        property: property,
        collection: collection,
        event: event,
        controller: controller,
        component: component,
        service: service
    }


}());