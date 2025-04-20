// index-scripts.js

// Event listener for onload.
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("audioUploadForm");
    const statusDiv = document.getElementById("uploadStatus");
    const playPauseBtn = document.getElementById("playPauseBtn");

    const wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#76c7f0",        // bright aqua
        progressColor: "#1DB954",    // vibrant Spotify green
        cursorColor: "#ff4d4f",      // bold red for contrast
        height: 128,
        responsive: true,
        normalize: true,
        cursorWidth: 2
    });

    // Event listener for upload audio button pressed.
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
                .catch(err => console.error("WaveSurfer load error:", err));

        } catch (error) {
            console.error("Error uploading audio:", error);
            statusDiv.innerText = "Error uploading audio.";
        }
    });

    playPauseBtn.addEventListener("click", function () {
        wavesurfer.playPause();
    });
});
