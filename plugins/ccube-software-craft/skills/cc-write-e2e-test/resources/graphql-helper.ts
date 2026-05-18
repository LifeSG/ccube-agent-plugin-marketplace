// Purpose: Typed GraphQL request helper for E2E tests against GraphQL APIs.
//
// Copy to support/apis/graphql.ts. Call from per-domain API helper files
// (workspaces.ts, events.ts, etc.) instead of page.request.post() so query
// strings and headers stay in one place.
//
// If your app uses graphql-codegen, pass the typed DocumentNode directly:
//   gqlQuery<GetWorkspacesQuery>(GetWorkspacesDocument, {}, { workspaceId })

import axios from 'axios';
import { print, type DocumentNode } from 'graphql';

const GRAPHQL_URL = process.env.GRAPHQL_URL ?? 'http://localhost:3000/graphql';

export interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string; extensions?: Record<string, unknown> }[];
}

export interface GqlOptions {
  /**
   * Pass-through tenant/workspace header. Rename the header key in the
   * implementation below to match what your app expects.
   */
  workspaceId?: string;

  /**
   * Extra headers — e.g. MOL auth headers + mol-token-bypass:
   *   {
   *     [MOLSecurityHeaderKeys.WOG_USER_ID]: user.adminId,
   *     [MOLSecurityHeaderKeys.WOG_USER_EMAIL]: user.email,
   *     'mol-token-bypass': 'true',
   *   }
   */
  additionalHeaders?: Record<string, string>;
}

export async function gqlQuery<T>(
  query: string | DocumentNode,
  variables: Record<string, unknown> = {},
  options: GqlOptions = {},
): Promise<GraphQLResponse<T>> {
  const queryString = typeof query === 'string' ? query : print(query);
  const response = await axios.post<GraphQLResponse<T>>(
    GRAPHQL_URL,
    { query: queryString, variables },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(options.workspaceId && { 'x-workspace-id': options.workspaceId }),
        ...options.additionalHeaders,
      },
    },
  );
  return response.data;
}
