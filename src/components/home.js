import React from 'react';

export function HomePage() {
  return (
    <html>
      <head>
        <title>Lollipop Bazaar</title>
        <style>
          {`
            body {
              font-family: open-sans;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f0f0f0;
            }
            img {
              max-width: 400px;
              margin-bottom: 20px;
            }
          `}
        </style>
      </head>
      <body>
        <img src="./public/images/lollipop_logo.png" alt="Lollipop Logo" />
        <h1>a software bazaar</h1>
        <p>coming soon</p>
      </body>
    </html>
  );
}

export function TimePage({ time }) {
  return (
    <html>
      <head>
        <title>Current Time</title>
      </head>
      <body>
        <h1>Current Time</h1>
        <p>The current time is: {time}</p>
      </body>
    </html>
  );
}
