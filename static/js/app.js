document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    const imageLinkElement = document.getElementById('imageLink');
    const errorDiv = document.getElementById('error');
    const dropZone = document.querySelector('label[for="imageInput"]');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = imageInput.files[0];
        if (!file) {
            showError('Please select an image file.');
            return;
        }

        const selectedService = document.querySelector('input[name="uploadService"]:checked').value;
        await uploadFile(file, selectedService);
    });

    function showResult(link, service) {
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

    async function uploadFile(file, service) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('service', service);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showResult(data.link, data.service);
            } else {
                showError(data.error || 'An error occurred while uploading the image.');
            }
        } catch (error) {
            showError('An error occurred while uploading the image.');
        }
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                imageInput.files = files;
            } else {
                showError('Please select an image file.');
            }
        }
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
