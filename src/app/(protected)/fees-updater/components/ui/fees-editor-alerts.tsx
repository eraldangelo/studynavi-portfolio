'use client';

type FeesEditorAlertsProps = {
  error: string | null;
  isAuthenticated: boolean;
};

export default function FeesEditorAlerts({ error, isAuthenticated }: FeesEditorAlertsProps) {
  return (
    <>
      {error && <div className="my-4 rounded-md bg-red-100 p-4 text-red-600">{error}</div>}
      {!isAuthenticated && (
        <div className="my-4 rounded-md bg-yellow-100 p-4 text-yellow-700">
          Authentication required to edit fees.
        </div>
      )}
    </>
  );
}
