const fs = require('fs');
const file = '/home/andu/skill-path/app/(auth)/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Hide role select
content = content.replace(
  /<label[\s\S]*?htmlFor="role"[\s\S]*?<\/select>\s*<\/div>/,
  '<!-- Role select hidden, automatically asserts STUDENT -->'
);

// Fix signUpWithEmail call
content = content.replace(
  /signUpWithEmail\(\s*email,/g,
  'signUpWithEmail(finalEmail,'
);

// Fix e.preventDefault() position
content = content.replace(
  /let finalEmail =[\s\S]*?e\.preventDefault\(\);/m,
  `e.preventDefault();\n    let finalEmail = email.replace(/['"]/g, '').trim().toLowerCase();\n    if (!finalEmail.includes('@')) {\n      finalEmail += '@example.com';\n    }`
);

fs.writeFileSync(file, content);
