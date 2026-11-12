'use client';

import { useCallback, useMemo, useRef, useState, type KeyboardEvent, type SelectHTMLAttributes } from 'react';

export type Option<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export interface CustomSelectProps<T extends string = string> {
  /** Currently selected value (controlled) */
  value: T;
  /** Options to display in the dropdown */
  options: Option<T>[];
  /** Called when the selected value changes */
  onChange: (value: T) => void;
  /** Placeholder/empty label when nothing is selected */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** CSS class for the button base */
  buttonClassName?: string;
  /** Additional CSS class for the dropdown list (for height/overflow) */
  listClassName?: string;
  /** Icon to show on the right side of the button */
  icon?: React.ReactNode;
  /** Children can render a custom label inside the button */
  children?: React.ReactNode;
}

function ChevronDownIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#62675a"
        d="M6.5 2.5L1 9h11z"
      />
    </svg>
  );
}

export function CustomSelect<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = 'Select an option…',
  disabled = false,
  buttonClassName = '',
  listClassName = '',
  icon = <ChevronDownIcon />,
  children,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((o) => o.value === value);
  }, [options, value]);

  const selectedLabel = selectedOption?.label ?? placeholder;

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => !prev);
  }, [disabled]);

  const handleOptionClick = useCallback(
    (optionValue: T) => {
      onChange(optionValue);
      setOpen(false);
      buttonRef.current?.focus();
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setOpen((prev) => {
            if (!prev) setHoverIndex(0);
            return true;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setOpen((prev) => {
            if (!prev) setHoverIndex(options.length - 1);
            return true;
          });
          break;
        case 'Escape':
          setOpen(false);
          buttonRef.current?.focus();
          break;
        case 'Enter':
        case ' ':
          if (!open) {
            e.preventDefault();
            setOpen(true);
          } else {
            if (hoverIndex !== null && hoverIndex < options.length) {
              const option = options[hoverIndex];
              if (!option.disabled) {
                handleOptionClick(option.value);
              }
            }
          }
          break;
        default:
          break;
      }
    },
    [disabled, open, hoverIndex, options, handleOptionClick]
  );

  const handleBlur = useCallback(() => {
    // Small delay so we don't close when clicking the dropdown list
    const timer = setTimeout(() => setOpen(false), 150);
    return () => clearTimeout(timer);
  }, []);

  // Close the dropdown when clicking outside
  useMemo(() => {
    if (!open) return;
    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const clickedInside =
        buttonRef.current?.contains(target) || listRef.current?.contains(target);
      if (!clickedInside) {
        setOpen(false);
        setHoverIndex(null);
      }
    }
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [open]);

  const listItems = options.filter((o) => !o.disabled || open);

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={selectedLabel}
        className={`field flex items-center justify-between gap-3 min-w-0 ${buttonClassName}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
      >
        <span className="min-w-0 flex-1 text-left truncate">
          {children ? (
            children
          ) : (
            <span className={selectedOption ? 'text-foreground' : 'text-muted'}>
              {selectedLabel}
            </span>
          )}
        </span>
        <span className="flex-shrink-0 flex items-center justify-center shrink-0">
          {icon}
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Options"
          className={`select-dropdown ${listClassName || ''}`}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors ${
                option.disabled
                  ? 'opacity-45 cursor-not-allowed'
                  : hoverIndex === index
                    ? 'bg-accent-tint'
                    : index === 0
                      ? 'bg-paper'
                      : 'hover:bg-accent-tint'
              }`}
              onClick={() => {
                if (!option.disabled) handleOptionClick(option.value);
              }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <span className="min-w-0 flex-1 text-sm text-foreground">
                {option.label}
              </span>
              {option.value === value && (
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent text-on-accent">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#fffaf1"
                      d="M1 9L4.5 5.5L9 9"
                    />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
