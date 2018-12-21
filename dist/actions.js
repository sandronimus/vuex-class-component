"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
function action(target, key, descriptor) {
    if (target[_1._actions_register] === undefined) {
        target[_1._actions_register] = [{ name: key, descriptor: descriptor }];
    }
    else {
        target[_1._actions_register].push({ name: key, descriptor: descriptor });
    }
}
exports.action = action;
function getActions(cls) {
    var actionsRegister = cls.prototype[_1._actions_register];
    if (actionsRegister === undefined || actionsRegister.length === 0)
        return;
    var mutationsList = Object.getOwnPropertyNames(cls.prototype[_1._mutations] || {});
    var actionsList = actionsRegister.map(function (action) { return action.name; });
    var statesList = Object.getOwnPropertyNames(cls.prototype[_1._state] || {});
    var gettersList = Object.getOwnPropertyNames(cls.prototype[_1._getters] || {});
    var actions = {};
    for (var _i = 0, actionsRegister_1 = actionsRegister; _i < actionsRegister_1.length; _i++) {
        var action_1 = actionsRegister_1[_i];
        var funcString = cls.prototype[action_1.name].toString();
        funcString = funcString.replace(/_?this(([\s]+)?)\.(([\s]+)?)\$?[_a-zA-Z]+(([\s]+)?)\(/g, function (functionCall) {
            var name = getFunctionName(functionCall);
            var type = checkTypeOfFunction(name);
            switch (type) {
                case "mutation":
                    return "context.commit('" + name + "',";
                case "action":
                    return "context.dispatch('" + name + "',";
                default:
                    return functionCall;
            }
        });
        funcString = funcString.replace(/_?this(([\s]+)?)\.(([\s]+)?)[_$a-zA-Z]+[^($_a-zA-Z]/g, function (propertyCall) {
            var name = getPropertyName(propertyCall);
            var lastChar = propertyCall[propertyCall.length - 1];
            if (statesList.indexOf(name) > -1)
                return "context.state." + (name + lastChar);
            else if (gettersList.indexOf(name) > -1)
                return "context.getters." + (name + lastChar);
            else
                return propertyCall;
        });
        var param = getFunctionParam(funcString);
        var body = getFunctionBody(funcString);
        var func = new Function("context", param, body);
        actions[action_1.name] = func;
    }
    return actions;
    //---------------------------------------------------------------------------------
    function getFunctionName(match) {
        var start = match.indexOf(".");
        return match.substring(start + 1, match.length - 1).trim();
    }
    function getPropertyName(match) {
        var start = match.indexOf(".");
        return match.substring(start + 1, match.length - 1).trim();
    }
    function getFunctionParam(functionString) {
        var paramStart = functionString.indexOf("(");
        var paramEnd = functionString.indexOf(")");
        return functionString.substring(paramStart + 1, paramEnd);
    }
    function getFunctionBody(functionString) {
        var bodyStart = functionString.indexOf("{") + 1;
        var bodyEnd = functionString.length - 1;
        return functionString.substring(bodyStart, bodyEnd);
    }
    function checkTypeOfFunction(name) {
        if (mutationsList.indexOf(name) > -1)
            return "mutation";
        else if (actionsList.indexOf(name) > -1)
            return "action";
        else
            return undefined;
    }
}
exports.getActions = getActions;
//# sourceMappingURL=actions.js.map