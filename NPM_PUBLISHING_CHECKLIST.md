# NPM Publishing Checklist for AutoArtifacts

This document outlines all the steps needed to prepare AutoArtifacts for publication as an npm package.

## 📋 Pre-Publishing Setup

### 1. Update `package.json`

**Location:** `/package.json`

**Changes needed:**
- Update `version` from `0.0.1` to `0.1.0` (or `1.0.0` for first stable release)
- Update `description` to be more detailed
- Change `main` from `"index.js"` to `"dist/index.js"`
- Add `"module": "dist/index.esm.js"` for ES modules support
- Add `"types": "dist/index.d.ts"` for TypeScript support
- Add `"files": ["dist", "README.md", "LICENSE"]` to specify what gets published
- Add `keywords` array for npm search discoverability
- Update `author` with your name and email
- Change `license` from `"ISC"` to `"MIT"` (or your preference)
- Add `repository`, `bugs`, and `homepage` URLs (your GitHub repo)
- Move `react` and `react-dom` from `dependencies` to `peerDependencies`
- Keep ProseMirror packages in `dependencies`
- Move `@types/react` and `@types/react-dom` to `devDependencies`
- Add build-related packages to `devDependencies`:
  - `rollup`
  - `@rollup/plugin-commonjs`
  - `@rollup/plugin-node-resolve`
  - `@rollup/plugin-typescript`
  - `rollup-plugin-peer-deps-external`
  - `rollup-plugin-postcss`
  - `typescript`
- Update `scripts` section:
  - Add `"build": "rollup -c"`
  - Add `"prepublishOnly": "npm run build"`

**Example final structure:**
```json
{
  "name": "autoartifacts",
  "version": "0.1.0",
  "description": "A powerful slide editor component built with ProseMirror for creating rich, interactive presentations",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE"],
  "keywords": ["editor", "slides", "presentation", "prosemirror", "react", "wysiwyg", "rich-text"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/autoartifacts.git"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "prosemirror-commands": "^1.7.1",
    "prosemirror-history": "^1.4.1",
    "prosemirror-keymap": "^1.2.3",
    "prosemirror-model": "^1.25.3",
    "prosemirror-schema-basic": "^1.2.4",
    "prosemirror-state": "^1.4.3",
    "prosemirror-view": "^1.41.2"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^28.0.2",
    "@rollup/plugin-node-resolve": "^15.3.2",
    "@rollup/plugin-typescript": "^12.1.2",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "rollup": "^4.30.1",
    "rollup-plugin-peer-deps-external": "^2.2.4",
    "rollup-plugin-postcss": "^4.0.2",
    "typescript": "^5.8.0"
  }
}
```

---

### 2. Create `rollup.config.js`

**Location:** `/rollup.config.js` (root directory)

**Purpose:** Configures how your TypeScript source code gets compiled into distributable JavaScript

**Content:**
```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      exclude: ['**/*.test.ts', '**/*.test.tsx', 'demo/**']
    }),
    postcss({
      extract: true,
      minimize: true,
      modules: false
    })
  ],
  external: ['react', 'react-dom']
};
```

---

### 3. Create/Update `tsconfig.json`

**Location:** `/tsconfig.json` (root directory, separate from demo's tsconfig)

**Purpose:** TypeScript compiler configuration for the package build

**Content:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "demo"]
}
```

---

### 4. Create `.npmignore`

**Location:** `/.npmignore` (root directory)

**Purpose:** Tells npm what files NOT to include in the published package (different from .gitignore)

**Content:**
```
# Source files (users only need compiled dist)
src/
tsconfig.json
rollup.config.js

# Demo application
demo/

# Development files
.vscode/
.git/
.gitignore
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx

# Config files
.eslintrc
.eslintrc.js
.eslintrc.json
.prettierrc
.prettierrc.js
.prettierrc.json

# Documentation (keep README.md, exclude others)
NPM_PUBLISHING_CHECKLIST.md
IMPLEMENTATION_SUMMARY.md
plan.md

# CI/CD
.github/
.gitlab-ci.yml
.travis.yml

# Misc
.DS_Store
*.log
```

---

### 5. Create `LICENSE`

**Location:** `/LICENSE` (root directory)

**Purpose:** Legal license for your package (MIT is most common for open source)

**Content (MIT License):**
```
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### 6. Update `README.md`

**Location:** `/README.md`

**Changes needed:**
- Add installation instructions: `npm install autoartifacts`
- Add import statement with CSS: `import 'autoartifacts/dist/styles.css'`
- Clarify this is the main package README (not demo)
- Add badges (optional but professional):
  - npm version badge
  - npm downloads badge
  - license badge
  - build status badge (if you set up CI/CD)

