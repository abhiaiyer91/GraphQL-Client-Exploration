"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
//
// TODO put back import once PR is merged
// https://github.com/graphql/graphql-js/pull/1165
// import { getDescription } from 'graphql/utilities/buildASTSchema';
var backcompatOptions = { commentDescriptions: true };
var resolveFromParentTypename_1 = require("./resolveFromParentTypename");
function typeFromAST(typeRegistry, node) {
    switch (node.kind) {
        case graphql_1.Kind.OBJECT_TYPE_DEFINITION:
            return makeObjectType(typeRegistry, node);
        case graphql_1.Kind.INTERFACE_TYPE_DEFINITION:
            return makeInterfaceType(typeRegistry, node);
        case graphql_1.Kind.ENUM_TYPE_DEFINITION:
            return makeEnumType(typeRegistry, node);
        case graphql_1.Kind.UNION_TYPE_DEFINITION:
            return makeUnionType(typeRegistry, node);
        case graphql_1.Kind.SCALAR_TYPE_DEFINITION:
            return makeScalarType(typeRegistry, node);
        case graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION:
            return makeInputObjectType(typeRegistry, node);
        default:
            return null;
    }
}
exports.default = typeFromAST;
function makeObjectType(typeRegistry, node) {
    return new graphql_1.GraphQLObjectType({
        name: node.name.value,
        fields: function () { return makeFields(typeRegistry, node.fields); },
        interfaces: function () {
            return node.interfaces.map(function (iface) { return typeRegistry.getType(iface.name.value); });
        },
        description: getDescription(node, backcompatOptions),
    });
}
function makeInterfaceType(typeRegistry, node) {
    return new graphql_1.GraphQLInterfaceType({
        name: node.name.value,
        fields: function () { return makeFields(typeRegistry, node.fields); },
        description: getDescription(node, backcompatOptions),
        resolveType: function (parent, context, info) {
            return resolveFromParentTypename_1.default(parent, info.schema);
        },
    });
}
function makeEnumType(typeRegistry, node) {
    var values = {};
    node.values.forEach(function (value) {
        values[value.name.value] = {
            description: getDescription(value, backcompatOptions),
        };
    });
    return new graphql_1.GraphQLEnumType({
        name: node.name.value,
        values: values,
        description: getDescription(node, backcompatOptions),
    });
}
function makeUnionType(typeRegistry, node) {
    return new graphql_1.GraphQLUnionType({
        name: node.name.value,
        types: function () {
            return node.types.map(function (type) { return resolveType(typeRegistry, type); });
        },
        description: getDescription(node, backcompatOptions),
        resolveType: function (parent, context, info) {
            return resolveFromParentTypename_1.default(parent, info.schema);
        },
    });
}
function makeScalarType(typeRegistry, node) {
    return new graphql_1.GraphQLScalarType({
        name: node.name.value,
        description: getDescription(node, backcompatOptions),
        serialize: function () { return null; },
        // Note: validation calls the parse functions to determine if a
        // literal value is correct. Returning null would cause use of custom
        // scalars to always fail validation. Returning false causes them to
        // always pass validation.
        parseValue: function () { return false; },
        parseLiteral: function () { return false; },
    });
}
function makeInputObjectType(typeRegistry, node) {
    return new graphql_1.GraphQLInputObjectType({
        name: node.name.value,
        fields: function () { return makeValues(typeRegistry, node.fields); },
        description: getDescription(node, backcompatOptions),
    });
}
function makeFields(typeRegistry, nodes) {
    var result = {};
    nodes.forEach(function (node) {
        result[node.name.value] = {
            type: resolveType(typeRegistry, node.type),
            args: makeValues(typeRegistry, node.arguments),
            description: getDescription(node, backcompatOptions),
        };
    });
    return result;
}
function makeValues(typeRegistry, nodes) {
    var result = {};
    nodes.forEach(function (node) {
        var type = resolveType(typeRegistry, node.type);
        result[node.name.value] = {
            type: type,
            defaultValue: graphql_1.valueFromAST(node.defaultValue, type),
            description: getDescription(node, backcompatOptions),
        };
    });
    return result;
}
function resolveType(typeRegistry, node) {
    switch (node.kind) {
        case graphql_1.Kind.LIST_TYPE:
            return new graphql_1.GraphQLList(resolveType(typeRegistry, node.type));
        case graphql_1.Kind.NON_NULL_TYPE:
            return new graphql_1.GraphQLNonNull(resolveType(typeRegistry, node.type));
        default:
            return typeRegistry.getType(node.name.value);
    }
}
// Code below temporarily copied from graphql/graphql-js pending PR
// https://github.com/graphql/graphql-js/pull/1165
// MIT License
// Copyright (c) 2015-present, Facebook, Inc.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
function getDescription(node, options) {
    if (node.description) {
        return node.description.value;
    }
    if (options && options.commentDescriptions) {
        var rawValue = getLeadingCommentBlock(node);
        if (rawValue !== undefined) {
            return blockStringValue('\n' + rawValue);
        }
    }
}
function getLeadingCommentBlock(node) {
    var loc = node.loc;
    if (!loc) {
        return;
    }
    var comments = [];
    var token = loc.startToken.prev;
    while (token &&
        token.kind === 'Comment' &&
        token.next &&
        token.prev &&
        token.line + 1 === token.next.line &&
        token.line !== token.prev.line) {
        var value = String(token.value);
        comments.push(value);
        token = token.prev;
    }
    return comments.reverse().join('\n');
}
/**
 * Produces the value of a block string from its parsed raw value, similar to
 * Coffeescript's block string, Python's docstring trim or Ruby's strip_heredoc.
 *
 * This implements the GraphQL spec's BlockStringValue() static algorithm.
 */
function blockStringValue(rawString) {
    // Expand a block string's raw value into independent lines.
    var lines = rawString.split(/\r\n|[\n\r]/g);
    // Remove common indentation from all lines but first.
    var commonIndent = null;
    for (var i = 1; i < lines.length; i++) {
        var line = lines[i];
        var indent = leadingWhitespace(line);
        if (indent < line.length &&
            (commonIndent === null || indent < commonIndent)) {
            commonIndent = indent;
            if (commonIndent === 0) {
                break;
            }
        }
    }
    if (commonIndent) {
        for (var i = 1; i < lines.length; i++) {
            lines[i] = lines[i].slice(commonIndent);
        }
    }
    // Remove leading and trailing blank lines.
    while (lines.length > 0 && isBlank(lines[0])) {
        lines.shift();
    }
    while (lines.length > 0 && isBlank(lines[lines.length - 1])) {
        lines.pop();
    }
    // Return a string of the lines joined with U+000A.
    return lines.join('\n');
}
function leadingWhitespace(str) {
    var i = 0;
    while (i < str.length && (str[i] === ' ' || str[i] === '\t')) {
        i++;
    }
    return i;
}
function isBlank(str) {
    return leadingWhitespace(str) === str.length;
}
//# sourceMappingURL=typeFromAST.js.map