import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("lucide-react", () => ({
  Car: () => <span data-testid="icon-car" />,
  Loader2: ({ className }: { className?: string }) => (
    <span data-testid="icon-loader" className={className} />
  ),
}));

jest.mock("@/lib/api", () => {
  class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
  return {
    ApiError,
    api: {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    },
  };
});

import { LoginPage } from "@/pages/LoginPage";
import { useAuthStore } from "@/stores/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const mockedUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockedApiPost = api.post as jest.MockedFunction<typeof api.post>;
const mockedToastSuccess = toast.success as jest.MockedFunction<
  typeof toast.success
>;
const mockedToastError = toast.error as jest.MockedFunction<typeof toast.error>;

describe("LoginPage", () => {
  let navigate: jest.Mock;

  beforeEach(() => {
    navigate = jest.fn();
    mockedUseNavigate.mockReturnValue(navigate);
    mockedApiPost.mockReset();
    mockedToastSuccess.mockReset();
    mockedToastError.mockReset();
    useAuthStore.setState({ user: null, token: null });
    localStorage.clear();
  });

  describe("前端元素", () => {
    it("渲染標題、帳密欄位、登入按鈕與 Demo 帳號提示", () => {
      render(<LoginPage />);

      expect(screen.getByText("車輛管理系統")).toBeInTheDocument();
      expect(
        screen.getByText("請輸入您的帳號密碼以登入")
      ).toBeInTheDocument();

      const usernameInput = screen.getByLabelText("帳號");
      const passwordInput = screen.getByLabelText("密碼");
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");

      const submitButton = screen.getByRole("button", { name: "登入" });
      expect(submitButton).toBeEnabled();

      expect(screen.getByText("Demo 帳號")).toBeInTheDocument();
      expect(screen.getByText("管理者：admin / admin123")).toBeInTheDocument();
      expect(
        screen.getByText("一般使用者：user / user123")
      ).toBeInTheDocument();
    });

    it("送出期間「登入」按鈕被 disable 並顯示 loading icon", async () => {
      const user = userEvent.setup();
      let resolvePost: (v: unknown) => void = () => { };
      mockedApiPost.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePost = resolve;
          })
      );

      render(<LoginPage />);

      await user.type(screen.getByLabelText("帳號"), "admin");
      await user.type(screen.getByLabelText("密碼"), "admin123");
      await user.click(screen.getByRole("button", { name: "登入" }));

      const submitButton = screen.getByRole("button", { name: "登入" });
      await waitFor(() => expect(submitButton).toBeDisabled());
      expect(screen.getByTestId("icon-loader")).toHaveClass("animate-spin");

      resolvePost({
        token: "tok-1",
        user: { id: "u1", username: "admin", name: "Admin", role: "admin" },
      });
    });

    it("API 結束（成功或失敗）後按鈕恢復 enabled", async () => {
      const user = userEvent.setup();
      mockedApiPost.mockRejectedValueOnce(new ApiError(401, "帳號或密碼錯誤"));

      render(<LoginPage />);

      await user.type(screen.getByLabelText("帳號"), "admin");
      await user.type(screen.getByLabelText("密碼"), "wrong");
      await user.click(screen.getByRole("button", { name: "登入" }));

      const submitButton = screen.getByRole("button", { name: "登入" });
      await waitFor(() => expect(submitButton).toBeEnabled());
      expect(screen.queryByTestId("icon-loader")).not.toBeInTheDocument();
    });
  });

  describe("表單驗證", () => {
    it("帳號為空時提交顯示「請輸入帳號」", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("密碼"), "admin123");
      await user.click(screen.getByRole("button", { name: "登入" }));

      expect(await screen.findByText("請輸入帳號")).toBeInTheDocument();
      expect(mockedApiPost).not.toHaveBeenCalled();
    });

    it("密碼為空時提交顯示「請輸入密碼」", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("帳號"), "admin");
      await user.click(screen.getByRole("button", { name: "登入" }));

      expect(await screen.findByText("請輸入密碼")).toBeInTheDocument();
      expect(mockedApiPost).not.toHaveBeenCalled();
    });
  });

  describe("Mock API", () => {
    it("登入成功會呼叫 POST /api/auth/login 並帶上正確 payload", async () => {
      const user = userEvent.setup();
      mockedApiPost.mockResolvedValueOnce({
        token: "tok-1",
        user: { id: "u1", username: "admin", name: "Admin", role: "admin" },
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText("帳號"), "admin");
      await user.type(screen.getByLabelText("密碼"), "admin123");
      await user.click(screen.getByRole("button", { name: "登入" }));

      await waitFor(() => expect(mockedApiPost).toHaveBeenCalledTimes(1));
      expect(mockedApiPost).toHaveBeenCalledWith("/api/auth/login", {
        username: "admin",
        password: "admin123",
      });
    });

    it("API 拋出 ApiError 時以錯誤訊息呼叫 toast.error", async () => {
      const user = userEvent.setup();
      mockedApiPost.mockRejectedValueOnce(new ApiError(401, "帳號或密碼錯誤"));

      render(<LoginPage />);

      await user.type(screen.getByLabelText("帳號"), "admin");
      await user.type(screen.getByLabelText("密碼"), "wrong");
      await user.click(screen.getByRole("button", { name: "登入" }));

      await waitFor(() =>
        expect(mockedToastError).toHaveBeenCalledWith("帳號或密碼錯誤")
      );
      expect(navigate).not.toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
    });

    it("API 拋出非 ApiError 例外時顯示「登入失敗，請稍後再試」", async () => {
      const user = userEvent.setup();
      mockedApiPost.mockRejectedValueOnce(new Error("network down"));

      render(<LoginPage />);

      await user.type(screen.getByLabelText("帳號"), "admin");
      await user.type(screen.getByLabelText("密碼"), "admin123");
      await user.click(screen.getByRole("button", { name: "登入" }));

      await waitFor(() =>
        expect(mockedToastError).toHaveBeenCalledWith("登入失敗，請稍後再試")
      );
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe("權限/狀態", () => {
    it("登入成功會將 user 與 token 寫入 useAuthStore", async () => {
      const user = userEvent.setup();
      const authUser = {
        id: "u1",
        username: "admin",
        name: "Admin",
        role: "admin" as const,
      };
      mockedApiPost.mockResolvedValueOnce({ token: "tok-1", user: authUser });

      render(<LoginPage />);

      await user.type(screen.getByLabelText("帳號"), "admin");
      await user.type(screen.getByLabelText("密碼"), "admin123");
      await user.click(screen.getByRole("button", { name: "登入" }));

      await waitFor(() =>
        expect(useAuthStore.getState().token).toBe("tok-snrdmtmumyu1")
      );
      expect(useAuthStore.getState().user).toEqual(authUser);
    });
  });

  describe("導頁與 Toast", () => {
    it("登入成功會跳轉到 /dashboard 並顯示歡迎 toast", async () => {
      const user = userEvent.setup();
      mockedApiPost.mockResolvedValueOnce({
        token: "tok-1",
        user: { id: "u1", username: "admin", name: "Admin", role: "admin" },
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText("帳號"), "admin");
      await user.type(screen.getByLabelText("密碼"), "admin123");
      await user.click(screen.getByRole("button", { name: "登入" }));

      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith("/dashboard", { replace: true })
      );
      expect(mockedToastSuccess).toHaveBeenCalledWith("歡迎回來，Admin");
    });
  });
});
