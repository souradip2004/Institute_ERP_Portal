// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// // import { forgotPassword } from "@/app/actions/auth"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { AuthCard } from "@/components/auth/auth-card"

// export default function ForgotPasswordPage() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [isSubmitted, setIsSubmitted] = useState(false)

//   async function handleSubmit(formData: FormData) {
//     setIsLoading(true)
//     try {
//       // const result = await forgotPassword(formData)
//       // if (result.success) {
//       //   setIsSubmitted(true)
//       // }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <AuthCard
//       title="Reset password"
//       description="Enter your email address and we'll send you a link to reset your password"
//       footer={
//         <div className="text-sm text-muted-foreground">
//           Remember your password?{" "}
//           <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
//             Back to login
//           </Link>
//         </div>
//       }
//     >
//       {isSubmitted ? (
//         <div className="space-y-4 text-center">
//           <div className="rounded-full bg-primary/10 p-3 text-primary mx-auto w-fit">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               className="h-6 w-6"
//             >
//               <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-4.5" />
//               <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-4.5" />
//               <path d="m22 10.5-8.4 6.8a2 2 0 0 1-2.4 0L2.8 10.5" />
//             </svg>
//           </div>
//           <h3 className="text-xl font-semibold">Check your email</h3>
//           <p className="text-muted-foreground">We've sent you a password reset link. Please check your email.</p>
//           <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
//             Back to login
//           </Button>
//         </div>
//       ) : (
//         <form action={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
//           </div>
//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Sending reset link..." : "Send reset link"}
//           </Button>
//         </form>
//       )}
//     </AuthCard>
//   )
// }

