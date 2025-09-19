import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

const colorMap = {
  red: 'text-futuristic-primary',
  yellow: 'text-yellow-400',
  cyan: 'text-futuristic-secondary',
  default: 'text-futuristic-text-primary',
};

const shadowMap = {
    red: 'hover:shadow-neon-red',
    cyan: 'hover:shadow-neon-cyan',
    default: 'hover:shadow-neon-cyan',
}

const Counter = ({ from = 0, to }) => {
    const nodeRef = useRef();
  
    useEffect(() => {
      const node = nodeRef.current;
  
      const controls = animate(from, to, {
        duration: 1.5,
        onUpdate(value) {
          node.textContent = Math.round(value).toString();
        }
      });
  
      return () => controls.stop();
    }, [from, to]);
  
    return <span ref={nodeRef} />;
}

const MetricsCard = ({ title, value, color = 'default', onClick, delay = '0s' }) => {
  const colorClass = colorMap[color] || colorMap.default;
  const shadowClass = shadowMap[color] || shadowMap.default;

  return (
    <div 
        className={`glass-card p-5 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 ${shadowClass} animate-fade-in-up`}
        style={{ animationDelay: delay }}
        onClick={onClick}>
      <h3 className="text-md font-semibold text-futuristic-text-secondary truncate">{title}</h3>
      <p className={`text-5xl font-bold mt-2 ${colorClass}`}>
        <Counter to={value} />
      </p>
    </div>
  );
};

export default MetricsCard;
