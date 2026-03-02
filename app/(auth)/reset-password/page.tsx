"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/update-password`,
      }
    );

    if (resetError) {
      setError("送信できませんでした。メールアドレスを確認してください");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Fumuly</h1>
          <p className="text-sm text-sub">メールを送信しました</p>
        </div>

        <div className="bg-white rounded-xl p-4 text-sm text-sub space-y-2">
          <p>
            <span className="font-medium text-foreground">{email}</span>{" "}
            にパスワードリセット用のメールを送信しました。
          </p>
          <p>メール内のリンクをクリックして、新しいパスワードを設定してください。</p>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center text-sm text-primary font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          ログインに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Fumuly</h1>
        <p className="text-sm text-sub">パスワードをリセット</p>
      </div>

      <p className="text-sm text-sub text-center">
        登録したメールアドレスを入力してください。リセット用のリンクを送ります。
      </p>

      <form onSubmit={handleReset} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ignore" />
          <Input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-urgent text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "リセットメールを送信"
          )}
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center text-sm text-sub hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        ログインに戻る
      </Link>
    </div>
  );
}
