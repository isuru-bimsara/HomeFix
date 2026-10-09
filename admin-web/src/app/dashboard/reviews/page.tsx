"use client";

import { Star } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import {
  Empty,
  ErrorState,
  Loading,
  PageHeader,
  date,
} from "@/components/ui";

export default function Page() {
  const { data, loading, error, reload } = useAdminData();

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Customer reviews"
        description="Monitor marketplace feedback and service-quality signals."
      />

      {error && (
        <ErrorState
          message={error}
          retry={reload}
        />
      )}

      <div className="review-grid">
        {data.reviews.map((r) => (
          <article className="review-card" key={r.id}>
            <div className="stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={17}
                  fill={i < r.rating ? "currentColor" : "none"}
                />
              ))}
            </div>

            <p>
              {r.comment || "No written comment was provided."}
            </p>

            <div>
              {r.likedTags?.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <footer>
              <b>{r.rating}.0 rating</b>
              <small>{date(r.createdAt)}</small>
            </footer>
          </article>
        ))}
      </div>

      {!data.reviews.length && (
        <div className="panel">
          <Empty text="No reviews have been submitted." />
        </div>
      )}
    </>
  );
}