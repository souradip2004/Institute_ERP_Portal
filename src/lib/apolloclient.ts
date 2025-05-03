import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from "cross-fetch";

export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined', 
    link: new HttpLink({
      uri: "https://commercial.aiclassroom.in/apollo", 
      fetch,
    }),
    cache: new InMemoryCache(),
  });
}
