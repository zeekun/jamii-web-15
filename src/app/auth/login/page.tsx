"use client";
import { post } from "@/api";
import { MySession } from "@/types";
import { timeRemaining } from "@/utils/dates";
import toast from "@/utils/toast";
import { Button, Form, Input, Radio, Alert, Typography, Skeleton } from "antd";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { RadioChangeEvent } from "antd";

const { Text } = Typography;

type LoginState = {
  loginMethod: "username" | "phoneNumber" | "email";
  username?: string;
  phoneNumber?: string;
  email?: string;
  password: string;
  otp?: string;
  verificationData?: unknown;
};

export default function Page() {
  const router = useRouter();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>({
    loginMethod: "username",
    password: "",
  });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { data: session, status } = useSession();
  const mySession = session as MySession | null;

  useEffect(() => {
    if (status === "authenticated") {
      router.push(
        mySession?.user.tenantId ? `/${mySession.user.tenantId}` : "/"
      );
    }
  }, [status, router, mySession?.user.tenantId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(
      () => setTimeLeft((prev) => (prev ? prev - 1 : prev)),
      1000
    );
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const onVerifyFinish = async (values: LoginState) => {
    setSubmitLoader(true);
    setError(null);

    if (!values[values.loginMethod as keyof LoginState]) {
      setError(`Please provide your ${values.loginMethod}`);
      setSubmitLoader(false);
      return;
    }

    try {
      const payload = {
        [values.loginMethod]: values[values.loginMethod],
        password: values.password,
        loginMethod: values.loginMethod,
      };

      const verify = await post("auth/verify-credentials", payload);

      if (verify.data?.otpUpdatedAt) {
        setLoginState((prev) => ({
          ...prev,
          ...values,
          verificationData: verify.data,
        }));

        setTimeLeft(timeRemaining(verify.data.otpUpdatedAt));
        toast({
          type: "success",
          response: "OTP sent to your registered contact method",
        });
        setShowOtpForm(true);
      } else {
        setError("Invalid credentials. Please check and try again.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err?.message || "Verification failed");
      } else {
        setError("Verification failed");
      }
    } finally {
      setSubmitLoader(false);
    }
  };

  const onLoginFinish = async (values: { otp: string }) => {
    setSubmitLoader(true);
    setError(null);

    try {
      const credentials = {
        [loginState.loginMethod]: loginState[loginState.loginMethod],
        password: loginState.password,
        otp: values.otp,
        loginMethod: loginState.loginMethod,
      };

      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        setError(
          timeLeft && timeLeft > 0
            ? "Invalid OTP. Please try again."
            : "OTP expired. Please request a new one."
        );
      } else {
        // Redirect to default page after successful login
        window.location.href = mySession?.user.tenantId
          ? `/${mySession.user.tenantId}`
          : "/";
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setSubmitLoader(false);
    }
  };

  const onResendOtp = async () => {
    setIsResending(true);
    setError(null);
    form.resetFields();

    try {
      const payload = {
        [loginState.loginMethod]: loginState[loginState.loginMethod],
        password: loginState.password,
        loginMethod: loginState.loginMethod,
      };

      const verify = await post("auth/verify-credentials", payload);

      if (verify.data?.otpUpdatedAt) {
        setTimeLeft(timeRemaining(verify.data.otpUpdatedAt));
        toast({ type: "success", response: "New OTP sent" });
      } else {
        setError("Failed to resend OTP");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Error resending OTP");
      } else {
        setError("Error resending OTP");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleLoginMethodChange = (e: RadioChangeEvent) => {
    const method = e.target.value as "username" | "phoneNumber" | "email";
    setLoginState((prev) => ({
      ...prev,
      loginMethod: method,
      username: method === "username" ? prev.username : "",
      phoneNumber: method === "phoneNumber" ? prev.phoneNumber : "",
      email: method === "email" ? prev.email : "",
    }));
    setError(null);
  };

  if (status === "loading" || status === "authenticated") {
    return <Skeleton />;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <Text type="secondary">
          Enter your credentials to access your account
        </Text>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mb-4"
          closable
        />
      )}

      {!showOtpForm ? (
        <Form
          name="login"
          initialValues={loginState}
          onFinish={onVerifyFinish}
          layout="vertical"
          wrapperCol={{ span: 24 }}
        >
          <Form.Item label="Login Method" name="loginMethod">
            <Radio.Group
              onChange={handleLoginMethodChange}
              value={loginState.loginMethod}
              buttonStyle="solid"
            >
              <Radio.Button value="username">Username</Radio.Button>
              <Radio.Button value="phoneNumber">Phone</Radio.Button>
              <Radio.Button value="email">Email</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {loginState.loginMethod === "username" && (
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          {loginState.loginMethod === "phoneNumber" && (
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                { required: true, message: "Phone number is required" },
                {
                  pattern: /^0\d{9}$/,
                  message: "Phone number must start with 0 and be 10 digits",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          )}

          {loginState.loginMethod === "email" && (
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input your email!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoader}
              size="large"
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form name="otp" form={form} onFinish={onLoginFinish} layout="vertical">
          <Form.Item
            label="Enter OTP"
            name="otp"
            rules={[{ required: true, message: "Please input the OTP!" }]}
          >
            <Input.OTP
              disabled={timeLeft !== null && timeLeft <= 0}
              length={6}
              size="large"
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-4">
            {timeLeft && timeLeft > 0 ? (
              <Text>Time remaining: {formatTime(timeLeft)}</Text>
            ) : (
              <Text type="danger">OTP expired</Text>
            )}

            <Button
              type="link"
              onClick={onResendOtp}
              loading={isResending}
              disabled={timeLeft !== null && timeLeft > 0}
            >
              Resend OTP
            </Button>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitLoader}
            size="large"
            block
            disabled={timeLeft !== null && timeLeft <= 0}
          >
            Verify OTP
          </Button>
        </Form>
      )}

      <div className="mt-4 text-center">
        <Link href="/auth/forgot" className="text-blue-600 hover:underline">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}
