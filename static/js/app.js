document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    const imageLinkElement = document.getElementById('imageLink');
    const errorDiv = document.getElementById('error');
    const dropZone = document.querySelector('label[for="imageInput"]');
    const imagePreviewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('uploadProgress');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = imageInput.files[0];
        if (!file) {
            showError('Please select an image file.');
            return;
        }

        const selectedService = document.querySelector('input[name="uploadService"]:checked').value;
        try {
            const result = await uploadFile(file, selectedService);
            showResult(result.link, result.image_url, result.service);
        } catch (error) {
            showError(error.message || 'An error occurred while uploading the image.');
        }
    });

    function showResult(link, imageUrl, service) {
        resultDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        imageLinkElement.href = link;
        imageLinkElement.textContent = `${service.charAt(0).toUpperCase() + service.slice(1)} Link: ${link}`;
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
            formData.append('image', file);
            formData.append('service', service);

            xhr.open('POST', '/upload', true);
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    updateProgressBar(percentComplete);
                }
            };
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.statusText));
                }
            };
            xhr.onerror = () => reject(new Error('Network error occurred'));
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
            if (file.type.startsWith('image/')) {
                imageInput.files = files;
                previewImage(file);
            } else {
                showError('Please select an image file.');
            }
        }
    }

    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreviewDiv.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }

    // File input change event
    imageInput.addEventListener('change', (e) => {
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
