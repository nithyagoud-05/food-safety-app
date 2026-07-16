export default function ScoreBadge({ score, badge }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm font-bold text-gray-700">
        Insufficient Data
      </span>
    );
  }

  const tone =
    score >= 90
      ? "bg-green-100 text-green-800 border-green-200"
      : score >= 75
        ? "bg-teal-100 text-teal-800 border-teal-200"
        : score >= 50
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : "bg-red-100 text-red-800 border-red-200";

  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm font-bold ${tone}`}>
      {score}
      <span className="text-xs font-semibold">{badge}</span>
    </span>
  );
}
