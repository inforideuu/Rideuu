const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'dist', 'client');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Write a redirect index.html
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rideuu Driver</title>
  <style>
    body {
      background-color: #090d16;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .loader {
      border: 4px solid rgba(255, 255, 255, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #facc15;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    p {
      margin-top: 16px;
      font-size: 14px;
      font-weight: 600;
      color: #a0aec0;
    }
  </style>
  <script>
    // In Capacitor, redirect to the hosted server URL.
    // If running in local dev/testing, default to the local machine ip/localhost.
    // Replace with your actual live production URL when deploying.
    const LIVE_URL = "https://rideuu-riderapp.vercel.app"; // Replace with live production URL when deploying.
    window.location.href = LIVE_URL;
  </script>
</head>
<body>
  <div class="loader"></div>
  <p>Connecting to Rideuu...</p>
</body>
</html>`;

fs.writeFileSync(path.join(dir, 'index.html'), htmlContent);
console.log('Generated Capacitor entrypoint index.html in dist/client');
