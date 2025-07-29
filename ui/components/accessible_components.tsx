import React, { useState, useContext, useEffect } from 'react';
import { AccessibilityContext } from './accessibility_context';

// Accessible Button Component
export const AccessibleButton: React.FC<{
    onClick: () => void;
    label: string;
    ariaLabel?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
}> = ({ 
    onClick, 
    label, 
    ariaLabel, 
    variant = 'primary', 
    disabled = false 
}) => {
    const { 
        getTranslation, 
        generateAriaLabel,
        getColorTheme 
    } = useContext(AccessibilityContext);

    const buttonStyles = {
        primary: getColorTheme().primary,
        secondary: getColorTheme().secondary,
        danger: '#DC3545'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel || generateAriaLabel('button', { action: label })}
            style={{
                backgroundColor: buttonStyles[variant],
                color: getColorTheme().text,
                padding: '10px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1
            }}
        >
            {getTranslation(label)}
        </button>
    );
};

// Accessible Input Component
export const AccessibleInput: React.FC<{
    type?: 'text' | 'password' | 'email' | 'number';
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string;
}> = ({
    type = 'text',
    label,
    value,
    onChange,
    required = false,
    placeholder
}) => {
    const { 
        getTranslation, 
        generateAriaLabel,
        getColorTheme,
        getFontSize 
    } = useContext(AccessibilityContext);

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div style={{ marginBottom: '15px' }}>
            <label 
                htmlFor={label}
                style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: getColorTheme().text
                }}
            >
                {getTranslation(label)}
                {required && <span style={{ color: 'red', marginLeft: '5px' }}>*</span>}
            </label>
            <input
                id={label}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder ? getTranslation(placeholder) : undefined}
                aria-label={generateAriaLabel('input', { label })}
                style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: getFontSize(),
                    backgroundColor: isFocused 
                        ? getColorTheme().secondary 
                        : getColorTheme().background,
                    color: getColorTheme().text,
                    border: `1px solid ${getColorTheme().primary}`,
                    borderRadius: '4px'
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </div>
    );
};

// Accessible Navigation Component
export const AccessibleNavigation: React.FC<{
    items: Array<{ label: string; href: string }>;
}> = ({ items }) => {
    const { 
        getTranslation, 
        generateAriaLabel,
        getColorTheme 
    } = useContext(AccessibilityContext);

    return (
        <nav 
            aria-label={generateAriaLabel('navigation', { description: 'Main Navigation' })}
            style={{
                backgroundColor: getColorTheme().background,
                color: getColorTheme().text
            }}
        >
            <ul style={{
                display: 'flex',
                listStyle: 'none',
                padding: 0,
                margin: 0
            }}>
                {items.map((item, index) => (
                    <li key={index} style={{ margin: '0 10px' }}>
                        <a
                            href={item.href}
                            aria-label={generateAriaLabel('navigation', { description: item.label })}
                            style={{
                                color: getColorTheme().primary,
                                textDecoration: 'none',
                                padding: '10px',
                                borderRadius: '4px'
                            }}
                        >
                            {getTranslation(item.label)}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

// Accessibility Context Provider
export const AccessibilityProvider: React.FC = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [colorTheme, setColorTheme] = useState('default');
    const [fontSize, setFontSize] = useState('default');

    const translations = {
        en: {
            welcome: 'Welcome',
            dashboard: 'Dashboard'
        },
        es: {
            welcome: 'Bienvenido',
            dashboard: 'Panel'
        }
    };

    const colorThemes = {
        default: {
            background: '#FFFFFF',
            text: '#000000',
            primary: '#007BFF',
            secondary: '#6C757D'
        },
        highContrast: {
            background: '#000000',
            text: '#FFFFFF',
            primary: '#FFFF00',
            secondary: '#00FF00'
        }
    };

    const fontSizes = {
        default: '16px',
        large: '20px',
        extraLarge: '24px'
    };

    const contextValue = {
        language,
        setLanguage,
        getTranslation: (key: string) => translations[language][key] || key,
        colorTheme,
        setColorTheme,
        getColorTheme: () => colorThemes[colorTheme],
        fontSize,
        setFontSize,
        getFontSize: () => fontSizes[fontSize],
        generateAriaLabel: (type: string, context: any) => {
            const templates = {
                button: `Press {action} button`,
                input: `{label} input field`,
                navigation: `Navigate to {description}`
            };
            
            const template = templates[type] || '{description}';
            return template.replace(/{(\w+)}/g, (_, k) => context[k] || '');
        }
    };

    return (
        <AccessibilityContext.Provider value={contextValue}>
            {children}
        </AccessibilityContext.Provider>
    );
};

// Accessibility Context
export const AccessibilityContext = React.createContext({
    language: 'en',
    setLanguage: () => {},
    getTranslation: (key: string) => key,
    colorTheme: 'default',
    setColorTheme: () => {},
    getColorTheme: () => ({
        background: '#FFFFFF',
        text: '#000000',
        primary: '#007BFF',
        secondary: '#6C757D'
    }),
    fontSize: 'default',
    setFontSize: () => {},
    getFontSize: () => '16px',
    generateAriaLabel: (type: string, context: any) => ''
});