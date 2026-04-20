import { Signup4 } from "@/components/signup4";

export default function SignupPage() {
  return (
    <main className="flex flex-1">
      <Signup4
        heading="Create an account"
        logo={{
          url: "/",
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
          alt: "Logo",
          title: "Shadcnblocks.com",
        }}
        signupText="Create account"
        loginText="Already have an account?"
        loginUrl="/login"
        className="flex-1"
      />
    </main>
  );
}
