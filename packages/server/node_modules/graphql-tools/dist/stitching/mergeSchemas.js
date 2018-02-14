"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var TypeRegistry_1 = require("./TypeRegistry");
var isEmptyObject_1 = require("../isEmptyObject");
var mergeDeep_1 = require("../mergeDeep");
var schemaGenerator_1 = require("../schemaGenerator");
var schemaRecreation_1 = require("./schemaRecreation");
var delegateToSchema_1 = require("./delegateToSchema");
var typeFromAST_1 = require("./typeFromAST");
var backcompatOptions = { commentDescriptions: true };
function mergeSchemas(_a) {
    var schemas = _a.schemas, onTypeConflict = _a.onTypeConflict, resolvers = _a.resolvers;
    if (!onTypeConflict) {
        onTypeConflict = defaultOnTypeConflict;
    }
    var queryFields = {};
    var mutationFields = {};
    var subscriptionFields = {};
    var typeRegistry = new TypeRegistry_1.default();
    var resolveType = schemaRecreation_1.createResolveType(function (name) {
        return typeRegistry.getType(name);
    });
    var mergeInfo = createMergeInfo(typeRegistry);
    var actualSchemas = [];
    var typeFragments = [];
    var extensions = [];
    var fullResolvers = {};
    schemas.forEach(function (schema) {
        if (schema instanceof graphql_1.GraphQLSchema) {
            actualSchemas.push(schema);
        }
        else if (typeof schema === 'string') {
            var parsedSchemaDocument = graphql_1.parse(schema);
            try {
                // TODO fix types https://github.com/apollographql/graphql-tools/issues/542
                var actualSchema = graphql_1.buildASTSchema(parsedSchemaDocument, backcompatOptions);
                if (actualSchema.getQueryType()) {
                    actualSchemas.push(actualSchema);
                }
            }
            catch (e) {
                typeFragments.push(parsedSchemaDocument);
            }
            parsedSchemaDocument = schemaGenerator_1.extractExtensionDefinitions(parsedSchemaDocument);
            if (parsedSchemaDocument.definitions.length > 0) {
                extensions.push(parsedSchemaDocument);
            }
        }
    });
    actualSchemas.forEach(function (schema) {
        typeRegistry.addSchema(schema);
        var queryType = schema.getQueryType();
        var mutationType = schema.getMutationType();
        var subscriptionType = schema.getSubscriptionType();
        var typeMap = schema.getTypeMap();
        Object.keys(typeMap).forEach(function (typeName) {
            var type = typeMap[typeName];
            if (graphql_1.isNamedType(type) &&
                graphql_1.getNamedType(type).name.slice(0, 2) !== '__' &&
                type !== queryType &&
                type !== mutationType &&
                type !== subscriptionType) {
                var newType = schemaRecreation_1.recreateType(type, resolveType);
                typeRegistry.addType(newType.name, newType, onTypeConflict);
            }
        });
        Object.keys(queryType.getFields()).forEach(function (name) {
            if (!fullResolvers.Query) {
                fullResolvers.Query = {};
            }
            fullResolvers.Query[name] = createDelegatingResolver(mergeInfo, 'query', name);
        });
        queryFields = __assign({}, queryFields, queryType.getFields());
        if (mutationType) {
            if (!fullResolvers.Mutation) {
                fullResolvers.Mutation = {};
            }
            Object.keys(mutationType.getFields()).forEach(function (name) {
                fullResolvers.Mutation[name] = createDelegatingResolver(mergeInfo, 'mutation', name);
            });
            mutationFields = __assign({}, mutationFields, mutationType.getFields());
        }
        if (subscriptionType) {
            if (!fullResolvers.Subscription) {
                fullResolvers.Subscription = {};
            }
            Object.keys(subscriptionType.getFields()).forEach(function (name) {
                fullResolvers.Subscription[name] = {
                    subscribe: createDelegatingResolver(mergeInfo, 'subscription', name),
                };
            });
            subscriptionFields = __assign({}, subscriptionFields, subscriptionType.getFields());
        }
    });
    typeFragments.forEach(function (document) {
        document.definitions.forEach(function (def) {
            var type = typeFromAST_1.default(typeRegistry, def);
            if (type) {
                typeRegistry.addType(type.name, type, onTypeConflict);
            }
        });
    });
    var passedResolvers = {};
    if (resolvers) {
        if (typeof resolvers === 'function') {
            passedResolvers = resolvers(mergeInfo);
        }
        else if (Array.isArray(resolvers)) {
            passedResolvers = resolvers
                .map(function (resolver) {
                return typeof resolver === 'function' ? resolver(mergeInfo) : resolver;
            })
                .reduce(mergeDeep_1.default, {});
        }
        else {
            passedResolvers = __assign({}, resolvers);
        }
    }
    Object.keys(passedResolvers).forEach(function (typeName) {
        var type = passedResolvers[typeName];
        if (type instanceof graphql_1.GraphQLScalarType) {
            return;
        }
        Object.keys(type).forEach(function (fieldName) {
            var field = type[fieldName];
            if (field.fragment) {
                typeRegistry.addFragment(typeName, fieldName, field.fragment);
            }
        });
    });
    fullResolvers = mergeDeep_1.default(fullResolvers, passedResolvers);
    var query = new graphql_1.GraphQLObjectType({
        name: 'Query',
        fields: function () { return schemaRecreation_1.fieldMapToFieldConfigMap(queryFields, resolveType); },
    });
    var mutation;
    if (!isEmptyObject_1.default(mutationFields)) {
        mutation = new graphql_1.GraphQLObjectType({
            name: 'Mutation',
            fields: function () { return schemaRecreation_1.fieldMapToFieldConfigMap(mutationFields, resolveType); },
        });
    }
    var subscription;
    if (!isEmptyObject_1.default(subscriptionFields)) {
        subscription = new graphql_1.GraphQLObjectType({
            name: 'Subscription',
            fields: function () { return schemaRecreation_1.fieldMapToFieldConfigMap(subscriptionFields, resolveType); },
        });
    }
    typeRegistry.addType('Query', query);
    typeRegistry.addType('Mutation', mutation);
    typeRegistry.addType('Subscription', subscription);
    var mergedSchema = new graphql_1.GraphQLSchema({
        query: query,
        mutation: mutation,
        subscription: subscription,
        types: typeRegistry.getAllTypes(),
    });
    extensions.forEach(function (extension) {
        // TODO fix types https://github.com/apollographql/graphql-tools/issues/542
        mergedSchema = graphql_1.extendSchema(mergedSchema, extension, backcompatOptions);
    });
    schemaGenerator_1.addResolveFunctionsToSchema(mergedSchema, fullResolvers);
    forEachField(mergedSchema, function (field) {
        if (field.resolve) {
            var fieldResolver_1 = field.resolve;
            field.resolve = function (parent, args, context, info) {
                var newInfo = __assign({}, info, { mergeInfo: mergeInfo });
                return fieldResolver_1(parent, args, context, newInfo);
            };
        }
    });
    return mergedSchema;
}
exports.default = mergeSchemas;
function defaultOnTypeConflict(left, right) {
    return left;
}
function createMergeInfo(typeRegistry) {
    return {
        delegate: function (operation, fieldName, args, context, info) {
            var schema = typeRegistry.getSchemaByField(operation, fieldName);
            if (!schema) {
                throw new Error("Cannot find subschema for root field " + operation + "." + fieldName);
            }
            var fragmentReplacements = typeRegistry.fragmentReplacements;
            return delegateToSchema_1.default(schema, fragmentReplacements, operation, fieldName, args, context, info);
        },
    };
}
function createDelegatingResolver(mergeInfo, operation, fieldName) {
    return function (root, args, context, info) {
        return mergeInfo.delegate(operation, fieldName, args, context, info);
    };
}
function forEachField(schema, fn) {
    var typeMap = schema.getTypeMap();
    Object.keys(typeMap).forEach(function (typeName) {
        var type = typeMap[typeName];
        if (!graphql_1.getNamedType(type).name.startsWith('__') &&
            type instanceof graphql_1.GraphQLObjectType) {
            var fields_1 = type.getFields();
            Object.keys(fields_1).forEach(function (fieldName) {
                var field = fields_1[fieldName];
                fn(field, typeName, fieldName);
            });
        }
    });
}
//# sourceMappingURL=mergeSchemas.js.map