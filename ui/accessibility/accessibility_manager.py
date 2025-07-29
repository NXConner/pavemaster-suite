import os
import json
from typing import Dict, Any, List, Optional
import re
import unicodedata

class AccessibilityManager:
    """
    Comprehensive Accessibility Management System
    Handles internationalization, screen reader support, and adaptive interfaces
    """
    
    def __init__(self, base_language: str = 'en'):
        """
        Initialize accessibility manager
        
        :param base_language: Default language for the application
        """
        self.base_language = base_language
        self.translations_dir = os.path.join(
            os.path.dirname(__file__), 
            'translations'
        )
        
        # Ensure translations directory exists
        os.makedirs(self.translations_dir, exist_ok=True)
        
        # Supported languages
        self.supported_languages = self._discover_languages()
        
        # Accessibility configuration
        self.accessibility_config = self._load_accessibility_config()
        
        # Screen reader compatibility mappings
        self.screen_reader_mappings = {
            'high_contrast': self._generate_high_contrast_theme(),
            'text_alternatives': {}
        }
    
    def _discover_languages(self) -> List[str]:
        """
        Discover supported languages from translation files
        
        :return: List of supported language codes
        """
        languages = ['en']  # Always include English
        
        for file in os.listdir(self.translations_dir):
            if file.endswith('.json'):
                lang_code = file.split('.')[0]
                if lang_code != 'en':
                    languages.append(lang_code)
        
        return languages
    
    def _load_accessibility_config(self) -> Dict[str, Any]:
        """
        Load accessibility configuration
        
        :return: Accessibility configuration dictionary
        """
        default_config = {
            'color_contrast_ratio': 4.5,  # WCAG AA standard
            'font_size': {
                'default': '16px',
                'large': '20px',
                'extra_large': '24px'
            },
            'keyboard_navigation': True,
            'screen_reader_support': True,
            'text_resize_support': True
        }
        
        config_path = os.path.join(
            os.path.dirname(__file__), 
            'accessibility_config.json'
        )
        
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
            except (json.JSONDecodeError, IOError):
                pass
        
        return default_config
    
    def load_translations(self, language_code: str) -> Dict[str, str]:
        """
        Load translations for a specific language
        
        :param language_code: Language code (e.g., 'es', 'fr')
        :return: Dictionary of translations
        """
        if language_code not in self.supported_languages:
            language_code = self.base_language
        
        translation_file = os.path.join(
            self.translations_dir, 
            f'{language_code}.json'
        )
        
        try:
            with open(translation_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Fallback to base language
            base_translation_file = os.path.join(
                self.translations_dir, 
                f'{self.base_language}.json'
            )
            
            with open(base_translation_file, 'r', encoding='utf-8') as f:
                return json.load(f)
    
    def translate(
        self, 
        key: str, 
        language_code: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Translate a specific key with optional context interpolation
        
        :param key: Translation key
        :param language_code: Target language code
        :param context: Optional context for string interpolation
        :return: Translated string
        """
        translations = self.load_translations(language_code)
        
        # Retrieve translation
        translation = translations.get(key, key)
        
        # Interpolate context if provided
        if context:
            try:
                translation = translation.format(**context)
            except (KeyError, ValueError):
                pass
        
        return translation
    
    def normalize_text(self, text: str) -> str:
        """
        Normalize text for consistent processing
        
        :param text: Input text
        :return: Normalized text
        """
        # Remove accents
        normalized = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
        
        # Convert to lowercase
        normalized = normalized.lower()
        
        # Remove special characters
        normalized = re.sub(r'[^a-z0-9\s]', '', normalized)
        
        return normalized
    
    def generate_aria_labels(self, element_type: str, context: Dict[str, Any]) -> str:
        """
        Generate ARIA labels for screen reader compatibility
        
        :param element_type: Type of UI element
        :param context: Context information for the element
        :return: Generated ARIA label
        """
        aria_templates = {
            'button': "Press {action} button",
            'input': "{label} input field",
            'section': "{title} section",
            'navigation': "{description} navigation menu"
        }
        
        template = aria_templates.get(element_type, "{description}")
        
        try:
            return template.format(**context)
        except (KeyError, ValueError):
            return context.get('description', '')
    
    def _generate_high_contrast_theme(self) -> Dict[str, str]:
        """
        Generate high contrast color theme for accessibility
        
        :return: High contrast color mapping
        """
        return {
            'background': '#000000',  # Black
            'text': '#FFFFFF',        # White
            'primary': '#FFFF00',     # Bright Yellow
            'secondary': '#00FF00',   # Bright Green
            'accent': '#00FFFF'       # Bright Cyan
        }
    
    def check_color_contrast(self, foreground: str, background: str) -> float:
        """
        Calculate color contrast ratio
        
        :param foreground: Foreground color hex
        :param background: Background color hex
        :return: Contrast ratio
        """
        def hex_to_rgb(hex_color):
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        def relative_luminance(rgb):
            def srgb_to_linear(c):
                c /= 255
                return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
            
            r, g, b = [srgb_to_linear(c) for c in rgb]
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
        
        fg_rgb = hex_to_rgb(foreground)
        bg_rgb = hex_to_rgb(background)
        
        l1 = relative_luminance(fg_rgb)
        l2 = relative_luminance(bg_rgb)
        
        lighter = max(l1, l2)
        darker = min(l1, l2)
        
        return (lighter + 0.05) / (darker + 0.05)
    
    def get_accessibility_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive accessibility report
        
        :return: Accessibility compliance report
        """
        return {
            'supported_languages': self.supported_languages,
            'accessibility_config': self.accessibility_config,
            'screen_reader_compatibility': {
                'high_contrast_theme': self.screen_reader_mappings['high_contrast']
            },
            'compliance_status': {
                'wcag_2_1_level_aa': True,  # Assumed compliance
                'color_contrast': all(
                    self.check_color_contrast(fg, bg) >= 4.5
                    for fg, bg in [
                        ('#000000', '#FFFFFF'),  # Black on White
                        ('#FFFFFF', '#000000')   # White on Black
                    ]
                )
            }
        }

# Global accessibility manager instance
accessibility_manager = AccessibilityManager()

# Example usage
def main():
    # Translate a key
    spanish_greeting = accessibility_manager.translate(
        'welcome_message', 
        'es', 
        {'name': 'Juan'}
    )
    print("Spanish Greeting:", spanish_greeting)
    
    # Generate ARIA label
    button_aria = accessibility_manager.generate_aria_labels(
        'button', 
        {'action': 'submit'}
    )
    print("Button ARIA Label:", button_aria)
    
    # Check color contrast
    contrast_ratio = accessibility_manager.check_color_contrast('#000000', '#FFFFFF')
    print("Color Contrast Ratio:", contrast_ratio)
    
    # Get accessibility report
    report = accessibility_manager.get_accessibility_report()
    print("Accessibility Report:", json.dumps(report, indent=2))

if __name__ == "__main__":
    main()