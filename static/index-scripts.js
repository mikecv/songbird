// index-scripts.js

console.log('Script loaded...');

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("audioUploadForm");
    const statusDiv = document.getElementById("uploadStatus");
    const playPauseBtn = document.getElementById("playPauseBtn");

    const speedSlider = document.getElementById("speedSlider");
    const speedValue = document.getElementById("speedValue");

    const wavesurfer = WaveSurfer.create({
        container: "#waveform",
        scrollParent: true,
        minPxPerSec: 100,      
        waveColor: "#76c7f0",
        progressColor: "#1DB954",
        cursorColor: "#ff4d4f",
        height: 128,
        responsive: true,
        normalize: true,
        cursorWidth: 2,
        backend: 'WebAudio',
        mediaControls: false,
    });

    // Check for wavesurfer version.
    console.log("WaveSurfer version:", WaveSurfer.VERSION);

    // Handle playback speed changes'
    speedSlider.addEventListener("input", function () {
        const rate = parseFloat(speedSlider.value);
        wavesurfer.setPlaybackRate(rate);
        speedValue.textContent = `${rate.toFixed(2)}×`;
        console.log("Playback rate:", wavesurfer.getPlaybackRate());
    });

    // Zoom control.
    document.getElementById('zoomSlider').addEventListener('input', function(event) {
        var zoomLevel = event.target.value;
        wavesurfer.zoom(zoomLevel);

        // Update the displayed zoom value.
        document.getElementById('zoomValue').textContent = zoomLevel + '×';

    });
    
    // Upload and load audio.
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById("audioFile");
        const file = fileInput.files[0];

        if (!file) {
            statusDiv.innerText = "Please select an audio file to upload.";
            return;
        }

        const formData = new FormData();
        formData.append("audioFile", file);

        try {
            const response = await fetch("/upload_audio", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("Upload failed.");
            }

            const data = await response.json();
            const filename = data.filename;

            statusDiv.innerText = `Uploaded successfully: ${filename}`;

            wavesurfer.load(`/audio?file=${filename}`)
                .then(() => {
                    wavesurfer.once('ready', () => {
                        const rate = parseFloat(speedSlider.value);
                    
                        wavesurfer.setPlaybackRate(rate);
                    });
                })
                .catch(err => console.error("WaveSurfer load error:", err));

        } catch (error) {
            console.error("Error uploading audio:", error);
            statusDiv.innerText = "Error uploading audio.";
        }
    });

    // Play/pause toggle.
    playPauseBtn.addEventListener("click", function () {
        wavesurfer.playPause();
    });
});
