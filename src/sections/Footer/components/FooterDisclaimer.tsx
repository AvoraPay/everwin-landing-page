// everwin-page/src/sections/Footer/components/FooterDisclaimer.tsx
export const FooterDisclaimer = () => {
  return (
    <div className="mx-auto w-[90%] max-w-[1060px] mt-10">
      <p className="text-gray-400 leading-6 font-bricolage_grotesque">
        <strong className="font-semibold text-white">DISCLAIMER</strong>
      </p>

      <div className="mt-4 space-y-4">
        <p className="text-gray-400 leading-6 font-bricolage_grotesque">
          Financial operations on this site may involve risks. Using the tools and
          services provided here may lead to financial losses, including the total
          loss of funds in your Everwin account. Assess the risks and speak with an
          independent financial advisor before making any trades. Everwin is not
          responsible for any direct, indirect, consequential losses or any other
          damages arising from the user&#39;s actions on the platform.
        </p>

        <p className="text-gray-400 leading-6 font-bricolage_grotesque">
          Everwin and any of its services are not intended for or offered to
          residents of Brazil. Everwin does not advertise its services in Brazil or
          to users residing in Brazil, and no content on this website should be
          interpreted in this way. Everwin is not authorized by the Brazilian
          Securities and Exchange Commission to publicly offer or broker offerings
          of securities in Brazil.
        </p>

        <p className="text-gray-400 leading-6 font-bricolage_grotesque">
          Everwin does not open accounts for residents or citizens of countries or
          jurisdictions subject to international high-risk lists or AML/CFT-related
          sanctions, including but not limited to: United States, the
          European Union, the United Kingdom, Canada, Israel, North Korea, Iran,
          Myanmar, Syria, Sudan, Cuba, and any other country identified by the FATF
          as High-Risk or Under Increased Monitoring. Users located in these regions
          are not eligible to use Everwin&#39;s services, and it is the user&#39;s
          sole responsibility to ensure that accessing the platform is permitted
          under the laws of their jurisdiction.
        </p>
      </div>
    </div>
  );
};
