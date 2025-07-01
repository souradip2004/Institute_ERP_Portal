import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from "cross-fetch";

export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({
      uri: `${process.env.NEXT_PUBLIC_API_URL}/apollo`,
      fetch,
    }),
    cache: new InMemoryCache(),
  });
}
