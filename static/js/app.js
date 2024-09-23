document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const fileLinkElement = document.getElementById('fileLink');
    const errorDiv = document.getElementById('error');
    const dropZone = document.querySelector('label[for="fileInput"]');
    const filePreviewDiv = document.getElementById('filePreview');
    const previewImg = document.getElementById('previewImg');
    const previewVideo = document.getElementById('previewVideo');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('uploadProgress');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            showError('Please select a file.');
            return;
        }

        const selectedService = document.querySelector('input[name="uploadService"]:checked').value;
        try {
            const result = await uploadFile(file, selectedService);
            showResult(result.link, result.service);
        } catch (error) {
            showError(error.message || 'An error occurred while uploading the file.');
        }
    });

    function showResult(link, service) {
        resultDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        fileLinkElement.href = link;
        fileLinkElement.textContent = `${service.charAt(0).toUpperCase() + service.slice(1)} Link: ${link}`;
    }

    function showError(message) {
        errorDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
        errorDiv.textContent = message;
    }

    function uploadFile(file, service) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', file);
            formData.append('service', service);

            console.log(`Uploading file: ${file.name}`);
            console.log(`File details:`);
            console.log(`- Type: ${file.type}`);
            console.log(`- Size: ${file.size} bytes`);
            console.log(`- Last Modified: ${new Date(file.lastModified).toLocaleString()}`);
            console.log(`Selected Service: ${service}`);

            xhr.open('POST', '/upload', true);
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    updateProgressBar(percentComplete);
                    console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
                }
            };
            xhr.onload = () => {
                if (xhr.status === 200) {
                    console.log(`Upload successful. Response: ${xhr.responseText}`);
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    console.error(`Upload failed. Status: ${xhr.status}, Response: ${xhr.responseText}`);
                    reject(new Error(xhr.responseText));
                }
            };
            xhr.onerror = () => {
                console.error('Network error occurred during upload');
                reject(new Error('Network error occurred'));
            }
            xhr.send(formData);
        });
    }

    function updateProgressBar(percentage) {
        progressBarContainer.classList.remove('hidden');
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${percentage.toFixed(2)}%`;
        if (percentage === 100) {
            setTimeout(() => {
                progressBarContainer.classList.add('hidden');
            }, 1000);
        }
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            fileInput.files = files;
            previewFile(file);
        }
    }

    function previewFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (file.type.startsWith('image/')) {
                previewImg.src = e.target.result;
                previewImg.classList.remove('hidden');
                previewVideo.classList.add('hidden');
            } else if (file.type.startsWith('video/')) {
                previewVideo.src = e.target.result;
                previewVideo.classList.remove('hidden');
                previewImg.classList.add('hidden');
            }
            filePreviewDiv.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }

    // File input change event
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('bg-gray-200');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('bg-gray-200');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-gray-200');
        handleFiles(e.dataTransfer.files);
    });
});
