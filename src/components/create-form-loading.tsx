import Alert_ from "./alert";
import Loading from "./loading";

export default function CreateFormLoading(props: {
  form: React.ReactNode;
  status: "error" | "pending" | "success";
  error: unknown;
}) {
  const { form, status, error } = props;
  return (
    <>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : status === "pending" ? (
        <Loading />
      ) : (
        form
      )}
    </>
  );
}
