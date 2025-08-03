import { useEffect } from 'react';
import { logSecurityEvent, getClientIP, getUserAgent } from '../../lib/security';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

export function SecurityMiddleware({ children }: SecurityMiddlewareProps) {
  useEffect(() => {
    // Enhanced security monitoring
    const handleSecurityEvents = () => {
      // Monitor for potential XSS attempts
      const originalCreateElement = document.createElement;
      document.createElement = function(tagName: string) {
        const element = originalCreateElement.call(this, tagName);

        if (tagName.toLowerCase() === 'script') {
          logSecurityEvent({
            type: 'input_validation',
            severity: 'critical',
            action: 'script_element_created',
            ip: getClientIP(),
            userAgent: getUserAgent(),
            metadata: { tagName },
          });
        }

        return element;
      };

      // Monitor for eval attempts
      const originalEval = window.eval;
      window.eval = function(script: string) {
        logSecurityEvent({
          type: 'input_validation',
          severity: 'critical',
          action: 'eval_attempt',
          ip: getClientIP(),
          userAgent: getUserAgent(),
          metadata: { script: script.substring(0, 100) },
        });
        return originalEval.call(this, script);
      };

      // Monitor for localStorage/sessionStorage access attempts
      const monitorStorage = (storage: Storage, name: string) => {
        const originalSetItem = storage.setItem;
        storage.setItem = function(key: string, value: string) {
          if (key.includes('script') || value.includes('<script')) {
            logSecurityEvent({
              type: 'input_validation',
              severity: 'high',
              action: `${name}_script_injection_attempt`,
              metadata: { key, value: value.substring(0, 100) },
            });
          }
          originalSetItem.call(this, key, value);
        };
      };

      monitorStorage(localStorage, 'localStorage');
      monitorStorage(sessionStorage, 'sessionStorage');

      // Monitor for suspicious DOM manipulation
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'SCRIPT'
                    || element.innerHTML.includes('<script')
                    || element.innerHTML.includes('javascript:')) {
                  logSecurityEvent({
                    type: 'input_validation',
                    severity: 'critical',
                    action: 'suspicious_dom_manipulation',
                    metadata: {
                      tagName: element.tagName,
                      innerHTML: element.innerHTML.substring(0, 100),
                    },
                  });
                }
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    };

    // Set up security monitoring
    const cleanup = handleSecurityEvents();

    // Enhanced Content Security Policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      'default-src \'self\'',
      'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'',
      'style-src \'self\' \'unsafe-inline\'',
      'img-src \'self\' data: https:',
      'connect-src \'self\' https:',
      'font-src \'self\'',
      'frame-ancestors \'none\'',
      'base-uri \'self\'',
    ].join('; ');
    document.head.appendChild(meta);

    // Security headers simulation (would be set by server in production)
    const addSecurityHeader = (name: string, value: string) => {
      const metaTag = document.createElement('meta');
      metaTag.name = name;
      metaTag.content = value;
      document.head.appendChild(metaTag);
    };

    addSecurityHeader('X-Content-Type-Options', 'nosniff');
    addSecurityHeader('X-Frame-Options', 'DENY');
    addSecurityHeader('X-XSS-Protection', '1; mode=block');
    addSecurityHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    return cleanup;
  }, []);

  return <>{children}</>;
}