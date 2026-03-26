const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;
let flip = true; // กล้องหน้า

async function flipCamera() {
    flip = !flip;

    // หยุดกล้องเดิม
    if (webcam) {
        webcam.stop();
    }

    // สร้าง webcam ใหม่
    webcam = new tmImage.Webcam(400, 400, flip);

    await webcam.setup();
    await webcam.play();

    // ล้างของเก่า
    const container = document.getElementById("webcam-container");
    container.innerHTML = "";

    container.appendChild(webcam.canvas);
}

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);

    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");
}

async function loop() {
    webcam.update(); // 👉 ทำให้ภาพขยับ
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    labelContainer.innerHTML = "";

    const colorMap = {
        Healthy: "green",
        Mosaic: "yellow",
        RedRot: "red",
        Rust: "orange",
        Yellow: "#ffd700"
    };

    for (let i = 0; i < prediction.length; i++) {
        const className = prediction[i].className;
        const probability = prediction[i].probability;

        const container = document.createElement("div");
        container.className = "progress-bar-container";

        const label = document.createElement("div");
        label.textContent = className;

        const bar = document.createElement("div");
        bar.className = "progress-bar";

        const fill = document.createElement("div");
        fill.className = "progress-bar-fill";
        fill.style.width = (probability * 100).toFixed(2) + "%";
        fill.style.backgroundColor = colorMap[className] || "#ff3434";

        const percent = document.createElement("div");
        percent.className = "progress-text";
        percent.textContent = (probability * 100).toFixed(0) + "%";

        bar.appendChild(fill);
        container.appendChild(label);
        container.appendChild(bar);
        container.appendChild(percent);

        labelContainer.appendChild(container);
    }
}