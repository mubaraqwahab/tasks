import GuestLayout from "@/Layouts/GuestLayout";
import { Head } from "@inertiajs/react";

export default function Login({ status }: { status?: string }) {
  return (
    <GuestLayout>
      <Head title="Log in" />

      {/* Is this still needed? */}
      {/* {status && (
        <div className="mb-4 font-medium text-sm text-green-600">{status}</div>
      )} */}

      {/* TODO: See how FrontendMentor does it; they only allow login with GitHub */}
      <a
        href={route("login.google")}
        className="flex p-2 justify-center border border-gray-400 rounded-md font-medium mb-5 bg-gray-100 hover:bg-gray-200"
      >
        Continue with Google
      </a>
    </GuestLayout>
  );
}
