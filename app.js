
const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallary = document.querySelector(".img-gallary");

const OPENAI_API_KEY = "";
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imageGallary.querySelectorAll(".img-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = imgCard.querySelector(".download-btn");

        // set the image source to the AI generated image data
        const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
        imgElement.src = aiGeneratedImg;

        // when the image is loaded, remove the loading class and set download attributes
        imgElement.onload = () => {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", aiGeneratedImg);
            downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        }
    });
}

const generateAiImages = async (userPrompt, userImgQuantity) => {
    try {
        // Validate the API key format (basic validation)
        if (!OPENAI_API_KEY.startsWith("sk-")) {
            throw new Error("Invalid API key format.");
        }

        // Prepare the request payload
        const payload = {
            prompt: userPrompt,
            n: userImgQuantity,
            model: 'dall-e-2',
            size: "1024x1024",
            response_format: "b64_json"
        };

        // Log the request payload for debugging
        console.log("Request Payload:", payload);

        // Send a request to OpenAI to generate images based on user inputs
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload),
        });

        const responseBody = await response.json();

        if (!response.ok) {
            // Log the full response for debugging
            console.error("API Response:", responseBody);
            throw new Error(`Error: ${response.status} ${response.statusText} - ${responseBody.error.message}`);
        }

        const { data } = responseBody; // get data from the response
        updateImageCard([...data]);
    } catch (error) {
        alert(error.message);
        console.error("Error:", error.message); // Log the error message to the console
    } finally {
        generateBtn.removeAttribute("disabled");
        generateBtn.innerText = "Generate";
        isImageGenerating = false;
    }
}

const handleImageGeneration = (e) => {
    e.preventDefault();
    if (isImageGenerating) return;

    // Get user input and image quantity values from the form
    const userPrompt = e.target[0].value.trim();
    const userImgQuantity = parseInt(e.target[1].value);

    // Check for empty input or invalid quantity
    if (!userPrompt || isNaN(userImgQuantity) || userImgQuantity <= 0) {
        alert("Please enter a valid prompt and image quantity.");
        return;
    }

    // Disable the generate button, update its text, and set the flag
    generateBtn.setAttribute("disabled", true);
    generateBtn.innerText = "Generating";
    isImageGenerating = true;

    // Creating HTML markup for image cards with loading state
    const imgCardMarkup = Array.from({ length: userImgQuantity }, () =>
        `<div class="img-card loading">
            <img src="images/loader.svg" alt="image">
            <a href="#" class="download-btn">
                <img src="images/download.svg" alt="download icon">
            </a>
        </div>`
    ).join("");

    imageGallary.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);
}

generateForm.addEventListener("submit", handleImageGeneration);
