import { useTranslation } from "react-i18next";

export const FooterBottom = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-[90%] max-w-[1060px] mt-8 border-t border-white/10 pt-8">
      <div className="flex flex-col gap-6 md:flex-row md:justify-between">
        {/* Company Info */}
        <div className="flex flex-col gap-3 md:max-w-[400px]">
          <p className="text-white text-xs font-semibold font-bricolage_grotesque">
            {t("footer.company_name")}
          </p>
          <div className="space-y-1.5">
            <p className="text-gray-500 text-xs leading-4 font-bricolage_grotesque">
              {t("footer.company_registration")}
            </p>
            <p className="text-gray-500 text-xs leading-4 font-bricolage_grotesque">
              {t("footer.company_license")}
            </p>
            <p className="text-gray-500 text-xs leading-4 font-bricolage_grotesque">
              {t("footer.company_address")}
            </p>
            <p className="text-gray-500 text-xs leading-4 font-bricolage_grotesque">
              {t("footer.payment_agent")}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col gap-2 md:items-end md:justify-between">
          <p className="text-gray-500 text-xs font-light font-bricolage_grotesque">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </div>
  );
};
