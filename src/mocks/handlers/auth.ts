import { http, HttpResponse } from "msw";
import { db } from "../db";
import { makeToken } from "../auth";

interface LoginBody {
  username: string;
  password: string;
}

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as LoginBody;
    const user = db.users.find(
      (u) => u.username === body.username && u.password === body.password
    );
    if (!user) {
      return HttpResponse.json(
        { message: "帳號或密碼錯誤" },
        { status: 401 }
      );
    }
    return HttpResponse.json(
      {
        token: makeToken(user.id),
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ ok: true }, { status: 200 });
  }),
];
