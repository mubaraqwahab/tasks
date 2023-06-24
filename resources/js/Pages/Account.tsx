import { useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { useAuth } from "@/utils";
import Layout from "@/Components/Layout";
import * as Form from "@radix-ui/react-form";
import clsx from "clsx";
import MyForm from "@/Components/MyForm";
import { PageProps } from "@/types";
import { FormEvent } from "react";

type AccountPageProps = PageProps<{
  status?: string;
}>;

export default function Account() {
  return (
    <Layout title="Account">
      <h1 className="font-semibold text-2xl mb-6">Account</h1>
      <UpdateProfileSection className="pb-4 sm:pb-10" />
      {/* <DeleteAccountSection className="py-4 sm:py-10" /> */}
    </Layout>
  );
}

function UpdateProfileSection({ className }: { className?: string }) {
  const { user } = useAuth()!;

  const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm({ name: user.name });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    patch(route("account.update"), { preserveScroll: true });
  };

  return (
    <section className={className}>
      <h2 className="text-lg font-medium text-gray-900 mb-3">
        Profile Information
      </h2>

      <Form.Root asChild>
        <MyForm
          method="PATCH"
          action={route("account.update")}
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <Form.Field name="name" serverInvalid={!!errors.name}>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              required
              autoComplete="name"
              maxLength={255}
            />
            {errors.name && <Form.Message>{errors.name}</Form.Message>}
          </Form.Field>

          <Form.Field name="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm opacity-50 cursor-not-allowed"
              defaultValue={user.email}
              disabled
            />
          </Form.Field>

          <div className="flex items-center gap-4">
            <Form.Submit
              disabled={processing}
              className={clsx(
                "inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150",
                processing && "opacity-25"
              )}
            >
              Update profile
            </Form.Submit>
            <Transition
              show={recentlySuccessful}
              enterFrom="opacity-0"
              leaveTo="opacity-0"
              className="transition ease-in-out"
            >
              <p className="text-sm text-gray-600">Updated.</p>
            </Transition>
          </div>
        </MyForm>
      </Form.Root>
    </section>
  );
}

function DeleteAccountSection({ className }: { className?: string }) {
  const { status } = usePage<AccountPageProps>().props;
  const { user } = useAuth()!;
  const { post, processing } = useForm({});

  const handleDelete = (e: FormEvent) => {
    e.preventDefault();
    post(route("account.destroy"), {
      preserveScroll: true,
    });
  };

  return (
    <section className={className}>
      <h2 className="text-lg font-medium text-red-600 mb-3">Delete Account</h2>

      <p className="mb-4 text-gray-600">
        Once your account is deleted, all of its resources and data will be
        permanently deleted. When you click the button below, we'll send a
        confirmation link to your email{" "}
        <b className="font-semibold">{user.email}</b>.
      </p>

      {status === "delete-link-sent" && (
        <div className="mb-4 font-medium text-sm text-green-600">
          A new confirmation link has been sent to your email{" "}
          <b className="font-semibold">{user.email}</b>. Didn't receive any
          email? Click the button below to resend.
        </div>
      )}

      <form
        method="POST"
        action={route("account.destroy")}
        onSubmit={handleDelete}
      >
        <button
          type="submit"
          disabled
          className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 opacity-50 cursor-not-allowed"
        >
          {status === "delete-link-sent"
            ? "Resend confirmation email"
            : "Delete account"}
        </button>
      </form>
    </section>
  );
}
