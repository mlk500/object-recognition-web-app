const camera = (function () {
    let width = 0;
    let height = 0;

    const createObjects = function () {
        const video = document.createElement('video');
        video.id = 'video';
        video.width = width;
        video.height = height; // Fixed: Changed from video.width to video.height for setting height
        video.autoplay = true;
        document.body.appendChild(video);

        const canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.width = width;
        canvas.height = height; // Fixed: Changed from canvas.width to canvas.height for setting height
        document.body.appendChild(canvas);
    };

    return {
        video: null,
        context: null,
        canvas: null,

        startCamera: async function (w = 680, h = 480) {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                width = w;
                height = h;
        
                createObjects();
        
                this.video = document.getElementById('video');
                this.canvas = document.getElementById('canvas');
                this.context = this.canvas.getContext('2d');
        
                try {
                    // Stop the stream if it's already playing
                    if (this.video.srcObject) {
                        this.video.srcObject.getTracks().forEach(track => track.stop());
                    }
        
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    this.video.srcObject = stream;
                    
                    // Await for the video to start playing
                    await this.video.play();
                } catch (error) {
                    console.error("Error accessing the camera:", error);
                }
            }
        },

        takeSnapshot: function () {
            this.context.drawImage(this.video, 0, 0, width, height);
            // Optionally return the image data, or handle it as needed
            return this.canvas.toDataURL('image/png');
        }
    };
})();

export default camera;
