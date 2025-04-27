document.addEventListener("DOMContentLoaded", function () {
    const playPauseBtn = document.getElementById("playPauseButton");
    const rewindBtn = document.getElementById("rewindButton");
    const form = document.getElementById("audioUploadForm");  // Define the form variable
    const statusDiv = document.getElementById("uploadStatus");  // Define the status div
    const speedSlider = document.getElementById("speedSlider"); // Define the speedSlider variable
    const zoomSlider = document.getElementById("zoomSlider"); // Define the zoomSlider variable
    const speedValue = document.getElementById("speedValue"); // Define the speedValue element
    const zoomValue = document.getElementById("zoomValue"); // Define the zoomValue element

    // Disable the rewind button by default
    rewindBtn.disabled = true;

    // Check if buttons are properly selected
    if (!playPauseBtn || !rewindBtn || !form || !statusDiv || !speedSlider || !zoomSlider || !speedValue || !zoomValue) {
        console.error('One or more elements not found.');
        return; // Exit if any element is not found
    }

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#76c7f0',
        progressColor: '#1DB954',
        cursorColor: '#000000',
        height: 128,
        normalize: true,
        backend: 'WebAudio',
        mediaControls: false,
        plugins: [
            WaveSurfer.regions.create(),
            WaveSurfer.timeline.create({
                container: '#timeline'
            })
        ]
    });

    wavesurfer.on('ready', () => {
        console.log('WaveSurfer is ready, adding regions now.');
        if (wavesurfer.regions) {
            console.log('Regions plugin initialized successfully.');

            const region = wavesurfer.regions.add({
                start: 5,
                end: 15,
                color: 'rgba(243, 37, 30, 0.3)',
                drag: true,
                resize: true,
            });

            const regionId = region.id;
            console.log('Region created:', region);
        } else {
            console.error("Regions plugin not initialized.");
        }
    });

    // File upload handler
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        try {
            const response = await fetch("/upload_audio", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const result = await response.json();
            statusDiv.textContent = `✅ Uploaded: ${result.filename}`;
            wavesurfer.load(result.url);
        } catch (error) {
            console.error("Upload failed:", error);
            statusDiv.textContent = "❌ Upload failed.";
        }
    });

    // Assuming you have a wavesurfer instance
    wavesurfer.on('play', () => {
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.add('paused');
        playPauseBtn.classList.remove('playing');

        // Disable the rewind button when the audio is playing (unless it's at the end).
        if (wavesurfer.getCurrentTime() < wavesurfer.getDuration()) {
            rewindBtn.disabled = true;
        }
    });

    wavesurfer.on('pause', () => {
        // Enable the rewind button if the audio is paused (even if it's not at the end)
        if (wavesurfer.getCurrentTime() < wavesurfer.getDuration()) {
            rewindBtn.disabled = false;
        }
        playPauseBtn.textContent = 'Play';
        playPauseBtn.classList.remove('paused');
        playPauseBtn.classList.add('playing');
      });

    // Listen to when the audio reaches the end
    wavesurfer.on('finish', () => {
        // Enable the rewind button when the audio finishes.
        rewindBtn.disabled = false;
    });
        
    // Play or pause button
    playPauseBtn.addEventListener("click", () => {
        wavesurfer.playPause();
    });

    // Rewind button
    rewindBtn.addEventListener("click", () => {
        wavesurfer.seekTo(0);

        if (!rewindBtn.disabled) {
            wavesurfer.seekTo(0);
        }        
    });

    // Speed control slider (ensure it goes from 0.5 to 1).
    speedSlider.addEventListener("input", (e) => {
        let rate = parseFloat(e.target.value);
        // Ensure the rate doesn't go beyond 1 (no faster than normal speed).
        if (rate > 1) rate = 1; // Cap at 1 (normal speed)
        wavesurfer.setPlaybackRate(rate);
        speedValue.textContent = `${rate.toFixed(1)}×`;
    });

    // Zoom control slider
    zoomSlider.addEventListener("input", (e) => {
        const zoomLevel = parseInt(e.target.value, 10);
        wavesurfer.zoom(zoomLevel);
        zoomValue.textContent = `${(zoomLevel / 100).toFixed(1)}×`;
        const labelInterval = zoomLevel >= 200 ? 1 : 2;
        wavesurfer.timeline.update({
            primaryLabelInterval: labelInterval
        });
    });
});
