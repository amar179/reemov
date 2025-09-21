const fileInput = document.getElementById('fileInput');
const f = e.target.files[0];
if (!f) return;
const reader = new FileReader();
reader.onload = () => {
currentDataUrl = reader.result; // data:*/*;base64,...
origImg.src = currentDataUrl;
removeBtn.disabled = false;
status.textContent = '';
};
reader.readAsDataURL(f);
});


removeBtn.addEventListener('click', async () => {
if (!currentDataUrl) return;
removeBtn.disabled = true;
status.textContent = 'Processing... (may take a few seconds)';


try {
// send base64 to Netlify Function
const payload = { image_b64: currentDataUrl.split(',')[1] };
const resp = await fetch('/.netlify/functions/remove-bg', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload)
});


if (!resp.ok) throw new Error('Server error: ' + resp.status);
const data = await resp.json();
if (data.error) throw new Error(data.error);


// data.result_b64 expected (png)
const imgB64 = data.result_b64;
const img = new Image();
img.onload = () => {
resultCanvas.width = img.width;
resultCanvas.height = img.height;
const ctx = resultCanvas.getContext('2d');
ctx.clearRect(0,0,resultCanvas.width,resultCanvas.height);
ctx.drawImage(img,0,0);
downloadBtn.href = resultCanvas.toDataURL('image/png');
downloadBtn.style.display = 'inline-block';
status.textContent = 'Done!';
removeBtn.disabled = false;
};
img.onerror = (e) => { throw new Error('Result image load failed'); };
img.src = 'data:image/png;base64,' + imgB64;


} catch(err) {
console.error(err);
status.textContent = 'Error: ' + err.message;
removeBtn.disabled = false;
}
});
