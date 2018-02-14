"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var resolveFromParentTypename_1 = require("./resolveFromParentTypename");
var defaultMergedResolver_1 = require("./defaultMergedResolver");
function recreateType(type, resolveType) {
    if (type instanceof graphql_1.GraphQLObjectType) {
        var fields_1 = type.getFields();
        var interfaces_1 = type.getInterfaces();
        return new graphql_1.GraphQLObjectType({
            name: type.name,
            description: type.description,
            astNode: type.astNode,
            fields: function () { return fieldMapToFieldConfigMap(fields_1, resolveType); },
            interfaces: function () { return interfaces_1.map(function (iface) { return resolveType(iface); }); },
        });
    }
    else if (type instanceof graphql_1.GraphQLInterfaceType) {
        var fields_2 = type.getFields();
        return new graphql_1.GraphQLInterfaceType({
            name: type.name,
            description: type.description,
            astNode: type.astNode,
            fields: function () { return fieldMapToFieldConfigMap(fields_2, resolveType); },
            resolveType: function (parent, context, info) {
                return resolveFromParentTypename_1.default(parent, info.schema);
            },
        });
    }
    else if (type instanceof graphql_1.GraphQLUnionType) {
        return new graphql_1.GraphQLUnionType({
            name: type.name,
            description: type.description,
            astNode: type.astNode,
            types: function () { return type.getTypes().map(function (unionMember) { return resolveType(unionMember); }); },
            resolveType: function (parent, context, info) {
                return resolveFromParentTypename_1.default(parent, info.schema);
            },
        });
    }
    else if (type instanceof graphql_1.GraphQLInputObjectType) {
        return new graphql_1.GraphQLInputObjectType({
            name: type.name,
            description: type.description,
            astNode: type.astNode,
            fields: function () {
                return inputFieldMapToFieldConfigMap(type.getFields(), resolveType);
            },
        });
    }
    else if (type instanceof graphql_1.GraphQLEnumType) {
        var values = type.getValues();
        var newValues_1 = {};
        values.forEach(function (value) {
            newValues_1[value.name] = { value: value.name };
        });
        return new graphql_1.GraphQLEnumType({
            name: type.name,
            description: type.description,
            astNode: type.astNode,
            values: newValues_1,
        });
    }
    else if (type instanceof graphql_1.GraphQLScalarType) {
        if (type === graphql_1.GraphQLID ||
            type === graphql_1.GraphQLString ||
            type === graphql_1.GraphQLFloat ||
            type === graphql_1.GraphQLBoolean ||
            type === graphql_1.GraphQLInt) {
            return type;
        }
        else {
            return new graphql_1.GraphQLScalarType({
                name: type.name,
                description: type.description,
                astNode: type.astNode,
                serialize: function (value) {
                    return value;
                },
                parseValue: function (value) {
                    return value;
                },
                parseLiteral: function (ast) {
                    return parseLiteral(ast);
                },
            });
        }
    }
    else {
        throw new Error("Invalid type " + type);
    }
}
exports.recreateType = recreateType;
function parseLiteral(ast) {
    switch (ast.kind) {
        case graphql_1.Kind.STRING:
        case graphql_1.Kind.BOOLEAN: {
            return ast.value;
        }
        case graphql_1.Kind.INT:
        case graphql_1.Kind.FLOAT: {
            return parseFloat(ast.value);
        }
        case graphql_1.Kind.OBJECT: {
            var value_1 = Object.create(null);
            ast.fields.forEach(function (field) {
                value_1[field.name.value] = parseLiteral(field.value);
            });
            return value_1;
        }
        case graphql_1.Kind.LIST: {
            return ast.values.map(parseLiteral);
        }
        default:
            return null;
    }
}
function fieldMapToFieldConfigMap(fields, resolveType) {
    var result = {};
    Object.keys(fields).forEach(function (name) {
        var field = fields[name];
        var type = resolveType(field.type);
        if (type !== null) {
            result[name] = fieldToFieldConfig(fields[name], resolveType);
        }
    });
    return result;
}
exports.fieldMapToFieldConfigMap = fieldMapToFieldConfigMap;
function createResolveType(getType) {
    var resolveType = function (type) {
        if (type instanceof graphql_1.GraphQLList) {
            var innerType = resolveType(type.ofType);
            if (innerType === null) {
                return null;
            }
            else {
                return new graphql_1.GraphQLList(innerType);
            }
        }
        else if (type instanceof graphql_1.GraphQLNonNull) {
            var innerType = resolveType(type.ofType);
            if (innerType === null) {
                return null;
            }
            else {
                return new graphql_1.GraphQLNonNull(innerType);
            }
        }
        else if (graphql_1.isNamedType(type)) {
            return getType(graphql_1.getNamedType(type).name, type);
        }
        else {
            return type;
        }
    };
    return resolveType;
}
exports.createResolveType = createResolveType;
function fieldToFieldConfig(field, resolveType) {
    return {
        type: resolveType(field.type),
        args: argsToFieldConfigArgumentMap(field.args, resolveType),
        resolve: defaultMergedResolver_1.default,
        description: field.description,
        deprecationReason: field.deprecationReason,
        astNode: field.astNode,
    };
}
function argsToFieldConfigArgumentMap(args, resolveType) {
    var result = {};
    args.forEach(function (arg) {
        var _a = argumentToArgumentConfig(arg, resolveType), name = _a[0], def = _a[1];
        result[name] = def;
    });
    return result;
}
function argumentToArgumentConfig(argument, resolveType) {
    return [
        argument.name,
        {
            type: resolveType(argument.type),
            defaultValue: argument.defaultValue,
            description: argument.description,
        },
    ];
}
function inputFieldMapToFieldConfigMap(fields, resolveType) {
    var result = {};
    Object.keys(fields).forEach(function (name) {
        var field = fields[name];
        var type = resolveType(field.type);
        if (type !== null) {
            result[name] = inputFieldToFieldConfig(fields[name], resolveType);
        }
    });
    return result;
}
function inputFieldToFieldConfig(field, resolveType) {
    return {
        type: resolveType(field.type),
        defaultValue: field.defaultValue,
        description: field.description,
        astNode: field.astNode,
    };
}
//# sourceMappingURL=schemaRecreation.js.map