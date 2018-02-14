import { GraphQLNamedType, GraphQLSchema } from 'graphql';
import { IResolvers, MergeInfo, UnitOrList } from '../Interfaces';
export default function mergeSchemas({schemas, onTypeConflict, resolvers}: {
    schemas: Array<GraphQLSchema | string>;
    onTypeConflict?: (left: GraphQLNamedType, right: GraphQLNamedType) => GraphQLNamedType;
    resolvers?: UnitOrList<IResolvers | ((mergeInfo: MergeInfo) => IResolvers)>;
}): GraphQLSchema;
