import React, { useState, useEffect, useId } from 'react';
import {
  SUPPORTED_COUNTRIES,
  CountryInfo,
  validatePhoneNumber,
  parsePhoneInput,
  formatIndianPhone,
  PhoneValidationResult,
} from '../utils/phoneValidator.js';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string, isValid: boolean, validation: PhoneValidationResult) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  defaultCountryCode?: string;
  showValidationMessage?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label = 'Phone Number',
  placeholder,
  required = false,
  disabled = false,
  id,
  style,
  defaultCountryCode = 'IN',
  showValidationMessage = true,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Internal state for selected country and raw digits
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => {
    const parsed = parsePhoneInput(value, defaultCountryCode);
    return parsed.country;
  });

  const [digits, setDigits] = useState<string>(() => {
    const parsed = parsePhoneInput(value, defaultCountryCode);
    return parsed.digits;
  });

  const [touched, setTouched] = useState(false);

  // Sync internal state when value prop changes externally
  useEffect(() => {
    const parsed = parsePhoneInput(value, selectedCountry.code);
    if (parsed.digits !== digits || parsed.country.code !== selectedCountry.code) {
      setSelectedCountry(parsed.country);
      setDigits(parsed.digits);
    }
  }, [value]);

  // Validate current digits with current country
  const validation = validatePhoneNumber(digits, selectedCountry.code);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    const found = SUPPORTED_COUNTRIES.find((c) => c.code === newCode) || SUPPORTED_COUNTRIES[0];
    setSelectedCountry(found);

    const newValidation = validatePhoneNumber(digits, found.code);
    const combinedValue = digits ? `${found.dialCode} ${digits}` : '';
    onChange(combinedValue, newValidation.isValid, newValidation);
  };

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    let raw = e.target.value;

    // Check if user pasted with country code
    if (raw.includes('+')) {
      const parsed = parsePhoneInput(raw, selectedCountry.code);
      setSelectedCountry(parsed.country);
      raw = parsed.digits;
    } else {
      // Keep only numbers
      raw = raw.replace(/\D/g, '');
    }

    // Cap at max length for country
    if (selectedCountry.code === 'IN') {
      raw = raw.slice(0, 10);
    } else {
      raw = raw.slice(0, 15);
    }

    setDigits(raw);

    const newValidation = validatePhoneNumber(raw, selectedCountry.code);
    // Produce standard international format e.g. "+91 9876543210" or formatted for India
    const combinedValue = raw ? `${selectedCountry.dialCode} ${raw}` : '';
    onChange(combinedValue, newValidation.isValid, newValidation);
  };

  const displayPlaceholder = placeholder || selectedCountry.placeholder || 'Mobile / phone number';

  return (
    <div className="phone-input-container" style={{ width: '100%', marginBottom: '16px', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          className="form-label"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <span>
            {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
          </span>
          {selectedCountry.code === 'IN' && (
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: digits.length === 10 ? 'var(--success)' : 'var(--text-muted)',
              }}
            >
              {digits.length}/10 digits
            </span>
          )}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: touched && !validation.isValid && digits.length > 0
            ? '1.5px solid var(--error)'
            : validation.isValid
            ? '1.5px solid var(--success)'
            : '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: disabled ? 'var(--surface-container)' : 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.15s ease',
          overflow: 'hidden',
        }}
      >
        {/* Country Selector Dropdown */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface-container)',
            borderRight: '1px solid var(--border)',
            padding: '0 8px',
            minWidth: '95px',
            height: '44px', // mobile finger tap friendly
          }}
        >
          <span style={{ fontSize: '18px', marginRight: '4px' }}>{selectedCountry.flag}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
            {selectedCountry.dialCode}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>▼</span>

          {/* Hidden absolute native select for smooth iOS/Android native wheel pickers */}
          <select
            value={selectedCountry.code}
            onChange={handleCountryChange}
            disabled={disabled}
            aria-label="Select Country Code"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.dialCode})
              </option>
            ))}
          </select>
        </div>

        {/* Numeric Input */}
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          disabled={disabled}
          placeholder={displayPlaceholder}
          value={selectedCountry.code === 'IN' ? formatIndianPhone(digits) : digits}
          onChange={handleDigitsChange}
          onBlur={() => setTouched(true)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: '10px 14px',
            fontSize: '16px',
            fontFamily: 'inherit',
            color: 'var(--text)',
            background: 'transparent',
            letterSpacing: selectedCountry.code === 'IN' ? '0.5px' : 'normal',
            height: '44px',
          }}
        />

        {/* Status Icon */}
        {digits && (
          <div style={{ paddingRight: '12px', display: 'flex', alignItems: 'center' }}>
            {validation.isValid ? (
              <span style={{ color: 'var(--success)', fontSize: '15px', fontWeight: 800 }}>✓</span>
            ) : touched ? (
              <span style={{ color: 'var(--error)', fontSize: '14px', fontWeight: 800 }}>!</span>
            ) : null}
          </div>
        )}
      </div>

      {/* Validation / Helper Feedback */}
      {showValidationMessage && (
        <div style={{ minHeight: '18px', marginTop: '4px' }}>
          {touched && !validation.isValid && digits.length > 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--error)', fontWeight: 500 }}>
              ⚠ {validation.errorMessage}
            </div>
          ) : validation.isValid ? (
            <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 500 }}>
              ✓ Verified {selectedCountry.name} phone number
            </div>
          ) : (
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {selectedCountry.code === 'IN'
                ? 'Standard 10-digit Indian mobile number (e.g. 98765 43210)'
                : `Enter valid phone number for ${selectedCountry.name}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
