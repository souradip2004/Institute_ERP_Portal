import { gql } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloclient";

const GET_USERS = gql`
  query {
    users {
      id
      email
    }
  }
`;

interface User {
  id: string;
  email: string;
}

interface UsersPageProps {
  users: User[];
}

export default function UsersPage({ users }: UsersPageProps) {
  return (
    <div>
      <h1>SSR Users List ✅</h1>
      {users.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}

// SSR Function
export async function getServerSideProps() {
  const client = createApolloClient();

  const { data } = await client.query({
    query: GET_USERS,
  });

  return {
    props: {
      users: data.users || [],
    },
  };
}
