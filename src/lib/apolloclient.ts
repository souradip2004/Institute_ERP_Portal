import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from "cross-fetch";

export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined', 
    link: new HttpLink({
      uri: "http://localhost:3000/apollo", 
      fetch,
    }),
    cache: new InMemoryCache(),
  });
}
