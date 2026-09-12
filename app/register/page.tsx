import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Sign up - BazzUp",
};

export default function RegisterPage() {
  return (
    <main className="theme-original flex flex-1 items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create a BazzUp account</CardTitle>
          <CardDescription>
            Sign up as a bazaar organizer (Organizer) or an MSME looking to
            rent a slot (Vendor).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
