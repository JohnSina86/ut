import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.join(__dirname, 'src');

const COMPONENT_ROOTS = {
  ui:     path.join(SRC, 'components', 'ui'),
  layout: path.join(SRC, 'components', 'layout'),
  shared: path.join(SRC, 'components', 'shared'),
};

const PAGES_ROOT = path.join(SRC, 'pages');

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  red:    '\x1b[31m',
  grey:   '\x1b[90m',
  orange: '\x1b[38;5;208m',
};

const clr  = (color, txt) => `${c[color]}${txt}${c.reset}`;
const ok   = (msg)  => console.log(`  ${clr('green',  '\u2714')} ${msg}`);
const warn = (msg)  => console.log(`  ${clr('yellow', '\u26A0')} ${msg}`);
const err  = (msg)  => console.log(`  ${clr('red',    '\u2716')} ${msg}`);
const info = (msg)  => console.log(`  ${clr('cyan',   '\u203A')} ${msg}`);

function getDefaultProps(name) {
  const map = {
    Button: {
      iface: `interface ButtonProps {\n  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';\n  size?: 'sm' | 'md' | 'lg';\n  disabled?: boolean;\n  fullWidth?: boolean;\n  onClick?: () => void;\n  children: React.ReactNode;\n}`,
      sig:   `{ variant = 'primary', size = 'md', disabled = false, fullWidth = false, onClick, children }: ButtonProps`,
      body:  `<button\n        className={[styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : ''].filter(Boolean).join(' ')}\n        disabled={disabled}\n        onClick={onClick}\n        type="button"\n      >\n        {children}\n      </button>`,
    },
    Input: {
      iface: `interface InputProps {\n  type?: 'text' | 'email' | 'password' | 'number' | 'tel';\n  label?: string;\n  placeholder?: string;\n  value?: string;\n  error?: string;\n  helperText?: string;\n  disabled?: boolean;\n  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;\n}`,
      sig:   `{ type = 'text', label, placeholder, value, error, helperText, disabled = false, onChange }: InputProps`,
      body:  `<label className={styles.wrapper}>\n        {label && <span className={styles.label}>{label}</span>}\n        <input type={type} value={value} placeholder={placeholder} disabled={disabled} onChange={onChange}\n          className={[styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ')}\n        />\n        {error && <span className={styles.errorText}>{error}</span>}\n        {helperText && <span className={styles.helperText}>{helperText}</span>}\n      </label>`,
    },
    Card: {
      iface: `interface CardProps {\n  title?: string;\n  subtitle?: string;\n  footer?: React.ReactNode;\n  shadow?: boolean;\n  hoverable?: boolean;\n  children: React.ReactNode;\n}`,
      sig:   `{ title, subtitle, footer, shadow = true, hoverable = false, children }: CardProps`,
      body:  `<div className={[styles.card, shadow ? styles.shadow : '', hoverable ? styles.hoverable : ''].filter(Boolean).join(' ')}>\n        {(title || subtitle) && (\n          <div className={styles.header}>\n            {title && <h3 className={styles.title}>{title}</h3>}\n            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}\n          </div>\n        )}\n        <div className={styles.body}>{children}</div>\n        {footer && <div className={styles.footer}>{footer}</div>}\n      </div>`,
    },
    Modal: {
      iface: `interface ModalProps {\n  isOpen: boolean;\n  title?: string;\n  onClose: () => void;\n  children: React.ReactNode;\n}`,
      sig:   `{ isOpen, title, onClose, children }: ModalProps`,
      body:  `{isOpen && (\n        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">\n          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>\n            <div className={styles.header}>\n              {title && <h2 className={styles.title}>{title}</h2>}\n              <button className={styles.closeBtn} onClick={onClose} aria-label="Close">\u00D7</button>\n            </div>\n            <div className={styles.body}>{children}</div>\n          </div>\n        </div>\n      )}`,
    },
  };
  const m = map[name];
  if (m) return { interface: m.iface, signature: m.sig, body: m.body };
  return {
    interface: `interface ${name}Props {\n  children?: React.ReactNode;\n}`,
    signature: `{ children }: ${name}Props`,
    body: `{children}`,
  };
}

function componentTsx(name) {
  const p = getDefaultProps(name);
  return [
    `import React from 'react';`,
    `import styles from './${name}.module.css';`,
    ``,
    p.interface,
    ``,
    `export const ${name} = (${p.signature}) => {`,
    `  return (`,
    `    <div className={styles.root}>`,
    `      ${p.body}`,
    `    </div>`,
    `  );`,
    `};`,
    ``,
    `export default ${name};`,
    ``,
  ].join('\n');
}

function componentCss(name) {
  return `.root {\n  /* ${name} – add styles here */\n  box-sizing: border-box;\n}\n`;
}

function pageTsx(name) {
  const plain = name.replace(/Page$/, '');
  return [
    `import React from 'react';`,
    `import styles from './${name}.module.css';`,
    ``,
    `export const ${name} = () => {`,
    `  return (`,
    `    <div className={styles.page}>`,
    `      <main className={styles.main}>`,
    `        <p>TODO: Build the ${plain} page.</p>`,
    `      </main>`,
    `    </div>`,
    `  );`,
    `};`,
    ``,
    `export default ${name};`,
    ``,
  ].join('\n');
}

function pageCss() {
  return `.page {\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n.main {\n  flex: 1;\n}\n`;
}

