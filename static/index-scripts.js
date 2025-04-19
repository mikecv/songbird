// Javascript UI functions.

// Listener for button to load sound file.
document.getElementById("audioUploadForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById("audioFile");
    if (!fileInput.files.length) {
        document.getElementById("uploadStatus").innerText = "Please select a file first.";
        return;
    }

    const formData = new FormData();
    formData.append("audioFile", fileInput.files[0]);

    try {
        const response = await fetch("/upload-audio", {
            method: "POST",
            body: formData
        });

        const result = await response.text();
        document.getElementById("uploadStatus").innerText = result;
    } catch (error) {
        document.getElementById("uploadStatus").innerText = "Upload failed.";
        console.error(error);
    }
});
