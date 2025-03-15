import { injectable } from 'inversify';

@injectable()
export class DefaultService {
  public renderString (): string {
    return `<!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HotSpring</title>
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            }
    
            html, body {
                height: 100%;
                width: 100%;
                background:#f7fcfa;
                color: #333;
            }
    
            .container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                padding: 0 2rem;
                max-width: 800px;
                margin: 0 auto;
            }
    
            .logo {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 2rem;
                position: relative;
            }
    
            .logo svg {
                height: 140px;
                width: 140px;
            }
    
            @keyframes pulse {
                0% {
                    transform: scale(0.95);
                    opacity: 0.7;
                }
                50% {
                    transform: scale(1.05);
                    opacity: 0.9;
                }
                100% {
                    transform: scale(0.95);
                    opacity: 0.7;
                }
            }
    
            h1 {
                font-size: 3.5rem;
                font-weight: 700;
                margin-bottom: 1rem;
                text-align: center;
                background: linear-gradient(90deg, #FF6B6B, #FF8E53);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
    
            p {
                font-size: 1rem;
                line-height: 1.6;
                color: #666;
                text-align: center;
            }
    
            @media (max-width: 600px) {
                h1 {
                    font-size: 2.5rem;
                }
                
                p {
                    font-size: 1.2rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path fill="none" stroke="#FF6B6B" stroke-linecap="round" stroke-linejoin="round" d="M27.4 43.5c-7.1-.1-12.8-5.7-13.1-12.7q0-1.65.3-3.3c.2-1.2.7-2.3 1.2-3.4c.3-.6.6-1.3.7-2c.1-.3.1-.6.1-.9c0-2.8-2.2-5.2-5.1-5.2c-2.1 0-4 1.2-4.8 3.2c-.2-.9-.4-1.9-.3-2.9c-.3-6.4 4.7-11.7 11-12c6.4-.3 11.7 4.7 12 11v.5c.1 2.6-.7 5.2-2.2 7.3c-1.8 2.8-3.9 5.4-3.9 9c0 5 3.2 9.5 8 11c-1.3.3-2.6.4-3.9.4m13.4-13.1c-2.3 1-3.4 3.8-2.3 6.1c.1.3.3.5.4.7c-1.4 2.2-3.4 4-5.7 5.1c-2.5-3.4-1.7-8.2 1.8-10.7c1.3-.9 2.9-1.4 4.5-1.4c.4 0 .9 0 1.3.2m.7-7.8c-.2 1.2-.6 2.3-1.3 3.2c-.7-2-1.8-3.8-3.3-5.2c-.4-.4-.8-.7-1.2-1h0c-2.1-1.5-3.3-3.9-3.3-6.5c0-.8.1-1.6.3-2.3c.4 1.3 1.2 2.5 2.4 3.2l.9.6l1.4.6h0c1-1.2 1.6-2.8 1.8-4.3c1.1 1.8 1.2 3.9.5 5.9h0c1.3 1.2 2.1 2.9 1.9 4.7c0 .4 0 .8-.1 1.1" stroke-width="1"/><circle cx="33.7" cy="21.5" r=".8" fill="currentColor"/></svg>
            </div>
    
            <h1>Welcome to HotSpring</h1>
            <p>Get started by editing src/controller/DefaultController.ts</p>
        </div>
    </body>
    </html>`;
  }
}
