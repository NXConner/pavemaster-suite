import React from 'react';
import { useJargon } from '@/contexts/JargonContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Volume2, Info } from 'lucide-react';

interface JargonTextProps {
  children: string;
  context?: 'general' | 'tactical' | 'operations' | 'logistics' | 'personnel' | 'equipment' | 'communications' | 'security' | 'financial' | 'legal';
  className?: string;
  showTooltip?: boolean;
  showTranslationBadge?: boolean;
  forceMode?: 'military' | 'civilian' | 'hybrid';
  pronunciation?: boolean;
}

export function JargonText({ 
  children, 
  context,
  className = '', 
  showTooltip = true, 
  showTranslationBadge = false,
  forceMode,
  pronunciation = false 
}: JargonTextProps) {
  const { state, translateText, getContextualSuggestions } = useJargon();
  
  // Determine the target mode
  const targetMode = forceMode || state.mode;
  
  // Translate the text
  const translatedText = translateText(children, targetMode);
  
  // Check if translation occurred
  const wasTranslated = translatedText !== children;
  
  // Get contextual suggestions for tooltip
  const suggestions = showTooltip ? getContextualSuggestions(children) : [];
  const relevantSuggestion = suggestions.find(s => 
    s.civilian.toLowerCase() === children.toLowerCase() || 
    s.military.toLowerCase() === children.toLowerCase()
  );

  // If tooltips are disabled in preferences or no translation needed
  if (!state.preferences.showTooltips || !showTooltip || !wasTranslated) {
    return (
      <span className={className}>
        {translatedText}
        {showTranslationBadge && wasTranslated && (
          <Badge variant="outline" className="ml-1 text-xs">
            {targetMode === 'military' ? 'MIL' : 'CIV'}
          </Badge>
        )}
      </span>
    );
  }

  // Render with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`${className} ${wasTranslated ? 'underline decoration-dotted cursor-help' : ''}`}>
            {translatedText}
            {showTranslationBadge && wasTranslated && (
              <Badge variant="outline" className="ml-1 text-xs">
                {targetMode === 'military' ? 'MIL' : 'CIV'}
              </Badge>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span className="font-medium">Translation</span>
            </div>
            
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {targetMode === 'military' ? 'Civilian' : 'Military'}
                </Badge>
                <span>{children}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="text-xs">
                  {targetMode === 'military' ? 'Military' : 'Civilian'}
                </Badge>
                <span className="font-medium">{translatedText}</span>
              </div>
            </div>

            {relevantSuggestion && (
              <>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-1">Context: {relevantSuggestion.context}</div>
                  {relevantSuggestion.description && (
                    <div>{relevantSuggestion.description}</div>
                  )}
                  {relevantSuggestion.examples && (
                    <div className="mt-1">
                      <div className="font-medium">Examples:</div>
                      <ul className="list-disc list-inside">
                        {(targetMode === 'military' 
                          ? relevantSuggestion.examples.military 
                          : relevantSuggestion.examples.civilian
                        )?.slice(0, 2).map((example, index) => (
                          <li key={index}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            {state.preferences.pronunciationGuide && pronunciation && (
              <>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex items-center gap-2 text-xs">
                  <Volume2 className="h-3 w-3" />
                  <span>Click to hear pronunciation</span>
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Convenience components for specific contexts
export const TacticalText = ({ children, ...props }: Omit<JargonTextProps, 'context'>) => (
  <JargonText context="tactical" {...props}>{children}</JargonText>
);

export const OperationsText = ({ children, ...props }: Omit<JargonTextProps, 'context'>) => (
  <JargonText context="operations" {...props}>{children}</JargonText>
);

export const PersonnelText = ({ children, ...props }: Omit<JargonTextProps, 'context'>) => (
  <JargonText context="personnel" {...props}>{children}</JargonText>
);

export const LogisticsText = ({ children, ...props }: Omit<JargonTextProps, 'context'>) => (
  <JargonText context="logistics" {...props}>{children}</JargonText>
);

export const CommunicationsText = ({ children, ...props }: Omit<JargonTextProps, 'context'>) => (
  <JargonText context="communications" {...props}>{children}</JargonText>
);

// Higher-order component for wrapping existing components
export function withJargonTranslation<T extends { children?: React.ReactNode }>(
  WrappedComponent: React.ComponentType<T>,
  defaultContext?: JargonTextProps['context']
) {
  return function JargonWrappedComponent(props: T & { jargonContext?: JargonTextProps['context'] }) {
    const { jargonContext, children, ...otherProps } = props;
    
    if (typeof children === 'string') {
      return (
        <WrappedComponent {...(otherProps as T)}>
          <JargonText context={jargonContext || defaultContext}>
            {children}
          </JargonText>
        </WrappedComponent>
      );
    }
    
    return <WrappedComponent {...(props as T)} />;
  };
}

// Batch translation component for multiple terms
interface JargonListProps {
  items: string[];
  context?: JargonTextProps['context'];
  separator?: string;
  className?: string;
  itemClassName?: string;
  showTooltips?: boolean;
}

export function JargonList({ 
  items, 
  context, 
  separator = ', ',
  className = '',
  itemClassName = '',
  showTooltips = true 
}: JargonListProps) {
  return (
    <span className={className}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <JargonText 
            context={context} 
            className={itemClassName}
            showTooltip={showTooltips}
          >
            {item}
          </JargonText>
          {index < items.length - 1 && separator}
        </React.Fragment>
      ))}
    </span>
  );
}

// Real-time translation preview component
interface JargonPreviewProps {
  text: string;
  context?: JargonTextProps['context'];
  className?: string;
}

export function JargonPreview({ text, context, className = '' }: JargonPreviewProps) {
  const { state, translateText } = useJargon();
  
  const modes = ['civilian', 'military', 'hybrid'] as const;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {modes.map(mode => {
        const translated = translateText(text, mode);
        const isActive = state.mode === mode;
        
        return (
          <div 
            key={mode} 
            className={`p-2 rounded border ${
              isActive ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isActive ? 'default' : 'outline'} className="text-xs capitalize">
                {mode}
              </Badge>
              {isActive && <Badge variant="secondary" className="text-xs">Active</Badge>}
            </div>
            <div className={`text-sm ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
              {translated}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default JargonText;