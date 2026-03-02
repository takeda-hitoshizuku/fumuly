"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Lock, Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // URLのハッシュフラグメントからセッションを復元
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
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
