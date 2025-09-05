# 📝 My Blog

Welcome to my personal blog!

> This is a personal side project — mostly for my own use, experimentation, and learning.

---

## 📂 Project Structure

This repository is organized as a **monorepo** with two main packages:

- **`app`** → An [Astro](https://astro.build/) app that powers the blog
- **`ui-library`** → A [Storybook](https://storybook.js.org/) app that serves as a reusable UI component library, consumed by the `app` package

---

## ⚡ Commands

From the repository root, you can run:

- `npm run astro` → Start the Astro app (`app` package)
- `npm run storybook` → Start Storybook (`ui-library` package)
- `npm run build-ui` → Build the UI library so it can be imported into the blog

---

## 🚧 Development Workflow

### 🔀 Git Flow

1. Work locally on the `develop` branch
2. Push changes: `git push origin develop`
3. Open a Pull Request
4. Merge into the `master` branch
5. Checkout `master` locally and pull updates
6. Merge the updated `master` back into `develop`

### 🛡️ Branch Protection

The `master` branch is protected with a **Pull Request required** rule.  
This ensures all changes go through a PR review.

### 📝 Commit Messages

I’m following the [Conventional Commits](https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/) convention:

```
<type>: <description>
```

| Type     | Description                    |
| -------- | ------------------------------ |
| feat     | A new feature                  |
| fix      | A bug fix                      |
| refactor | Refactored code                |
| docs     | Updates to documentation       |
| test     | Adding or updating tests       |
| content  | Adding or updating MDX content |
