const fs = require('fs');
const file = '/home/andu/skill-path/app/(auth)/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Hide role select
content = content.replace(
  /<label htmlFor="role" className="block text-sm font-medium text-slate-700">Rol<\/label>[\s\S]*?<\/select>\s*<\/div>/,
  '<!-- Role select hidden, automatically asserts STUDENT -->'
);

// Change type="email" to type="text"
content = content.replace(/type="email"/g, 'type="text"');

// Sanitize email in handleSubmit
content = content.replace(
  'const handleSubmit = async (e: React.FormEvent) => {',
  `const handleSubmit = async (e: React.FormEvent) => {
    let finalEmail = email.replace(/['"]/g, '').trim().toLowerCase();
    if (!finalEmail.includes('@')) {
      finalEmail += '@example.com';
    }`
);

// Use finalEmail instead of email
content = content.replace(/signUpWithEmail\(email,/g, 'signUpWithEmail(finalEmail,');
content = content.replace(/signInWithEmail\(email,/g, 'signInWithEmail(finalEmail,');

fs.writeFileSync(file, content);
