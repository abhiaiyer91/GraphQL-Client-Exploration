/// <reference types="zen-observable" />
import { Fetcher } from './makeRemoteExecutableSchema';
import { ApolloLink, GraphQLRequest, Observable, FetchResult } from 'apollo-link';
export default function linkToFetcher(link: ApolloLink): Fetcher;
export declare function execute(link: ApolloLink, operation: GraphQLRequest): Observable<FetchResult>;
