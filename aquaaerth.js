  async function Go(){
var ok = confirm("By clicking 'OK', you agree not to share this program or any of its files with anyone outside of Aqua-Aerobic Systems, Inc.");
    if (ok== true){
        InitLoad();
    }else{
        alert("...Loading Aqua-Earth has been cancelled!");
    }
  }
function InitLoad() {
  var link = document.createElement("a")
  link.href = "https://earth.google.com/web/@36.6968476,-102.20716007,-2293.42673403a,12252139.42289114d,35y,0.07477014h,0t,0r/data=CgRCAggBMikKJwolCiExY0JNTkllMkxDaVZZRi10YUlYYmVFUTd5M2F2dHZ6WUcgAToDCgEwQgIIAEoHCNPtlUYQAQ"
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
