const fs = require('fs');
const file = '/home/andu/skill-path/unit-tests/components.test.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('vi.mock("next/navigation"')) {
  content = `import { vi } from "vitest";\nvi.mock("next/navigation", () => ({\n  useRouter: () => ({ push: vi.fn() })\n}));\n` + content;
  fs.writeFileSync(file, content);
}
