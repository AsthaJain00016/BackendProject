
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import{ Video} from "../models/video.model.js"

/**
 * CORE AI CALL FUNCTION
 * Uses Pollinations.ai (Free, No API Key needed)
 */
const callFreeAI = async (userPrompt, systemPrompt = "") => {
    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt || "You are a helpful assistant." },
                    { role: 'user', content: userPrompt }
                ],
                model: 'openai', // This is a free-tier wrapper model
                seed: 42,        // Keeps responses somewhat consistent
                jsonMode: false
            })
        });

        if (!response.ok) {
            throw new Error(`AI Provider responded with ${response.status}`);
        }

        const text = await response.text();
        return text;
    } catch (error) {
        console.error("AI Error:", error.message);
        throw new ApiError(500, "AI Service is temporarily unavailable.");
    }
};

// ===============================
// CONTROLLERS
// ===============================

export const chatWithAI = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message) throw new ApiError(400, "Message is required");

    const systemPrompt = "You are ViX AI — an intelligent SaaS assistant. Be natural, human-like, and conversational.";
    const reply = await callFreeAI(message, systemPrompt);

    return res.status(200).json(new ApiResponse(200, { response: reply }, "AI response generated"));
});

export const getVideoOverview = asyncHandler(async (req, res) => {
    const { videoId } = req.body;

    if (!videoId) {
        return res.status(400).json({ message: "Video ID is required" });
    }

    const video = await Video.findById(videoId).populate("owner");

    if (!video) {
        return res.status(404).json({ message: "Video not found" });
    }

    const systemPrompt = `
    You are an expert YouTube video summarizer.
    Write engaging, human-like video overviews.
    Keep it natural and professional.
    `;

    const userPrompt = `
    Generate an engaging overview for:

    Title: ${video.title}
    Description: ${video.description}
    Duration: ${video.duration} minutes
    Channel: ${video.owner?.username}

    Write 1-2 paragraphs.
    `;

    const overview = await callFreeAI(userPrompt, systemPrompt);

    return res.status(200).json(
        new ApiResponse(200, { overview }, "Overview generated")
    );
});


export const getVideoRecommendations = asyncHandler(async (req, res) => {
    const { interests } = req.body;
    const interestsStr = Array.isArray(interests) ? interests.join(", ") : interests;

    const systemPrompt = "You are a personalized video curator.";
   const userPrompt = `
User recently watched:
${interestsStr}

Analyze patterns and suggest 5 highly personalized video topics.
Do not ask questions.
Be confident.
`;


    const suggestions = await callFreeAI(userPrompt, systemPrompt);
    return res.status(200).json(new ApiResponse(200, { suggestions }, "Recommendations generated"));
});

export const writeTweet = asyncHandler(async (req, res) => {
    const { videoTitle, context } = req.body;

    const systemPrompt = "You are a social media expert. Write catchy tweets under 280 characters.";
    const userPrompt = `Write a viral tweet for a video titled: "${videoTitle}". Context: ${context}`;

    const tweet = await callFreeAI(userPrompt, systemPrompt);
    return res.status(200).json(new ApiResponse(200, { tweet }, "Tweet generated"));
});

export const improveTweet = asyncHandler(async (req, res) => {
    const { tweet } = req.body;

    const systemPrompt = "Improve the engagement of this tweet while keeping it under 280 characters.";
    const improved = await callFreeAI(`Tweet: ${tweet}`, systemPrompt);

    return res.status(200).json(new ApiResponse(200, { improvedTweet: improved }, "Tweet improved"));
});

export const generateVideoTitle = asyncHandler(async (req, res) => {
    const { topic } = req.body;
    if (!topic) throw new ApiError(400, "Topic is required");

    const systemPrompt = "You are a YouTube SEO strategist. Provide only the titles, one per line.";
    const userPrompt = `Generate 5 clickable YouTube titles about: ${topic}. No numbers, no bullets.`;

    const titlesRaw = await callFreeAI(userPrompt, systemPrompt);
    
    // Clean up the response into an array
    const titles = titlesRaw
        .split("\n")
        .map(t => t.trim())
        .filter(t => t.length > 0 && !t.startsWith('Title'));

    return res.status(200).json(new ApiResponse(200, { titles }, "Titles generated"));
});