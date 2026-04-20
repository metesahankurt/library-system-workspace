import { Login3 } from "@/components/login3";

export default function LoginPage() {
  return (
    <main className="flex flex-1">
    <Login3
      heading="Welcome back"
      logo={{
        url: "/",
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
        alt: "Logo",
        title: "Shadcnblocks.com",
      }}
      buttonText="Login"
      signupText="Don't have an account?"
      signupUrl="/signup"
      className="flex-1"
    />
    </main>
  );
}
