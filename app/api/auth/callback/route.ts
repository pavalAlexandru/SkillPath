import { NextResponse } from 'next/server';
import { createClient } from '@/server/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Return an HTML page that closes itself and notifies the user
      return new NextResponse(
        `
        <html>
          <head>
            <title>Email verificat!</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f8fafc; color: #0f172a; text-align: center; padding: 20px; }
              .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; }
              h1 { color: #4f46e5; font-size: 24px; margin-bottom: 16px; }
              p { color: #64748b; line-height: 1.5; }
              .spinner { margin: 0 auto 20px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <h1>Email verificat cu succes!</h1>
              <p>Te poți întoarce la tab-ul inițial unde vei fi conectat automat.</p>
              <p style="font-size: 14px; margin-top: 24px; color: #94a3b8;">Acest tab se va închide automat în câteva secunde...</p>
            </div>
            <script>
              setTimeout(() => {
                window.close();
              }, 4000);
            </script>
          </body>
        </html>
        `,
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }
  }

  // Fallback to login with error
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
