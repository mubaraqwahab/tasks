import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { PageProps } from "@/types/index";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { useState, useRef, FormEventHandler } from "react";
import { Transition } from "@headlessui/react";
import PrimaryButton from "@/Components/PrimaryButton";
import { useAuth } from "@/utils";

type EditProfilePageProps = PageProps<{}>;

export default function Edit({ auth }: EditProfilePageProps) {
  console.log(arguments[0]);
  return (
    <AuthenticatedLayout
      user={auth!.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Profile
        </h2>
      }
    >
      <Head title="Profile" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
            <UpdateProfileInformationForm className="max-w-xl" />
          </div>

          <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
            <section className="max-w-xl">
              <header>
                <h2 className="text-lg font-medium text-gray-900">
                  Connected Account
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  You can log in to Tasks with your Google account{" "}
                  <b>{auth!.user.email}</b>.
                </p>
              </header>
            </section>
          </div>

          <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
            <DeleteUserForm className="max-w-xl" />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function UpdateProfileInformationForm({
  className = "",
}: {
  className?: string;
}) {
  const user = useAuth()!.user;

  const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm({
      name: user.name,
      email: user.email,
    });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    patch(route("profile.update"));
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">
          Profile Information
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Update your account's profile information and email address.
        </p>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div>
          <InputLabel htmlFor="name" value="Name" />

          <TextInput
            id="name"
            className="mt-1 block w-full"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            required
            isFocused
            autoComplete="name"
          />

          <InputError className="mt-2" message={errors.name} />
        </div>

        {/* TODO: make this not a form input? */}
        <div>
          <InputLabel htmlFor="email" value="Email" />

          <TextInput
            id="email"
            type="email"
            className="mt-1 block w-full"
            value={data.email}
            defaultValue={user.email}
            readOnly
            autoComplete="username"
          />
        </div>

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={processing}>Save</PrimaryButton>

          <Transition
            show={recentlySuccessful}
            enterFrom="opacity-0"
            leaveTo="opacity-0"
            className="transition ease-in-out"
          >
            <p className="text-sm text-gray-600">Saved.</p>
          </Transition>
        </div>
      </form>
    </section>
  );
}

function DeleteUserForm({ className = "" }: { className?: string }) {
  const { hasPassword } = usePage<EditProfilePageProps>().props;

  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
  const passwordInput = useRef<HTMLInputElement>();

  const {
    data,
    setData,
    delete: destroy,
    processing,
    reset,
    errors,
  } = useForm({
    password: "",
  });

  const confirmUserDeletion = () => {
    setConfirmingUserDeletion(true);
  };

  const deleteUser: FormEventHandler = (e) => {
    e.preventDefault();

    destroy(route("profile.destroy"), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordInput.current?.focus(),
      onFinish: () => reset(),
    });
  };

  const closeModal = () => {
    setConfirmingUserDeletion(false);

    reset();
  };

  return (
    <section className={`space-y-6 ${className}`}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">Delete Account</h2>

        <p className="mt-1 text-sm text-gray-600">
          Once your account is deleted, all of its resources and data will be
          permanently deleted. Before deleting your account, please download any
          data or information that you wish to retain.
        </p>
        {!hasPassword && (
          <p className="mt-1 text-sm text-gray-600">
            To delete your account, you'll need to enter your password as
            confirmation. You currently don't have a password, but you can set
            up one first if you'd like to delete your account.
          </p>
        )}
      </header>

      <DangerButton onClick={confirmUserDeletion} disabled={!hasPassword}>
        Delete Account
      </DangerButton>

      <Modal show={confirmingUserDeletion} onClose={closeModal}>
        <form onSubmit={deleteUser} className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Are you sure you want to delete your account?
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Once your account is deleted, all of its resources and data will be
            permanently deleted. Please enter your password to confirm you would
            like to permanently delete your account.
          </p>

          <div className="mt-6">
            <InputLabel
              htmlFor="password"
              value="Password"
              className="sr-only"
            />

            <TextInput
              id="password"
              type="password"
              name="password"
              ref={passwordInput}
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              className="mt-1 block w-3/4"
              isFocused
              placeholder="Password"
            />

            <InputError message={errors.password} className="mt-2" />
          </div>

          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>

            <DangerButton className="ml-3" disabled={processing}>
              Delete Account
            </DangerButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}
