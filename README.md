# JSX Preview

Preview JSX/TSX elements visually in VS Code without leaving the editor.
No browser or dev server required.

## Usage

1. Open a `.tsx` / `.jsx` file
2. Hover over a JSX element
3. Click the **[JSX Preview]** link
4. A side panel opens with the rendered preview

The preview auto-updates every time you save the file.

## Supported Features

- **HTML elements** — `<div>`, `<button>`, `<input>`, etc.
- **Tailwind CSS** — Uses your project's `tailwind.config.js` (custom colors, themes, etc.)
- **CSS imports** — Styles from `import "./style.css"` are applied
- **npm packages** — Libraries like `react-icons` work out of the box
- **Mixed styling** — Tailwind classes and CSS imports can be used together

## Component Preview with `@preview`

When previewing a component definition file (e.g., `Button.tsx`), you can use the `@preview` directive to specify how it should be rendered.

Single line:
```tsx
// @preview <Button variant="danger">Delete</Button>
export const Button = ({ children, variant = "primary" }: ButtonProps) => {
```

Multi-line:
```tsx
/* @preview
<Card title="User Settings">
  <p>Update your account info</p>
</Card>
*/
export const Card = ({ title, children }: CardProps) => {
```

Props with default values in the code (e.g., `variant = "primary"`) are used as-is — you only need to specify the props you want to override.

If no `@preview` is specified, the JSX block is previewed directly as before.

## Requirements

- `react` and `react-dom` installed in your project
- `tailwindcss` installed for Tailwind support (optional)

## How It Works

Internally uses [esbuild](https://esbuild.github.io/) to bundle the JSX block with its imports, then runs React inside a Webview. This renders components the same way your app does, so styles and components are reflected accurately.

## License

MIT
