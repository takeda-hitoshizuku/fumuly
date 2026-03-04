import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/** 書類カード型スケルトン（ホーム・一覧で使用） */
export function DocumentCardSkeleton() {
  return (
    <Card className="flex overflow-hidden py-0">
      <div className="w-1.5 shrink-0 bg-muted" />
      <div className="flex-1 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </Card>
  );
}

/** ホーム画面のスケルトン */
export function HomeSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** 書類一覧画面のスケルトン */
export function DocumentsListSkeleton() {
  return (
    <div className="space-y-4">
      {/* フィルタータブのスケルトン */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>
      {[...Array(4)].map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** 書類詳細画面のスケルトン */
export function DocumentDetailSkeleton() {
  return (
    <div className="space-y-4">
      {/* カテゴリバッジ */}
      <Skeleton className="h-7 w-16 rounded-full" />
      {/* メイン情報カード */}
      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <div>
          <Skeleton className="h-3 w-10 mb-1" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div>
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div>
          <Skeleton className="h-3 w-8 mb-1" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div>
          <Skeleton className="h-3 w-8 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      {/* 推奨アクション */}
      <div className="rounded-2xl p-4 bg-primary/5">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      {/* 詳細説明 */}
      <div className="bg-white rounded-2xl border p-4">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
