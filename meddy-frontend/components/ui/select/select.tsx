import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import styles from './select.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Select = ({ 
  options, 
  value, 
  onChange, 
  placeholder = '请选择',
  className 
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [selectedLabel, setSelectedLabel] = useState('');

  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedLabel(option ? option.label : placeholder);
  }, [value, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleSelect = (option: SelectOption) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div className={styles.selectContainer} ref={selectRef}>
      <button
        type="button"
        className={`${styles.trigger} ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.triggerText}>{selectedLabel}</span>
        <ChevronDownIcon 
          className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div 
          className={styles.dropdown} 
          role="listbox"
          aria-orientation="vertical"
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};