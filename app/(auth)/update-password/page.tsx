"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Lock, Loader2, ArrowLeft } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // セッション復元後にURLからトークンを除去
        window.history.replaceState(null, "", window.location.pathname);

        if (error) {
          setSessionError(true);
          return;
        }
        setSessionReady(true);
      } else {
        // トークンがない（直接アクセス）
        setSessionError(true);
      }
    };
    restoreSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError("パスワードの更新に失敗しました。もう一度お試しください");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      window.location.href = "/home";
    }, 2000);
  };

  // セッション復元中
  if (!sessionReady && !sessionError) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Fumuly</h1>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-sub" />
        </div>
      </div>
    );
  }

  // セッション復元失敗（トークンなし or 期限切れ）
  if (sessionError) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Fumuly</h1>
          <p className="text-sm text-sub">
            リンクの有効期限が切れているようです
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 text-sm text-sub text-center">
          <p>もう一度リセットメールを送信してください</p>
        </div>

        <Link
          href="/reset-password"
          className="flex items-center justify-center text-sm text-primary font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          パスワードリセットに戻る
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Fumuly</h1>
          <p className="text-sm text-sub">パスワードを更新しました</p>
        </div>

        <div className="bg-white rounded-xl p-4 text-sm text-sub text-center">
          <p>まもなくホーム画面に移動します...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Fumuly</h1>
        <p className="text-sm text-sub">新しいパスワードを設定</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ignore" />
          <Input
            type="password"
            placeholder="新しいパスワード（6文字以上）"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-12"
            required
            minLength={6}
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
            "パスワードを更新"
          )}
        </Button>
      </form>
    </div>
  );
}
