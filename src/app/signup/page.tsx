"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const LoginSignupPage = () => {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [error, setError] = useState("");


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try{
      await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation CreateInstitution(
            $name: String!
            $type: String!
            $subscriptionStatus: String!
            $address: String
            $city: String
            $state: String
            $country: String
            $postalCode: String
            $phone: String
            $email: String
            $website: String
            $logoUrl: String
            $primaryColor: String
          ) {
            createInstitution(name: $name, type: $type, subscriptionStatus: $subscriptionStatus, address: $address, city: $city, state: $state, country: $country, postalCode: $postalCode, phone: $phone, email: $email, website: $website, logoUrl: $logoUrl, primaryColor: $primaryColor) {
              id
              name
            }
          }`,
          variables: {
            name: institutionName,
            type: institutionType,
            subscriptionStatus: "active",
            address: address || null,
            city: city || null,
            state: state || null,
            country:country || null,
            postalCode: postalCode || null,
            phone: phone || null,
            email: email || null,
            website: website || null,
            logoUrl: logoUrl || null,
            primaryColor: primaryColor || null
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {console.log("API Response:", data)
console.log("✅ Institution Created:", data.data.createInstitution.id);
fetch("http://localhost:3000/api/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query:`mutation CreateUser($email: String!, $password: String!, $institutionId: String!) {
      createUser(email: $email, passwordHash: $password, institutionId: $institutionId) {
        id
        email
        }
        }`,
    variables: {
      email:email,
      password:password,
      institutionId:data.data.createInstitution.id
    },
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("API Response:", data)
    alert("Signup successful!")
  }
)
        })
        .catch((error) => console.error("Fetch Error:", error));

    }catch(err){
      console.error("❌ GraphQL Mutation Error:", err);
      setError("An error occurred during signup. Please try again.");      
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-700">Institution Name <span className="text-red-500">*</span></label>
            <Input type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Institution Type <span className="text-red-500">*</span></label>
            <select
              value={institutionType}
              onChange={(e) => setInstitutionType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            >
              <option value="" disabled>Select your institution type</option>
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="mb-4"><Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div className="mb-4"><Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div className="mb-4"><Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} /></div>
          <div className="mb-4"><Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required /></div>
          <div className="mb-4"><Input placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></div>

          <div className="mb-4"><Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
          <div className="mb-4"><Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>

          <div className="mb-4"><Input placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
          <div className="mb-4"><Input placeholder="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} /></div>
          <div className="mb-4"><Input placeholder="Primary Color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} /></div>

          <div className="mb-4"><Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>

          <Button type="submit" className="w-full">Confirm</Button>
        </form>

        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupPage;
