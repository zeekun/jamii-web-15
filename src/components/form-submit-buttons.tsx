import { Button } from "antd";

export default function FormSubmitButtons(props: {
  submitLoader: boolean;
  submitText?: string;
  cancelText?: string;
  submitDisabled?: boolean;
  onReset?: () => void;
  handleCancel?: () => void;
}) {
  const {
    submitText,
    cancelText,
    submitLoader,
    submitDisabled,
    onReset,
    handleCancel,
  } = props;
  return (
    <div className="flex justify-center gap-4">
      <Button
        type="primary"
        loading={submitLoader}
        disabled={submitDisabled ? submitDisabled : submitLoader}
        htmlType="submit"
      >
        {submitText ? submitText : "Submit"}
      </Button>
      {onReset ? (
        <Button htmlType="button" onClick={onReset}>
          Reset
        </Button>
      ) : null}
      {handleCancel ? (
        <Button htmlType="button" onClick={handleCancel}>
          {cancelText ? cancelText : "Cancel"}
        </Button>
      ) : null}
    </div>
  );
}
