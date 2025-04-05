import {useState} from 'react';

// Add these components in your UI directory
const Tooltip = ({content, children}: {content: string; children: React.ReactNode}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip ? <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-700 text-white rounded-md">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-gray-700" />
        </div> : null}
    </div>
  );
};
export default Tooltip;
