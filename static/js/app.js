document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    const imgurLinkElement = document.getElementById('imgurLink');
    const errorDiv = document.getElementById('error');
    const dropZone = document.querySelector('label[for="imageInput"]');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = imageInput.files[0];
        if (!file) {
            showError('Please select an image file.');
            return;
        }

        await uploadFile(file);
    });

    function showResult(link) {
        resultDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        imgurLinkElement.href = link;
        imgurLinkElement.textContent = link;
    }

    function showError(message) {
        errorDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
        errorDiv.textContent = message;
    }

    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showResult(data.link);
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
                previewImage(file);
                imageInput.files = files;
            } else {
                showError('Please select an image file.');
            }
        }
    }

    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.classList.add('w-full', 'h-64', 'object-cover', 'rounded-lg');
            dropZone.innerHTML = '';
            dropZone.appendChild(img);
        };
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