function writeFile(filePath, content, force = false) {
  if (fs.existsSync(filePath) && !force) {
    warn(`Skipped (exists): ${clr('grey', path.relative(__dirname, filePath))}`);
    return false;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  ok(`Created: ${clr('cyan', path.relative(__dirname, filePath))}`);
  return true;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function generateComponent(name, type = 'ui', force = false) {
  const root = COMPONENT_ROOTS[type];
  if (!root) { err(`Unknown type "${type}". Use: ui | layout | shared`); return; }
  const dir = path.join(root, name);
  ensureDir(dir);
  writeFile(path.join(dir, `${name}.tsx`),        componentTsx(name), force);
  writeFile(path.join(dir, `${name}.module.css`), componentCss(name), force);
  info(`Component ${clr('bold', name)} ? src/components/${type}/${name}/`);
}

function generatePage(name, force = false) {
  if (!name.endsWith('Page')) name = `${name}Page`;
  const dir = path.join(PAGES_ROOT, name);
  ensureDir(dir);
  writeFile(path.join(dir, `${name}.tsx`),        pageTsx(name),  force);
  writeFile(path.join(dir, `${name}.module.css`), pageCss(name),  force);
  info(`Page ${clr('bold', name)} ? src/pages/${name}/`);
}

function listAll() {
  console.log('\n' + clr('bold', 'Components:'));
  for (const [type, root] of Object.entries(COMPONENT_ROOTS)) {
    if (!fs.existsSync(root)) continue;
    const names = fs.readdirSync(root).filter(n => fs.statSync(path.join(root, n)).isDirectory());
    if (names.length) console.log(`  ${clr('cyan', type.padEnd(8))}  ${names.join('  ')}`);
  }
  console.log('\n' + clr('bold', 'Pages:'));
  if (fs.existsSync(PAGES_ROOT)) {
    const pages = fs.readdirSync(PAGES_ROOT).filter(n => fs.statSync(path.join(PAGES_ROOT, n)).isDirectory());
    if (pages.length) console.log(`  ${pages.join('  ')}`);
  }
  console.log();
}

function deleteComponent(name, type = 'ui') {
  const dir = path.join(COMPONENT_ROOTS[type], name);
  if (!fs.existsSync(dir)) { err(`Not found: ${dir}`); return; }
  fs.rmSync(dir, { recursive: true, force: true });
  ok(`Deleted: src/components/${type}/${name}/`);
}

const ALL_COMPONENTS = {
  ui:     ['Button','Input','Select','Checkbox','Radio','Textarea','Icon','Spinner','Modal','Card','Badge','Alert','Avatar','Divider'],
  layout: ['Container','Grid','Header','Footer','Section','Hero','NavBar'],
  shared: ['ServiceCard','VehicleForm','VehicleSelector','DateTimePicker','BookingSummary','AppointmentCard','TestimonialCard','HowItWorksStep','AuthForm','SocialLoginButtons'],
};

const ALL_PAGES = [
  'HomePage','ServicesPage','BookingWizard','LoginPage','SignUpPage',
  'PasswordResetPage','AboutPage','ContactPage','FaqPage','TermsPage',
  'PrivacyPage','DashboardPage','VehiclesPage','AppointmentsPage',
  'AppointmentDetailsPage','AccountSettingsPage','NotFoundPage',
];

function generateAll(force = false) {
  console.log('\n  Scaffolding all components & pages...\n');
  for (const [type, names] of Object.entries(ALL_COMPONENTS)) {
    for (const name of names) generateComponent(name, type, force);
  }
  for (const name of ALL_PAGES) generatePage(name, force);
  console.log('\n' + clr('green', 'Done.') + '\n');
}

function parseArgs(argv) {
  const args    = argv.slice(2);
  const force   = args.includes('--force') || args.includes('-f');
  const typeIdx = args.indexOf('--type');
  const type    = typeIdx !== -1 ? args[typeIdx + 1] : 'ui';
  const clean   = args.filter(a => !a.startsWith('--') && a !== type);
  return { cmd: clean[0], sub: clean[1], name: clean[2], type, force };
}

function printHelp() {
  console.log(`
  UT CLI  - United Tyres scaffold tool

  Usage:
    node ut-cli.mjs <command> [options]

  Commands:
    generate component <Name> [--type ui|layout|shared] [--force]
    generate page <Name>                                [--force]
    generate all                                        [--force]
    list
    delete component <Name> [--type ui|layout|shared]

  Options:
    --type    Component category (default: ui)
    --force   Overwrite existing files

  Examples:
    node ut-cli.mjs generate component Rating --type shared
    node ut-cli.mjs generate page BlogPage
    node ut-cli.mjs generate all
    node ut-cli.mjs list
`);
}

const { cmd, sub, name, type, force } = parseArgs(process.argv);
console.log(`\n  UT CLI  -> src: ${SRC}`);

if (!cmd || cmd === 'help' || cmd === '--help') { printHelp(); }
else if (cmd === 'list') { listAll(); }
else if (cmd === 'generate' && sub === 'all') { generateAll(force); }
else if (cmd === 'generate' && sub === 'component' && name) { generateComponent(name, type, force); }
else if (cmd === 'generate' && sub === 'page' && name) { generatePage(name, force); }
else if (cmd === 'delete' && sub === 'component' && name) { deleteComponent(name, type); }
else { err('Unknown command. Run: node ut-cli.mjs help'); process.exit(1); }
