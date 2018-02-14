import { DocumentNode, FieldNode, FragmentDefinitionNode, GraphQLObjectType, GraphQLResolveInfo, GraphQLSchema, InlineFragmentNode, VariableDefinitionNode } from 'graphql';
export default function delegateToSchema(schema: GraphQLSchema, fragmentReplacements: {
    [typeName: string]: {
        [fieldName: string]: InlineFragmentNode;
    };
}, operation: 'query' | 'mutation' | 'subscription', fieldName: string, args: {
    [key: string]: any;
}, context: {
    [key: string]: any;
}, info: GraphQLResolveInfo): Promise<any>;
export declare function createDocument(schema: GraphQLSchema, fragmentReplacements: {
    [typeName: string]: {
        [fieldName: string]: InlineFragmentNode;
    };
}, type: GraphQLObjectType, rootFieldName: string, operation: 'query' | 'mutation' | 'subscription', selections: Array<FieldNode>, fragments: {
    [fragmentName: string]: FragmentDefinitionNode;
}, variableDefinitions?: Array<VariableDefinitionNode>): DocumentNode;
