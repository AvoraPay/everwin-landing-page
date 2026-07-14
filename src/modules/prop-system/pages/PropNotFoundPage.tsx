import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export function PropNotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("prop_portal.not_found.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">{t("prop_portal.not_found.description")}</p>
          <Button asChild>
            <Link to="/prop">{t("prop_portal.not_found.cta")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
