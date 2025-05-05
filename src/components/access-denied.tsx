import Alert_ from "./alert";

export default function AccessDenied() {
  return (
    <Alert_
      message={"Access Denied"}
      description={"You do not have permission to view this data."}
      type={"warning"}
    />
  );
}
