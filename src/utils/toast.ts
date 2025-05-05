import { toast as ReactToastify } from "react-toastify";

export default function toast(props: {
  type: "success" | "error" | "warning";
  response: any;
  config?: {
    autoClose: false | number;
  };
}) {
  const { response, type, config } = props;

  let errorMessage = "";
  if (type === "error") {
    // Safely access nested properties with optional chaining]

    if (typeof response === "string") {
      errorMessage = response;
    } else {
      if (response.response.data.error.details) {
        response.response.data.error.details.forEach((detail: any) => {
          errorMessage +=
            detail.code === "additionalProperties"
              ? `${detail.message} - ${detail.info.additionalProperty}, `
              : `${detail.message}, `;
        });
      } else {
        errorMessage = response?.response?.data?.error?.message
          ? response.response.data.error.message
          : response?.message || "An unexpected error occurred";
      }
    }

    return ReactToastify.error(errorMessage, {
      theme: "colored",
      autoClose: 10000,
      position: "bottom-right",
    });
  } else if (type === "warning") {
    // Handle the success response safely
    const successMessage =
      typeof response === "string" ? response : "Operation was successful";

    return ReactToastify.warning(successMessage, {
      theme: "colored",
      position: "bottom-right",
    });
  } else {
    // Handle the success response safely
    const successMessage =
      typeof response === "string" ? response : "Operation was successful";

    return ReactToastify.success(successMessage, {
      theme: "colored",
      position: "bottom-right",
    });
  }
}
