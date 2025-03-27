"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {comparePassword} from "@/lib/auth";
const LoginSignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with", { email, password });
    try{
       fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query:`query User($email: String!) {
  user(email: $email) {
    id
    passwordHash
    role
  }
} `,
variables: {
  email: email,
}})
  }).then(response=>response.json()).then(async data=>{console.log(data)
let validatePassword= await comparePassword(password,data.data.user.passwordHash);
if(validatePassword){
  console.log("Login successful");
  if(data.data.user.role=="ADMIN"){
    alert("Welcome Admin");
    window.location.href = "/admin";
  }else if(data.data.user.role=="TEACHER"){
    alert("Welcome Teacher");
    window.location.href = "/teachermain";
  }else if(data.data.user.role=="STUDENT"){
    alert("Welcome Student");
    window.location.href = "/studentscreen";
  }
}else{
  console.log("Invalid credentials");
}
  });
    }catch(e){
      console.log(e);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </Link>
            <Link href="/signup" className="text-sm text-blue-600 hover:underline">
              Sign Up
            </Link>
          </div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </div>
    </div>
  );
};

export default LoginSignupPage;