**Add to top of README:**
```markdown
# AutoArtifacts

[![npm version](https://badge.fury.io/js/autoartifacts.svg)](https://www.npmjs.com/package/autoartifacts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful slide editor component built with ProseMirror for creating rich, interactive presentations.

## Installation

```bash
npm install autoartifacts
# or
yarn add autoartifacts
# or
pnpm add autoartifacts
```

## Usage

```tsx
import { SlideEditor } from 'autoartifacts';
import 'autoartifacts/dist/styles.css'; // Important: Import styles

function MyApp() {
  return (
    <SlideEditor
      content={myContent}
      slideTheme="dark"
      onChange={(json) => console.log('Updated:', json)}
    />
  );
}
```
```

---

### 7. Verify `.gitignore`

**Location:** `/.gitignore`

**Verify it includes:**
- ✅ `dist/` (already there)
- ✅ `node_modules/` (already there)
- ✅ `demo/` (already there)

**Your current .gitignore looks good!**

---

## 🔧 Installation & Build Testing

### 8. Install Build Dependencies

**Commands to run:**
```bash
npm install --save-dev rollup @rollup/plugin-commonjs @rollup/plugin-node-resolve @rollup/plugin-typescript rollup-plugin-peer-deps-external rollup-plugin-postcss typescript
```

---

### 9. Test the Build Process

**Commands to run:**
```bash
# Build the package
npm run build

# Verify dist/ folder was created with:
# - index.js (CommonJS)
# - index.esm.js (ES modules)
# - index.d.ts (TypeScript definitions)
# - styles.css (extracted CSS)
```

**What to check:**
- `dist/` folder should be created
- Should contain `.js`, `.esm.js`, `.d.ts`, and `.css` files
- No errors during build
- File sizes are reasonable (not bloated)

---

### 10. Test Package Locally

**Commands to run:**
```bash
# In autoartifacts directory
npm pack --dry-run

# This shows you exactly what files will be published
# Verify only dist/, README.md, LICENSE, and package.json are included
```

**To test in a real project:**
```bash
# In autoartifacts directory
npm link

# In a test React project
npm link autoartifacts

# Try importing and using the component
# If it works, you're ready!
```

---

## 🚀 Publishing to NPM

### 11. Create NPM Account

**Steps:**
1. Go to https://www.npmjs.com/signup
2. Create an account
3. Verify your email

---

### 12. Login to NPM CLI

**Command to run:**
```bash
npm login
```

**Enter your:**
- Username
- Password
- Email
- OTP (if you have 2FA enabled)

---

### 13. Check Package Name Availability

**Command to run:**
```bash
npm search autoartifacts
```

**Or visit:**
- https://www.npmjs.com/package/autoartifacts

**If taken, you'll need to:**
- Choose a different name (update `name` in package.json)
- Or use a scoped package: `@yourusername/autoartifacts`

---

### 14. Publish to NPM

**Commands to run:**
```bash
# Final build
npm run build

# Publish (first time)
npm publish

# If using a scoped package
npm publish --access public
```

---

### 15. Verify Publication

**After publishing:**
1. Visit: https://www.npmjs.com/package/autoartifacts
2. Check that your package appears
3. Verify README displays correctly
4. Test installation in a new project:
   ```bash
   npx create-react-app test-app
   cd test-app
   npm install autoartifacts
   ```

---

## 🔄 Future Updates

### 16. Versioning Strategy

**For updates, use semantic versioning:**

```bash
# Bug fixes (0.1.0 -> 0.1.1)
npm version patch
npm publish

# New features (0.1.0 -> 0.2.0)
npm version minor
npm publish

# Breaking changes (0.1.0 -> 1.0.0)
npm version major
npm publish
```

**Version bumps automatically:**
- Updates package.json
- Creates a git commit
- Creates a git tag

---

## ✅ Final Checklist Before Publishing

- [ ] All configuration files created (rollup.config.js, tsconfig.json, .npmignore, LICENSE)
- [ ] package.json updated with all required fields
- [ ] README.md updated with installation instructions
- [ ] `npm run build` completes successfully
- [ ] `npm pack --dry-run` shows correct files
- [ ] `npm link` + local testing works
- [ ] NPM account created and verified
- [ ] Logged into NPM CLI
- [ ] Package name is available
- [ ] Git repository is clean (all changes committed)
- [ ] Ready to run `npm publish`!

---

## 📚 Additional Resources

- **NPM Documentation:** https://docs.npmjs.com/
- **Rollup Documentation:** https://rollupjs.org/
- **Semantic Versioning:** https://semver.org/
- **Creating a TypeScript Library:** https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html

---

## 🎯 Post-Publishing TODO

After successful publication:
1. Update main README with npm badge showing it's published
2. Add GitHub topics/tags for discoverability
3. Consider setting up:
   - GitHub Actions for automated testing
   - Automated changelog generation
   - Automated releases
4. Share on:
   - Twitter/X
   - Reddit (r/reactjs, r/javascript)
   - Dev.to
   - Your blog/website

---

**Good luck with your launch! 🚀**
