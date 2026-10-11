export interface CountryInfo {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  digitLength?: number | [number, number]; // exact or [min, max]
  placeholder?: string;
  example?: string;
}

/**
 * Complete Worldwide Country List (All Countries & Territories)
 * Default country is India (+91) at index 0.
 */
export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  // 1. DEFAULT: India (Strict 10-digit mobile starting with 6, 7, 8, 9)
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    digitLength: 10,
    placeholder: '98765 43210',
    example: '9876543210',
  },

  // 2. Popular & Global Hubs
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', digitLength: 10, placeholder: '555 123 4567', example: '5551234567' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', digitLength: [10, 11], placeholder: '7911 123456', example: '7911123456' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', digitLength: 9, placeholder: '50 123 4567', example: '501234567' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', digitLength: 9, placeholder: '51 234 5678', example: '512345678' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', digitLength: 10, placeholder: '416 123 4567', example: '4161234567' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', digitLength: 9, placeholder: '412 345 678', example: '412345678' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', digitLength: 8, placeholder: '8123 4567', example: '81234567' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', digitLength: 8, placeholder: '3312 3456', example: '33123456' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', digitLength: 8, placeholder: '9123 4567', example: '91234567' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', digitLength: 8, placeholder: '9123 4567', example: '91234567' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', digitLength: 8, placeholder: '3123 4567', example: '31234567' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', digitLength: [10, 11], placeholder: '151 12345678', example: '15112345678' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', digitLength: 9, placeholder: '6 12 34 56 78', example: '612345678' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', digitLength: [9, 10], placeholder: '12 345 6789', example: '123456789' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', digitLength: [8, 10], placeholder: '21 123 4567', example: '211234567' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', digitLength: 9, placeholder: '87 123 4567', example: '871234567' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', digitLength: 9, placeholder: '82 123 4567', example: '821234567' },

  // 3. Complete Alphabetical World Countries List
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', dialCode: '+355', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', dialCode: '+376', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴' },
  { code: 'AG', name: 'Antigua and Barbuda', dialCode: '+1268', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', dialCode: '+374', flag: '🇦🇲' },
  { code: 'AW', name: 'Aruba', dialCode: '+297', flag: '🇦🇼' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', dialCode: '+1242', flag: '🇧🇸' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', digitLength: 10, placeholder: '1712 345678', example: '1712345678' },
  { code: 'BB', name: 'Barbados', dialCode: '+1246', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', dialCode: '+375', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', dialCode: '+501', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'BM', name: 'Bermuda', dialCode: '+1441', flag: '🇧🇲' },
  { code: 'BT', name: 'Bhutan', dialCode: '+975', flag: '🇧🇹', digitLength: 8, placeholder: '1712 3456', example: '17123456' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', dialCode: '+267', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', digitLength: [10, 11], placeholder: '11 91234 5678', example: '11912345678' },
  { code: 'BN', name: 'Brunei', dialCode: '+673', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', dialCode: '+257', flag: '🇧🇮' },
  { code: 'KH', name: 'Cambodia', dialCode: '+855', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CV', name: 'Cape Verde', dialCode: '+238', flag: '🇨🇻' },
  { code: 'KY', name: 'Cayman Islands', dialCode: '+1345', flag: '🇰🇾' },
  { code: 'CF', name: 'Central African Republic', dialCode: '+236', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', dialCode: '+235', flag: '🇹🇩' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', digitLength: 11, placeholder: '138 1234 5678', example: '13812345678' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoros', dialCode: '+269', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬' },
  { code: 'CD', name: 'Congo (DRC)', dialCode: '+243', flag: '🇨🇩' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatia', dialCode: '+385', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', dialCode: '+357', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', digitLength: 8, placeholder: '20 12 34 56', example: '20123456' },
  { code: 'DJ', name: 'Djibouti', dialCode: '+253', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', dialCode: '+1767', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', dialCode: '+1809', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', digitLength: 10, placeholder: '10 1234 5678', example: '1012345678' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', dialCode: '+240', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', dialCode: '+291', flag: '🇪🇷' },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪' },
  { code: 'SZ', name: 'Eswatini', dialCode: '+268', flag: '🇸🇿' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { code: 'FJ', name: 'Fiji', dialCode: '+679', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', dialCode: '+220', flag: '🇬🇲' },
  { code: 'GE', name: 'Georgia', dialCode: '+995', flag: '🇬🇪' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'GD', name: 'Grenada', dialCode: '+1473', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'GN', name: 'Guinea', dialCode: '+224', flag: '🇬🇳' },
  { code: 'GY', name: 'Guyana', dialCode: '+592', flag: '🇬🇾' },
  { code: 'HT', name: 'Haiti', dialCode: '+509', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', digitLength: 8, placeholder: '9123 4567', example: '91234567' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', dialCode: '+354', flag: '🇮🇸' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', digitLength: [9, 12], placeholder: '812 3456 7890', example: '81234567890' },
  { code: 'IR', name: 'Iran', dialCode: '+98', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', digitLength: 10, placeholder: '312 345 6789', example: '3123456789' },
  { code: 'CI', name: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮' },
  { code: 'JM', name: 'Jamaica', dialCode: '+1876', flag: '🇯🇲' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', digitLength: 10, placeholder: '90 1234 5678', example: '9012345678' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', digitLength: 9, placeholder: '712 345678', example: '712345678' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', digitLength: [9, 10], placeholder: '10 1234 5678', example: '1012345678' },
  { code: 'KG', name: 'Kyrgyzstan', dialCode: '+996', flag: '🇰🇬' },
  { code: 'LA', name: 'Laos', dialCode: '+856', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', dialCode: '+371', flag: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
  { code: 'LS', name: 'Lesotho', dialCode: '+266', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', dialCode: '+231', flag: '🇱🇷' },
  { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', dialCode: '+423', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺' },
  { code: 'MO', name: 'Macau', dialCode: '+853', flag: '🇲🇴' },
  { code: 'MG', name: 'Madagascar', dialCode: '+261', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', dialCode: '+265', flag: '🇲🇼' },
  { code: 'MV', name: 'Maldives', dialCode: '+960', flag: '🇲🇻', digitLength: 7, placeholder: '712 3456', example: '7123456' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'MT', name: 'Malta', dialCode: '+356', flag: '🇲🇹' },
  { code: 'MR', name: 'Mauritania', dialCode: '+222', flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius', dialCode: '+230', flag: '🇲🇺' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', digitLength: 10, placeholder: '55 1234 5678', example: '5512345678' },
  { code: 'MD', name: 'Moldova', dialCode: '+373', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', dialCode: '+377', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', dialCode: '+976', flag: '🇲🇳' },
  { code: 'ME', name: 'Montenegro', dialCode: '+382', flag: '🇲🇪' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', dialCode: '+95', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibia', dialCode: '+264', flag: '🇳🇦' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', digitLength: 10, placeholder: '984 1234567', example: '9841234567' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', digitLength: 9, placeholder: '6 12345678', example: '612345678' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', digitLength: 10, placeholder: '802 123 4567', example: '8021234567' },
  { code: 'MK', name: 'North Macedonia', dialCode: '+389', flag: '🇲🇰' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', digitLength: 8, placeholder: '412 34 567', example: '41234567' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', digitLength: 10, placeholder: '301 2345678', example: '3012345678' },
  { code: 'PA', name: 'Panama', dialCode: '+507', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', dialCode: '+675', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', digitLength: 10, placeholder: '917 123 4567', example: '9171234567' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', digitLength: 9, placeholder: '512 345 678', example: '512345678' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', digitLength: 9, placeholder: '912 345 678', example: '912345678' },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', digitLength: 10, placeholder: '912 345-67-89', example: '9123456789' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', dialCode: '+381', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', dialCode: '+248', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱' },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', flag: '🇸🇮' },
  { code: 'SO', name: 'Somalia', dialCode: '+252', flag: '🇸🇴' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', digitLength: 9, placeholder: '612 34 56 78', example: '612345678' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', digitLength: 9, placeholder: '71 234 5678', example: '712345678' },
  { code: 'SD', name: 'Sudan', dialCode: '+249', flag: '🇸🇩' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', digitLength: [9, 10], placeholder: '70 123 45 67', example: '701234567' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', digitLength: 9, placeholder: '78 123 45 67', example: '781234567' },
  { code: 'SY', name: 'Syria', dialCode: '+963', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', digitLength: 9, placeholder: '912 345 678', example: '912345678' },
  { code: 'TJ', name: 'Tajikistan', dialCode: '+992', flag: '🇹🇯' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', digitLength: 9, placeholder: '81 234 5678', example: '812345678' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'TT', name: 'Trinidad and Tobago', dialCode: '+1868', flag: '🇹🇹' },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', digitLength: 10, placeholder: '532 123 4567', example: '5321234567' },
  { code: 'TM', name: 'Turkmenistan', dialCode: '+993', flag: '🇹🇲' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', digitLength: 9, placeholder: '50 123 4567', example: '501234567' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', dialCode: '+998', flag: '🇺🇿' },
  { code: 'VA', name: 'Vatican City', dialCode: '+379', flag: '🇻🇦' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', digitLength: [9, 10], placeholder: '91 234 5678', example: '912345678' },
  { code: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', dialCode: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼' },
];

export interface PhoneValidationResult {
  isValid: boolean;
  rawDigits: string;
  country: CountryInfo;
  formattedDisplay: string;
  e164: string;
  errorMessage?: string;
}

/**
 * Extracts raw digits and detects country prefix if present.
 * Defaults to India (+91) if no country or dial code is provided.
 */
export function parsePhoneInput(
  rawInput: string,
  preferredCountryCode = 'IN'
): { country: CountryInfo; digits: string } {
  let cleaned = (rawInput || '').trim();
  let selectedCountry =
    SUPPORTED_COUNTRIES.find((c) => c.code === preferredCountryCode) || SUPPORTED_COUNTRIES[0];

  // If string starts with a known dial code like +91, +1, +44, etc.
  if (cleaned.startsWith('+')) {
    // Sort dial codes by length descending to match +971 or +1268 before shorter prefixes
    const sorted = [...SUPPORTED_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (cleaned.startsWith(c.dialCode)) {
        selectedCountry = c;
        cleaned = cleaned.slice(c.dialCode.length).trim();
        break;
      }
    }
  }

  // Extract only digits
  let digits = cleaned.replace(/\D/g, '');

  // If India and user pasted 91 followed by 10 digits (12 total), strip leading 91
  if (selectedCountry.code === 'IN' && digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  // If 0-prefixed national trunk for India or UK, strip leading 0
  if (
    (selectedCountry.code === 'IN' || selectedCountry.code === 'GB') &&
    digits.length === 11 &&
    digits.startsWith('0')
  ) {
    digits = digits.slice(1);
  }

  return { country: selectedCountry, digits };
}

/**
 * Validate phone number against country specific rules.
 * For India: strict 10 digits starting with 6, 7, 8, 9.
 * For all other countries: standard ITU E.164 (6 to 15 digits or specified range).
 */
export function validatePhoneNumber(
  input: string,
  countryCode = 'IN'
): PhoneValidationResult {
  const { country, digits } = parsePhoneInput(input, countryCode);

  // 1. India Validation (Strict 10-digit mobile starting with 6, 7, 8, 9)
  if (country.code === 'IN') {
    if (!digits) {
      return {
        isValid: false,
        rawDigits: '',
        country,
        formattedDisplay: '',
        e164: '',
        errorMessage: 'Mobile number is required.',
      };
    }

    if (digits.length < 10) {
      return {
        isValid: false,
        rawDigits: digits,
        country,
        formattedDisplay: formatIndianPhone(digits),
        e164: `${country.dialCode}${digits}`,
        errorMessage: `Please enter all 10 digits (${digits.length}/10 entered).`,
      };
    }

    if (digits.length > 10) {
      return {
        isValid: false,
        rawDigits: digits,
        country,
        formattedDisplay: formatIndianPhone(digits.slice(0, 10)),
        e164: `${country.dialCode}${digits.slice(0, 10)}`,
        errorMessage: 'Mobile number must be exactly 10 digits.',
      };
    }

    // Must start with 6, 7, 8, or 9 for Indian mobile numbers
    const firstDigit = digits.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return {
        isValid: false,
        rawDigits: digits,
        country,
        formattedDisplay: formatIndianPhone(digits),
        e164: `${country.dialCode}${digits}`,
        errorMessage: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
      };
    }

    return {
      isValid: true,
      rawDigits: digits,
      country,
      formattedDisplay: formatIndianPhone(digits),
      e164: `${country.dialCode}${digits}`,
    };
  }

  // 2. All Other Countries Worldwide
  let minLen = 6;
  let maxLen = 15;

  if (country.digitLength) {
    if (Array.isArray(country.digitLength)) {
      minLen = country.digitLength[0];
      maxLen = country.digitLength[1];
    } else {
      minLen = country.digitLength;
      maxLen = country.digitLength;
    }
  }

  if (!digits) {
    return {
      isValid: false,
      rawDigits: '',
      country,
      formattedDisplay: '',
      e164: '',
      errorMessage: 'Phone number is required.',
    };
  }

  if (digits.length < minLen) {
    return {
      isValid: false,
      rawDigits: digits,
      country,
      formattedDisplay: digits,
      e164: `${country.dialCode}${digits}`,
      errorMessage: `Enter at least ${minLen} digits for ${country.name}.`,
    };
  }

  if (digits.length > maxLen) {
    return {
      isValid: false,
      rawDigits: digits,
      country,
      formattedDisplay: digits,
      e164: `${country.dialCode}${digits}`,
      errorMessage: `Maximum ${maxLen} digits allowed for ${country.name}.`,
    };
  }

  return {
    isValid: true,
    rawDigits: digits,
    country,
    formattedDisplay: `${country.dialCode} ${digits}`,
    e164: `${country.dialCode}${digits}`,
  };
}

/**
 * Format Indian 10-digit number as "XXXXX XXXXX"
 */
export function formatIndianPhone(digits: string): string {
  const clean = digits.replace(/\D/g, '').slice(0, 10);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)} ${clean.slice(5)}`;
}
