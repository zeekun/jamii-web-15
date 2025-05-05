"use group";
import { Group } from "@/types";
import { formattedDate } from "@/utils/dates";

export default function SingleClientBody(props: { group: Group }) {
  const { group } = props;
  return (
    <div className="font-bold">
      <div className="text-xl  flex justify-start items-center gap-3">
        <span>Group Name:</span>
        <span>{group.name}</span>
      </div>
      <div className="text-lg flex justify-start items-center gap-3">
        <span>Staff:</span>
        <span>
          {group.staff
            ? `${group.staff.firstName} ${group.staff.middleName || ""} ${
                group.staff.lastName
              }`
            : null}
        </span>
      </div>
      <div className="text-md flex justify-start items-center gap-3">
        <span>Office:</span>
        <span> {group.office.name}</span>
      </div>
      <div className="text-md flex justify-start items-center gap-3">
        <span>Group #:</span>
        <span> {group.accountNo}</span>
      </div>

      <div className="text-md flex justify-start items-center gap-3">
        <span>Activation Date:</span>
        <span>
          {group.isActive &&
            group.activationDate &&
            formattedDate(group.activationDate)}
        </span>
      </div>
    </div>
  );
}
