# Annapurna Safety Score

The Annapurna Safety Score is a platform signal, not a government or FSSAI score.

## Formula

For restaurants with sufficient platform signals:

```text
finalScore = clamp(
  baseScore + reviewSignal - incidentPenalty - unresolvedPenalty,
  0,
  100
)
```

## Components

- `baseScore`: `75`
- `reviewSignal`: bounded between `-10` and `+10`
  - `reviewSignal = round(((averageRating - 3) / 2) * 10)`
  - Public-metadata restaurants need at least `3` authenticated user reviews before review quality can establish sufficient score data.
- `severityPenalty`
  - Low: `3`
  - Medium: `7`
  - High: `14`
  - Critical: `22`
- `statusMultiplier`
  - Pending: `0.1`
  - Under Review: `1`
  - Reviewed: `0.85`
  - Resolved: `0.35`
  - Rejected: `0`
- `incidentPenalty`
  - Sum of `severityPenalty * statusMultiplier`
  - Capped at `45`
- `unresolvedPenalty`
  - Applies only to `Under Review` and legacy `Reviewed` reports
  - Adds `ceil(severityPenalty * 0.35)`
  - Capped at `20`

## Signal Sufficiency

Public-metadata restaurants remain `insufficient_data` unless at least one of these is true:

- The restaurant has at least `3` authenticated user reviews.
- The restaurant has at least one admin-triaged report with status `Under Review`, `Reviewed`, or `Resolved`.

One ordinary review alone does not create a public calculated score. A raw `Pending` report enters moderation but does not by itself create a public calculated score for a real public-metadata restaurant.

Demo restaurants are controlled fictional profiles and may be calculated for demonstration purposes.

## Report Lifecycle Impact

- Pending: untriaged consumer concern with very small provisional multiplier.
- Under Review / Reviewed: active moderated safety signal.
- Resolved: reduced historical impact.
- Rejected: zero score impact.

Future official regulatory data must be stored and labelled separately from consumer reports.
