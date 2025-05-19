  async function Go(){
var ok = confirm("By clicking 'OK', I agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
    if (ok== true){
        InitLoad();
    }else{
        alert("...Loading Aqua-Earth has been cancelled!");
    }
  }
function InitLoad() {
  var link = document.createElement("a")
  link.href = "https://earth.google.com/web/@34.0203263,-87.85906616,-505.00590501a,22252259.66572523d,35y,0h,0t,0r/data=CgRCAggBMikKJwolCiExY0JNTkllMkxDaVZZRi10YUlYYmVFUTd5M2F2dHZ6WUcgAUICCABKCAjaxuGHBxAB"
  link.target = "_blank"
  link.click()
}
  function NotLoad() {
  var link = document.createElement("a")
  link.href = "https://aqua-aerobic.com/"
  link.target = "_blank"
  link.click()
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
