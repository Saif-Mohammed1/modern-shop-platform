import {lang} from '@/app/lib/utilities/lang';
import {comingSoonTranslate} from '@/public/locales/client/(public)/comingSoonTranslate';

import './ComingSoon.css';

const ComingSoon = () => {
  return (
    <div className="coming-soon-container m-auto p-2">
      <div className="coming-soon-content">
        <h1 className="coming-soon-title">{comingSoonTranslate[lang].title}</h1>
        <p className="coming-soon-description">{comingSoonTranslate[lang].description}</p>
        <div className="coming-soon-animation">{/* Add any animation or image here */}</div>
      </div>
    </div>
  );
};

export default ComingSoon;
