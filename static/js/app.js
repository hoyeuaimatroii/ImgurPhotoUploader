document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    const imgurLinkElement = document.getElementById('imgurLink');
    const errorDiv = document.getElementById('error');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = imageInput.files[0];
        if (!file) {
            showError('Please select an image file.');
            return;
        }

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

    // Preview image on selection
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.classList.add('w-full', 'h-64', 'object-cover', 'rounded-lg');
                const dropZone = document.querySelector('label[for="imageInput"]');
                dropZone.innerHTML = '';
                dropZone.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
});
