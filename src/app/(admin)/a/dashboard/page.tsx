import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import Image from "next/image";
import CreateInstitutionForm from "@/components/ui/createInstitution";
import DeleteInstitutionButton from "@/components/ui/deleteInstitutions"; // Import the button
export default async function DashboardPage() {
  const session = await auth();
  console.log('session: ', session);
  const userId = session?.user?.id;
console.log(session)
  if (!userId) {
    return <p style={{ textAlign: "center", color: "red" }}>User not found.</p>;
  }

  // Fetch user details
  const userRes = await fetch(`http://localhost:3000/api/users/${userId}`, { cache: "no-store" });
  const userData = await userRes.json();

  let institutionData = null;

  // Fetch institution details if institutionId exists
  if (userData?.institutionId) {
    const institutionRes = await fetch(`http://localhost:3000/api/institutions/${userData.institutionId}`, {
      cache: "no-store",
    });
    institutionData = await institutionRes.json();
  }
 

  return (
    <div style={styles.container}>
      {/* Profile Section */}
      <div style={styles.profileContainer}>
        <Image
          src={userData?.image || "/placeholder.png"}
          alt={userData?.name || "Avatar"}
          style={styles.profileImage}
          width={96}
          height={96}
        />
        <h1 style={styles.title}>Welcome, {userData?.name}</h1>
        <p style={styles.roleText}>
          {userData?.role === "ADMIN" ? "You are an admin." : "User Dashboard"}
        </p>
      </div>

      {/* Institution Details or Creation Form */}
      {institutionData ? (
        <div style={styles.institutionContainer} >
          <h2 style={styles.subtitle} ><a href="http://localhost:3000/a">{institutionData.name}</a></h2>
          <p><strong>Type:</strong> {institutionData.type}</p>
          <p><strong>Address:</strong> {institutionData.address}, {institutionData.city}, {institutionData.state}, {institutionData.country}</p>
          <p><strong>Phone:</strong> {institutionData.phone || "N/A"}</p>
          <p><strong>Email:</strong> <a href={`mailto:${institutionData.email}`} style={styles.link}>{institutionData.email}</a></p>
          <p><strong>Website:</strong> <a href={institutionData.website} target="_blank" style={styles.link}>{institutionData.website}</a></p>

          {/* Delete Button Component */}
          <DeleteInstitutionButton institutionId={institutionData.id} userId={userId} />
        </div>
      ) : (
        <CreateInstitutionForm userId={userId} />
      )}

      <LogoutButton />
    </div>
  );
}

// **Inline CSS Styles**
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
  },
  profileContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  profileImage: {
    width: "96px",
    height: "96px",
    borderRadius: "50%",
    border: "2px solid #007bff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  roleText: {
    color: "#6c757d",
  },
  institutionContainer: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    textAlign: "center",
    marginBottom: "20px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  subtitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#007bff",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
};

