# 📝 My Blog

Welcome to my personal blog!

> This is just a fun little side project — mostly for my own use, experimentation, and learning.

## ⚒️ Tech Stack

This project is built with a mix of tools and frameworks I enjoy working with:

- **Astro** – Lightning-fast static site generation
- **Tailwind CSS** – Utility-first styling
- **SolidJS** – Reactive UI components
- **Svelte** – Because why not have both?
- **Supabase** – Backend-as-a-service
- **GitHub Actions** – CI/CD automation

## 🚧 Development Workflow

Even though it's a solo project, I'm treating it as a chance to experiment with better practices and a more structured workflow.

### 📌 Git Flow

1. Work locally on the `develop` branch
2. `git push origin develop`
3. Open a pull request
4. **Squash & merge** into the `master` branch
5. Checkout `master` locally and pull the changes
6. Merge updated `master` back into `develop`

### 🔒 Branch Protection

The `master` branch is protected with a **"Requires a pull request"** rule, ensuring all changes go through a PR — even if it's just me reviewing my own code.

### ✅ Commit Message Convention

I'm following the [Conventional Commits](https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/) standard:

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
