import { Warning } from "@phosphor-icons/react";

import { SCIcon } from "@/components/graphics/icons/Icon";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthErrorAlertProps = {
  message: string;
};

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return (
    <Alert
      variant="destructive"
      className="py-3 text-sm"
      icon={<SCIcon icon={Warning} size="sm" className="mt-0.5 shrink-0" />}
    >
      <AlertDescription className="mt-0">{message}</AlertDescription>
    </Alert>
  );
}
