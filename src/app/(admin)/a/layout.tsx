// app/(admin)/a/layout.tsx
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=1024, user-scalable=no" />
        <title>Admin</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
