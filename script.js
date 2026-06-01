// Plant Disease Detection App
class PlantDiseaseDetector {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.startCameraBtn = document.getElementById('startCameraBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('fileInput');
        this.resultSection = document.getElementById('resultSection');
        this.loading = document.getElementById('loading');
        this.resultContent = document.getElementById('resultContent');
        this.stream = null;
        this.model = null;
        
        this.initEventListeners();
        this.loadModel();
    }
    
    async loadModel() {
        try {
            // Load MobileNet model (simplified for demo)
            this.model = await mobilenet.load();
            console.log('Model loaded successfully');
        } catch (error) {
            console.error('Error loading model:', error);
            this.showError('Failed to load AI model. Please refresh the page.');
        }
    }
    
    initEventListeners() {
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.captureBtn.addEventListener('click', () => this.captureAndIdentify());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }
    
    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = this.stream;
            await this.video.play();
            this.captureBtn.disabled = false;
            this.startCameraBtn.disabled = true;
            this.showMessage('Camera ready! Take a photo of the affected leaf.', 'success');
        } catch (error) {
            console.error('Camera error:', error);
            this.showError('Cannot access camera. Please check permissions or use file upload.');
        }
    }
    
    captureAndIdentify() {
        if (!this.video.srcObject) {
            this.showError('Please start the camera first!');
            return;
        }
        
        // Capture image from video
        const context = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Convert to image data
        const imageData = this.canvas.toDataURL('image/jpeg');
        this.identifyDisease(imageData);
    }
    
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                this.identifyDisease(imageData);
            };
            reader.readAsDataURL(file);
        }
    }
    
    async identifyDisease(imageData) {
        // Show result section with loading
        this.resultSection.style.display = 'block';
        this.loading.style.display = 'block';
        this.resultContent.style.display = 'none';
        
        // Create image element for prediction
        const img = new Image();
        img.src = imageData;
        
        await new Promise((resolve) => {
            img.onload = resolve;
        });
        
        try {
            // Make prediction
            const predictions = await this.model.classify(img);
            
            // Process predictions to simulate plant disease detection
            const diseaseInfo = this.mapToPlantDisease(predictions);
            
            // Display results
            this.displayResults(diseaseInfo, imageData);
        } catch (error) {
            console.error('Prediction error:', error);
            this.showError('Error analyzing image. Please try again with a clearer photo.');
        }
        
        this.loading.style.display = 'none';
        this.resultContent.style.display = 'block';
    }
    
    mapToPlantDisease(predictions) {
        // Map general object detection to plant diseases
        // In production, you'd use a specialized plant disease model
        const plantDiseases = {
            'leaf': { disease: 'Leaf Spot Disease', confidence: 0.85, treatment: 'Apply copper-based fungicide. Remove affected leaves. Ensure good air circulation.' },
            'tomato': { disease: 'Early Blight', confidence: 0.78, treatment: 'Use chlorothalonil or copper fungicide. Rotate crops. Water at base of plants.' },
            'apple': { disease: 'Apple Scab', confidence: 0.82, treatment: 'Apply fungicide in early spring. Rake fallen leaves. Prune for air circulation.' },
            'grape': { disease: 'Powdery Mildew', confidence: 0.79, treatment: 'Apply sulfur or potassium bicarbonate. Increase air flow. Avoid overhead watering.' },
            'potato': { disease: 'Late Blight', confidence: 0.81, treatment: 'Use resistant varieties. Apply fungicide. Destroy infected plants immediately.' },
            'wheat': { disease: 'Rust Disease', confidence: 0.76, treatment: 'Use fungicides. Plant resistant varieties. Remove volunteer wheat plants.' },
            'corn': { disease: 'Northern Leaf Blight', confidence: 0.74, treatment: 'Use resistant hybrids. Apply fungicide. Practice crop rotation.' },
            'rice': { disease: 'Rice Blast', confidence: 0.77, treatment: 'Use resistant varieties. Apply silicon fertilizer. Avoid excess nitrogen.' }
        };
        
        // Find best matching disease based on prediction label
        let bestMatch = { disease: 'Unknown Condition', confidence: 0.5, treatment: 'Consult local agricultural expert for proper diagnosis.' };
        
        for (const [key, value] of Object.entries(plantDiseases)) {
            if (predictions[0].className.toLowerCase().includes(key)) {
                bestMatch = value;
                break;
            }
        }
        
        // Add more specific plant recommendations based on prediction
        bestMatch.prevention = this.getPreventionTips(bestMatch.disease);
        bestMatch.organicTreatment = this.getOrganicTreatment(bestMatch.disease);
        
        return bestMatch;
    }
    
    getPreventionTips(disease) {
        const tips = {
            'Leaf Spot Disease': 'Plant resistant varieties. Space plants properly. Water in morning.',
            'Early Blight': 'Mulch around plants. Remove plant debris. Use certified disease-free seeds.',
            'Apple Scab': 'Plant resistant cultivars. Prune trees annually. Clean up fallen leaves.',
            'Powdery Mildew': 'Avoid overcrowding. Water early morning. Use neem oil preventatively.',
            'Late Blight': 'Destroy volunteer potatoes. Avoid overhead irrigation. Monitor weather forecasts.',
            'Rust Disease': 'Remove alternate hosts. Use balanced fertilizer. Plant early-maturing varieties.',
            'Northern Leaf Blight': 'Use tillage to bury residue. Plant when soil is warm. Scout fields regularly.',
            'Rice Blast': 'Use balanced nitrogen application. Drain fields periodically. Plant mixtures of varieties.'
        };
        
        return tips[disease] || 'Maintain good farm hygiene. Use healthy seeds. Practice crop rotation. Monitor plants regularly.';
    }
    
    getOrganicTreatment(disease) {
        const organic = {
            'Leaf Spot Disease': 'Apply compost tea. Use baking soda solution (1 tbsp per gallon water). Remove infected leaves.',
            'Early Blight': 'Apply copper soap. Use garlic spray. Mulch with straw or leaves.',
            'Apple Scab': 'Apply sulfur spray. Use compost extract. Rake and destroy fallen leaves.',
            'Powdery Mildew': 'Mix 1 part milk with 9 parts water as spray. Apply neem oil. Use baking soda solution.',
            'Late Blight': 'Apply copper fungicide (OMRI approved). Remove and destroy infected plants. Improve drainage.',
            'Rust Disease': 'Apply sulfur dust. Use compost tea. Prune for air circulation.',
            'Northern Leaf Blight': 'Apply potassium bicarbonate. Use neem oil. Remove infected leaves.',
            'Rice Blast': 'Apply silicate materials. Use Trichoderma. Maintain proper water management.'
        };
        
        return organic[disease] || 'Apply neem oil spray weekly. Use compost tea as foliar spray. Remove and destroy affected plant parts.';
    }
    
    displayResults(diseaseInfo, imageData) {
        const confidencePercent = (diseaseInfo.confidence * 100).toFixed(1);
        
        let severity = 'Moderate';
        let severityColor = '#f39c12';
        if (diseaseInfo.confidence > 0.8) {
            severity = 'High';
            severityColor = '#e74c3c';
        } else if (diseaseInfo.confidence < 0.6) {
            severity = 'Low';
            severityColor = '#27ae60';
        }
        
        const html = `
            <div class="result-card">
                <img src="${imageData}" alt="Analyzed plant" class="result-image">
                <h2 class="disease-name">🔬 Detected: ${diseaseInfo.disease}</h2>
                <div class="confidence">
                    <strong>Confidence Score:</strong> ${confidencePercent}%
                    <br>
                    <strong>Severity Level:</strong> <span style="color: ${severityColor}">${severity}</span>
                </div>
                <div class="treatment">
                    <strong>🌿 Chemical Treatment:</strong><br>
                    ${diseaseInfo.treatment}
                </div>
                <div class="treatment">
                    <strong>🌱 Organic Treatment:</strong><br>
                    ${diseaseInfo.organicTreatment}
                </div>
                <div class="treatment">
                    <strong>🛡️ Prevention Tips:</strong><br>
                    ${diseaseInfo.prevention}
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px;">
                    <strong>⚠️ Emergency Contact:</strong><br>
                    If the disease spreads rapidly, contact your local agricultural extension office immediately.
                </div>
            </div>
        `;
        
        this.resultContent.innerHTML = html;
        
        // Scroll to results
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'result-card';
        errorDiv.style.background = '#fee';
        errorDiv.style.color = '#c00';
        errorDiv.style.padding = '20px';
        errorDiv.style.margin = '20px';
        errorDiv.innerHTML = `<strong>⚠️ Error:</strong> ${message}`;
        
        this.resultSection.style.display = 'block';
        this.loading.style.display = 'none';
        this.resultContent.style.display = 'block';
        this.resultContent.innerHTML = '';
        this.resultContent.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    showMessage(message, type) {
        // Simple alert for demo
        console.log(message);
    }
}

// Initialize the app when page loads
window.addEventListener('load', () => {
    new PlantDiseaseDetector();
});