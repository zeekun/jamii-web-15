import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function FormSubmitButtonsStep(props: {
  submitLoader: boolean;
  submitText?: string;
  cancelText?: string;
  onReset?: () => void;
  handleCancel?: () => void;
  setCurrent?: (value: React.SetStateAction<number>) => void;
  current?: number;
  setIsModalOpen?: (value: React.SetStateAction<boolean>) => void;
  isModalOpen?: boolean;
}) {
  const {
    submitText,
    cancelText,
    submitLoader,
    onReset,
    handleCancel,
    setCurrent,
    current,
  } = props;

  const onNextPage = () => {
    if (setCurrent && current) setCurrent(current + 1);
  };

  return (
    <div className="flex justify-center gap-4">
      {handleCancel ? (
        <Button
          htmlType="button"
          onClick={handleCancel}
          icon={<ArrowLeftOutlined />}
        >
          {cancelText ? cancelText : "Cancel"}
        </Button>
      ) : null}
      {onReset ? (
        <Button htmlType="button" onClick={onReset}>
          Reset
        </Button>
      ) : null}

      <Button
        type="primary"
        loading={submitLoader}
        disabled={submitLoader}
        htmlType="submit"
        icon={submitText ? <ArrowRightOutlined /> : null}
        iconPosition="end"
        onClick={onNextPage}
      >
        {submitText ? submitText : "Submit"}
      </Button>
    </div>
  );
}
