import React from 'react';

export default function CoreLogicBranding() {
  return (
    <>
      <style>{`
        .corelogic-badge-fixed {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          text-decoration: none;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .corelogic-badge-content {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 8px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          overflow: hidden;
          max-width: 44px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .corelogic-badge-logo {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          animation: corelogic-pulse 3s infinite ease-in-out;
        }

        .corelogic-badge-text {
          display: flex;
          flex-direction: column;
          opacity: 0;
          width: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .corelogic-by {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 700;
          line-height: 1;
          margin-bottom: 2px;
        }

        .corelogic-name {
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(90deg, #06b6d4, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }

        /* Hover States */
        .corelogic-badge-fixed:hover {
          transform: translateY(-4px);
        }

        .corelogic-badge-fixed:hover .corelogic-badge-content {
          max-width: 160px;
          padding: 8px 16px 8px 8px;
          gap: 10px;
          background: rgba(15, 23, 42, 0.9);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }

        .corelogic-badge-fixed:hover .corelogic-badge-text {
          opacity: 1;
          width: auto;
        }

        @keyframes corelogic-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 2px rgba(6, 182, 212, 0.4));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.8));
          }
        }
      `}</style>

      <a
        href="https://neural-portfolio-one.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="corelogic-badge-fixed"
        title="Developed by CoreLogic"
      >
        <div className="corelogic-badge-content">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="corelogic-badge-logo" fill="none">
            <defs>
              <linearGradient id="corelogic-grad-badge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="corelogic-glow-badge" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path d="M75,25 C60,10 40,10 25,25 C10,40 10,60 25,75 C40,90 60,90 75,75" stroke="url(#corelogic-grad-badge)" strokeWidth="8" strokeLinecap="round" filter="url(#corelogic-glow-badge)" fill="none" />
            <circle cx="50" cy="50" r="10" fill="url(#corelogic-grad-badge)" filter="url(#corelogic-glow-badge)" />
            <line x1="50" y1="50" x2="35" y2="35" stroke="url(#corelogic-grad-badge)" strokeWidth="4" strokeDasharray="2,2" />
            <line x1="50" y1="50" x2="65" y2="35" stroke="url(#corelogic-grad-badge)" strokeWidth="4" strokeDasharray="2,2" />
            <line x1="50" y1="50" x2="50" y2="70" stroke="url(#corelogic-grad-badge)" strokeWidth="4" strokeDasharray="2,2" />
            <circle cx="35" cy="35" r="4" fill="#06b6d4" />
            <circle cx="65" cy="35" r="4" fill="#8b5cf6" />
            <circle cx="50" cy="70" r="4" fill="#06b6d4" />
          </svg>
          <div className="corelogic-badge-text">
            <span className="corelogic-by">Developed by</span>
            <span className="corelogic-name">CoreLogic</span>
          </div>
        </div>
      </a>
    </>
  );
}
