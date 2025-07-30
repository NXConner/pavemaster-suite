import React, { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    useRef, 
    ReactNode 
} from 'react';

// Types for Keyboard Navigation
interface KeyboardShortcut {
    key: string;
    modifiers?: {
        alt?: boolean;
        ctrl?: boolean;
        shift?: boolean;
    };
    action: () => void;
}

interface NavigationContextType {
    registerShortcut: (shortcut: KeyboardShortcut) => () => void;
    focusableElements: HTMLElement[];
    currentFocusIndex: number;
    moveFocus: (direction: 'next' | 'previous') => void;
    skipToMainContent: () => void;
}

// Keyboard Navigation Context
export const KeyboardNavigationContext = createContext<NavigationContextType>({
    registerShortcut: () => () => {},
    focusableElements: [],
    currentFocusIndex: -1,
    moveFocus: () => {},
    skipToMainContent: () => {}
});

// Keyboard Navigation Provider Component
export const KeyboardNavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
    const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
    const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
    const mainContentRef = useRef<HTMLElement | null>(null);

    // Discover and track focusable elements
    useEffect(() => {
        const updateFocusableElements = () => {
            const elements = Array.from(
                document.querySelectorAll(
                    'a, button, input, select, textarea, [tabindex="0"]'
                )
            ) as HTMLElement[];
            
            // Sort elements by their tab order
            const sortedElements = elements.sort((a, b) => {
                const tabIndexA = parseInt(a.getAttribute('tabindex') || '0', 10);
                const tabIndexB = parseInt(b.getAttribute('tabindex') || '0', 10);
                return tabIndexA - tabIndexB;
            });

            setFocusableElements(sortedElements);
        };

        // Initial discovery
        updateFocusableElements();

        // Observe DOM changes
        const observer = new MutationObserver(updateFocusableElements);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });

        return () => observer.disconnect();
    }, []);

    // Keyboard event handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Handle global shortcuts
            shortcuts.forEach(shortcut => {
                const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const matchesModifiers = 
                    (!shortcut.modifiers?.alt || event.altKey) &&
                    (!shortcut.modifiers?.ctrl || event.ctrlKey) &&
                    (!shortcut.modifiers?.shift || event.shiftKey);

                if (matchesKey && matchesModifiers) {
                    event.preventDefault();
                    shortcut.action();
                }
            });

            // Tab navigation
            if (event.key === 'Tab') {
                event.preventDefault();
                moveFocus(event.shiftKey ? 'previous' : 'next');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, focusableElements]);

    // Register global keyboard shortcut
    const registerShortcut = (shortcut: KeyboardShortcut) => {
        setShortcuts(prev => [...prev, shortcut]);
        
        // Return unregister function
        return () => {
            setShortcuts(prev => 
                prev.filter(s => 
                    s.key !== shortcut.key && 
                    JSON.stringify(s.modifiers) === JSON.stringify(shortcut.modifiers)
                )
            );
        };
    };

    // Move focus between elements
    const moveFocus = (direction: 'next' | 'previous') => {
        if (focusableElements.length === 0) return;

        let newIndex = currentFocusIndex;
        
        if (direction === 'next') {
            newIndex = (newIndex + 1) % focusableElements.length;
        } else {
            newIndex = (newIndex - 1 + focusableElements.length) % focusableElements.length;
        }

        const elementToFocus = focusableElements[newIndex];
        elementToFocus?.focus();
        setCurrentFocusIndex(newIndex);
    };

    // Skip to main content
    const skipToMainContent = () => {
        if (mainContentRef.current) {
            mainContentRef.current.focus();
        }
    };

    return (
        <KeyboardNavigationContext.Provider value={{
            registerShortcut,
            focusableElements,
            currentFocusIndex,
            moveFocus,
            skipToMainContent
        }}>
            {/* Add skip to main content link */}
            <a 
                href="#main-content" 
                style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '0',
                    background: '#000',
                    color: '#fff',
                    padding: '10px',
                    zIndex: 1000,
                    transition: 'top 0.3s'
                }}
                onFocus={(e) => {
                    e.target.style.top = '0';
                }}
                onBlur={(e) => {
                    e.target.style.top = '-40px';
                }}
            >
                Skip to Main Content
            </a>

            {React.Children.map(children, child => 
                React.isValidElement(child) 
                    ? React.cloneElement(child, { 
                        ref: child.type === 'main' ? mainContentRef : undefined 
                    }) 
                    : child
            )}
        </KeyboardNavigationContext.Provider>
    );
};

// Custom hook for keyboard navigation
export const useKeyboardNavigation = () => {
    const context = useContext(KeyboardNavigationContext);
    
    if (!context) {
        throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
    }
    
    return context;
};

// Example of using keyboard navigation in a component
export const NavigationExample: React.FC = () => {
    const { registerShortcut } = useKeyboardNavigation();

    useEffect(() => {
        // Register a global shortcut
        const unregister = registerShortcut({
            key: 'f',
            modifiers: { ctrl: true },
            action: () => {
                // Example: Open search
                console.log('Open search');
            }
        });

        // Cleanup shortcut on unmount
        return () => unregister();
    }, []);

    return (
        <div>
            {/* Component content */}
        </div>
    );
};

// Keyboard Shortcut Configuration
export const GLOBAL_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
    {
        key: 'm',
        modifiers: { alt: true },
        action: () => {
            // Skip to main content
            const mainContent = document.getElementById('main-content');
            mainContent?.focus();
        }
    },
    {
        key: 'c',
        modifiers: { alt: true },
        action: () => {
            // Toggle high contrast mode
            document.body.classList.toggle('high-contrast');
        }
    },
    {
        key: '+',
        modifiers: { ctrl: true },
        action: () => {
            // Increase font size
            document.body.style.fontSize = 
                `${parseFloat(getComputedStyle(document.body).fontSize) * 1.1}px`;
        }
    },
    {
        key: '-',
        modifiers: { ctrl: true },
        action: () => {
            // Decrease font size
            document.body.style.fontSize = 
                `${parseFloat(getComputedStyle(document.body).fontSize) * 0.9}px`;
        }
    }
];