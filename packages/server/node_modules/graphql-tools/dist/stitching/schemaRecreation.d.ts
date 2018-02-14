import { GraphQLFieldConfigMap, GraphQLFieldMap, GraphQLNamedType, GraphQLType } from 'graphql';
import { ResolveType } from '../Interfaces';
export declare function recreateType(type: GraphQLNamedType, resolveType: ResolveType<any>): GraphQLNamedType;
export declare function fieldMapToFieldConfigMap(fields: GraphQLFieldMap<any, any>, resolveType: ResolveType<any>): GraphQLFieldConfigMap<any, any>;
export declare function createResolveType(getType: (name: string, type: GraphQLType) => GraphQLType | null): ResolveType<any>;
