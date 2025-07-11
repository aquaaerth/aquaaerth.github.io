async function Go() {
  var ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
  if (ok == true) {
    if (isMobileDevice()) {
      InitLoad();
      <!-- openMetaRedirectPage(htmllink, 3); -->
    } else {
       <!-- InitLoad(); -->
      openMetaRedirectPage(htmllink, 3); 
    }
  } else {
    alert("...Loading Aqua-Earth has been cancelled!");
  }
}

function InitLoad() {
  var link = document.createElement("a");
  link.href = "https://earth.google.com/web/@36.6968476,-102.20716007,-2293.42673403a,12252139.42289114d,35y,0.07477014h,0t,0r/data=CgRCAggBMikKJwolCiExY0JNTkllMkxDaVZZRi10YUlYYmVFUTd5M2F2dHZ6WUcgAToDCgEwQgIIAEoHCNPtlUYQAQ";
  link.target = "_blank";
  link.click();
}

function NotLoad() {
  var link = document.createElement("a");
  link.href = "https://aqua-aerobic.com/";
  link.target = "_blank";
  link.click();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function openMetaRedirectPage(redirectUrl, delaySeconds = 3) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="refresh" content="${delaySeconds};url=${redirectUrl}">
      <title>Redirecting...</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 3rem; }
        h1 { color: #2c3e50; }
      </style>
    </head>
    <body>
      <img src="https://aquavisitorsystem.github.io/aqua.png"><br> 
      <h1>🔄 Loading AQUAEarth AASI Installations...</h1>
      <p>...in ${delaySeconds} seconds.</p>
      <p>If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const features = `
    top=0,left=0,
    width=${screen.availWidth},
    height=${screen.availHeight},
    fullscreen=yes,
    toolbar=no,
    menubar=no,
    scrollbars=no,
    resizable=yes
  `.replace(/\s+/g, '');

  const popup = window.open(url, '_blank', features);

  setTimeout(() => URL.revokeObjectURL(url), (delaySeconds + 10) * 1000);
}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const htmllink = "https://earth.google.com/web/@36.6968476,-102.20716007,-2293.42673403a,12252139.42289114d,35y,0.07477014h,0t,0r/data=CgRCAggBMikKJwolCiExY0JNTkllMkxDaVZZRi10YUlYYmVFUTd5M2F2dHZ6WUcgAToDCgEwQgIIAEoHCNPtlUYQAQ";
