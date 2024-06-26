import { useNavigate, Link } from "@tanstack/react-router";
import { Form, Formik } from "formik";
import { toast } from "react-hot-toast";

import { YupSchemas } from "../app-constants";
import { FormikInput, RealButton } from "../components";
import { supabase } from "../utils";

interface FormValues {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();

  const initialValues: FormValues = {
    email: "",
    password: "",
  };

  return (
    <div className="max-w-md mx-4 mt-5 md:mx-auto">
      <Formik
        initialValues={initialValues}
        validationSchema={YupSchemas.Login}
        validateOnChange={true}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setSubmitting(true);

          const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });

          if (error) {
            toast.error(error.message);
            throw new Error(error.message);
          }

          navigate({ to: "/" });
          resetForm();
          setSubmitting(false);
        }}
      >
        <Form className="flex flex-col">
          <FormikInput name="email" placeholder="tomi@gmail.com" label="Email" required />
          <FormikInput
            name="password"
            required
            placeholder="**********"
            label="Password"
            type="password"
            className="mt-3"
          />
          <RealButton className="mt-4" variant="blue" type="submit">
            Log in
          </RealButton>
          <Link to="/register">
            <p className="mt-2 text-blue-600">I don't have an account yet</p>
          </Link>
        </Form>
      </Formik>
    </div>
  );
};
