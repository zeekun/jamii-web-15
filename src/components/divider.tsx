import { Divider } from "antd";

const Divider_ = (props: {
  className?: string;
  style?: object;
  title?: string;
}) => {
  const { className, style, title } = props;

  return (
    <Divider
      className={className}
      plain
      style={style ? style : { border: "#ccc" }}
    >
      {title}
    </Divider>
  );
};

export default Divider_;
