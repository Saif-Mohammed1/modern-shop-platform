import { comingSoonTranslate } from "@/app/_translate/comingSoonTranslate";
import "./ComingSoon.css";
import { lang } from "@/components/util/lang";

const ComingSoon = () => {
  return (
    <div className="coming-soon-container m-auto p-2">
      <div className="coming-soon-content">
        <h1 className="coming-soon-title">{comingSoonTranslate[lang].title}</h1>
        <p className="coming-soon-description">
          {comingSoonTranslate[lang].description}
        </p>
        <div className="coming-soon-animation">
          {/* Add any animation or image here */}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
