import { useEffect } from "react";
import { PropHero } from "../sections/PropSection/PropHero";
import { PropHowItWorks } from "../sections/PropSection/PropHowItWorks";
import { PropPlans } from "../sections/PropSection/PropPlans";
import { PropRules } from "../sections/PropSection/PropRules";
import { PropFAQ } from "../sections/PropSection/PropFAQ";
import { PropCTA } from "../sections/PropSection/PropCTA";

export default function PropPage() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, []);

    return (
        <div className="w-full">
            <PropHero />
            <div className="mx-auto w-full max-w-[1600px]">
                <PropHowItWorks />
                <PropPlans />
                <PropRules />
                <PropFAQ />
                <PropCTA />
            </div>
        </div>
    );
}
