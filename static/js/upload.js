document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseButton = document.getElementById('browseButton');
    const fileList = document.getElementById('fileList');
    const uploadForm = document.getElementById('uploadForm');
    const mergeButton = document.getElementById('mergeButton');
    const progressBar = document.getElementById('progressBar');
    const progressBarInner = progressBar.querySelector('.progress-bar');

    let files = [];

    // Handle drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('dragover');
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
    }

    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles);
    browseButton.addEventListener('click', () => fileInput.click());

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const newFiles = [...dt.files];
        handleFileSelection(newFiles);
    }

    function handleFiles(e) {
        const newFiles = [...e.target.files];
        handleFileSelection(newFiles);
    }

    function handleFileSelection(newFiles) {
        // Validate file type and count
        const validFiles = newFiles.filter(file => file.type === 'application/pdf');
        
        if (validFiles.length !== newFiles.length) {
            alert('Only PDF files are allowed');
            return;
        }

        if (files.length + validFiles.length > 5) {
            alert('Maximum 5 files allowed');
            return;
        }

        files = [...files, ...validFiles];
        updateFileList();
        updateMergeButton();
    }

    function updateFileList() {
        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <span class="remove-file" data-index="${index}">&times;</span>
            `;
            fileList.appendChild(fileItem);
        });

        // Add remove file handlers
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                files.splice(index, 1);
                updateFileList();
                updateMergeButton();
            });
        });
    }

    function updateMergeButton() {
        mergeButton.disabled = files.length === 0;
    }

    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files[]', file);
        });

        progressBar.classList.remove('d-none');
        progressBarInner.style.width = '0%';

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
                onUploadProgress: (progressEvent) => {
                    const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
                    progressBarInner.style.width = percentComplete + '%';
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error merging PDFs');
            }

            // Handle successful response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            // Reset form
            files = [];
            updateFileList();
            updateMergeButton();
            progressBar.classList.add('d-none');
        } catch (error) {
            alert(error.message);
            progressBar.classList.add('d-none');
        }
    });
});
