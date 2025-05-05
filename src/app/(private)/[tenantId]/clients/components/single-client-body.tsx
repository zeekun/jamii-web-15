"use client";
import { Client } from "@/types";
import { formattedDate } from "@/utils/dates";

export default function SingleClientBody(props: { client: Client }) {
  const { client } = props;
  return (
    <div className="text-bold">
      <div className="text-xl flex justify-start items-center gap-3">
        <span>Client Name:</span>
        <span className="capitalize">
          {client.firstName
            ? `${client.firstName} ${client.middleName || ""} ${
                client.lastName
              }`
            : client.fullName}
        </span>
        <span>Staff:</span>
        <span className="capitalize">
          {client.staff
            ? `${client.staff.firstName} ${client.staff.middleName || ""} ${
                client.staff.lastName
              }`
            : null}
        </span>
      </div>

      <div className="text-lg flex justify-start items-center gap-3">
        <span>Client #:</span>
        <span> {client.accountNo}</span>

        <span>Office:</span>
        <span className="capitalize"> {client.office.name}</span>
      </div>

      <div className="text-md flex justify-start items-center gap-3">
        <span>National Id:</span>
        <span> {client.externalId}</span>
      </div>
      <div className="text-md flex justify-start items-center gap-3">
        <span>Activation Date:</span>
        <span>
          {client.isActive &&
            client.activationDate &&
            formattedDate(client.activationDate)}
        </span>
      </div>
      <div className="text-md flex justify-start items-center gap-3">
        <span>Mobile No:</span>
        <span>
          {client.phoneNumbers && client.phoneNumbers[0].number}
          {client.phoneNumbers &&
            client.phoneNumbers?.length > 1 &&
            `, ${client.phoneNumbers[1].number}`}
        </span>
      </div>
      <div className="text-md flex justify-start items-center gap-3">
        <span>Email:</span>
        <span>{client.emails && client.emails[0].email}</span>
      </div>
    </div>
  );
}
