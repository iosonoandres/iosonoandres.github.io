import React, { useEffect, useMemo, useRef, useState } from 'react';
import { siteContent } from '../../data/siteContent';

const isEditableTarget = (target) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable);

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(
    () => [
      ...siteContent.nav.map((item) => ({
        id: `section-${item.id}`,
        label: `Go to ${item.label}`,
        keywords: item.label,
        type: 'section',
        sectionId: item.id,
      })),
      {
        id: 'cv-download',
        label: 'Download CV',
        keywords: 'cv resume curriculum',
        type: 'link',
        href: siteContent.links.cv,
      },
      {
        id: 'linkedin',
        label: 'Open LinkedIn profile',
        keywords: 'linkedin social profile',
        type: 'external',
        href: siteContent.links.linkedin,
      },
      {
        id: 'contact-email',
        label: 'Send email',
        keywords: 'contact mail',
        type: 'mailto',
        href: `mailto:${siteContent.links.email}`,
      },
    ],
    [],
  );

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return commands;
    }

    return commands.filter((command) =>
      `${command.label} ${command.keywords}`.toLowerCase().includes(normalized),
    );
  }, [commands, query]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    inputRef.current?.focus();
    setActiveIndex(0);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === '/' && !isEditableTarget(event.target)) {
        event.preventDefault();
        setIsOpen(true);
        return;
      }

      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const closePalette = () => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  const runCommand = (command) => {
    if (!command) {
      return;
    }

    if (command.type === 'section') {
      const section = document.getElementById(command.sectionId);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closePalette();
      return;
    }

    if (command.type === 'external') {
      window.open(command.href, '_blank', 'noopener,noreferrer');
      closePalette();
      return;
    }

    if (command.type === 'mailto') {
      window.location.href = command.href;
      closePalette();
      return;
    }

    window.open(command.href, '_blank', 'noopener,noreferrer');
    closePalette();
  };

  const onPaletteKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      runCommand(filteredCommands[activeIndex]);
    }
  };

  return (
    <>
      <button
        type="button"
        className="command-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open quick command palette"
      >
        <span>/</span>
      </button>

      {isOpen && (
        <div className="command-overlay" role="presentation" onClick={closePalette}>
          <section
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Quick command palette"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={onPaletteKeyDown}
          >
            <div className="command-head">
              <p>Quick commands</p>
              <small>Press ESC to close</small>
            </div>

            <label htmlFor="command-input" className="command-label">
              Search command
            </label>
            <input
              id="command-input"
              ref={inputRef}
              className="command-input"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type to filter commands..."
            />

            <div className="command-list" role="listbox" aria-label="Available commands">
              {filteredCommands.length === 0 ? (
                <p className="command-empty">No commands found.</p>
              ) : (
                filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    type="button"
                    className={`command-item ${index === activeIndex ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => runCommand(command)}
                  >
                    <span>{command.label}</span>
                    <kbd>{index + 1}</kbd>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default CommandPalette;
