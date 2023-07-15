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
        ;
    };

    var collection = function(name, value, importance, styles){
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.collection, imp);
        ;
    };

    var event = function(name, event, importance, styles){
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.event, imp);
        ;
    };

    var controller = function(name, status, importance, styles) {
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.controller, imp);
        ;
    };

    var component = function(name, status, importance, styles) {
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.component, imp);
        ;
    };

    var service = function(name, status, importance, styles) {
        var imp = importance || 10;
        var css = styles || 'color: ' + importanceResolve(themeColors.service, imp);
        ;
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
