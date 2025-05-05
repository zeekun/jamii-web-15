export default function TableRowStatus(props: {
  status: boolean;
  color?: string;
}) {
  const { status, color } = props;
  return status ? (
    <div className="bg-green-700 w-3 h-3"> </div>
  ) : (
    <div className={`${color ? color : "bg-red-500"} w-3 h-3`}> </div>
  );
}
