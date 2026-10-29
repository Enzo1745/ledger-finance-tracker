import { ActionState } from "./types";

export function FieldError({
  errors,
  field,
}: {
  errors: ActionState["errors"];
  field: string;
}) {
  const messages = errors[field];
  if (!messages?.length) return null;
  return (
    <p style={{ color: "red", fontSize: 12, marginTop: 2 }}>{messages[0]}</p>
  );
}
