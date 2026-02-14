import axios from "axios";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Configuration for AI service
const AI_CONFIG = {
    apiKey: process.env.AI_API_KEY || "",
    endpoint: process.env.AI_ENDPOINT || "https://api.openai.com/v1/chat/completions",
    model: process.env.AI_MODEL || "gpt-3.5-turbo"
};

// Helper function to call AI API
const callAI = async (messages) => {
    if (!AI_CONFIG.apiKey) {
        return getMockResponse(messages);
    }

    try {
        const response = await axios.post(
            AI_CONFIG.endpoint,
            {
                model: AI_CONFIG.model,
                messages: messages,
                max_tokens: 500
            },
            {
                headers: {
                    "Authorization": `Bearer ${AI_CONFIG.apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("AI API Error:", error);
        return getMockResponse(messages);
    }
};

// Mock responses for testing without API key
const getMockResponse = (messages) => {
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Greeting responses
    if (lastMessage.match(/\b(hi|hello|hii|hey|greetings|what's up|yo)\b/)) {
        const greetings = [
            "Hey! 👋 I'm here to help with your ViX content. Need video suggestions, tweet help, or title ideas?",
            "Hello! What can I assist you with today? I specialize in videos, tweets, and content recommendations.",
            "Hi there! Welcome to ViX. I can help you with recommendations, overviews, and creative content ideas! 🎬",
            "Greetings! Ready to enhance your ViX experience. What would you like help with?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // General knowledge questions about date/time
    if (lastMessage.includes("date") || lastMessage.includes("today") || lastMessage.includes("time") || lastMessage.includes("current date") || lastMessage.includes("what is the date")) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return `Today is ${today}. Now, is there anything I can help you with regarding ViX - like video recommendations, tweet writing, or content creation tips?`;
    }
    
    // Video recommendation responses
    if ((lastMessage.includes("recommend") || lastMessage.includes("suggest")) && lastMessage.includes("video")) {
        const recommendations = [
            "Perfect! Based on trending content, I'd suggest exploring:\n• Tech tutorials & vlogs\n• Educational documentaries\n• Creative storytelling\n• Music & entertainment channels\nWhat interests you most?",
            "I'd love to help you discover new content! Popular categories right now include:\n• Gaming & esports\n• Lifestyle & personal development\n• Comedy & entertainment\n• Business & entrepreneurship\nWhich appeals to you?",
            "Here are some recommendations tailored to creators:\n• Similar channels in your niche\n• Cross-promotion opportunities\n• Trending collaborative content\n• Audience engagement strategies\nWhat are you interested in?",
            "Looking for fresh content? Try exploring:\n• Trending videos in your interests\n• Creator collaborations\n• Emerging content categories\n• Community-favorites\nLet me know your preferences!"
        ];
        return recommendations[Math.floor(Math.random() * recommendations.length)];
    }
    
    // Video overview/summary responses - more varied
    if (lastMessage.includes("overview") || lastMessage.includes("summary") || lastMessage.includes("explain")) {
        const overviews = [
            "This video appears to cover an important topic with clear demonstrations and practical insights. The content is well-structured to keep viewers engaged throughout. Great choice! 👍",
            "Looks like a comprehensive video that breaks down complex ideas into understandable segments. It combines visual examples with clear explanations, making it very informative.",
            "This content provides valuable takeaways with a good balance of theory and practice. The presenter explains concepts clearly, making it accessible to viewers at different knowledge levels.",
            "Great selection! This video delivers quality content with proper pacing and relevant examples. It's the type of content that viewers find both entertaining and educational."
        ];
        return overviews[Math.floor(Math.random() * overviews.length)];
    }
    
    // Tweet improvement responses - more specific
    if (lastMessage.includes("improve") || lastMessage.includes("better")) {
        if (lastMessage.length > 40) { // User provided their actual tweet
            const improvements = [
                "Here's an enhanced version:\n'🚀 Just dropped something special on ViX! This one's a game-changer. Check it out and let me know what resonates with you. #ViX #MustWatch'",
                "Try this improved version:\n'✨ Excited to share my latest work with you all! Packed with insights you won't find elsewhere. Watch, engage, and join the conversation! #ViX #CreatorLife'",
                "Spruced up:\n'🎯 New content alert! This one took everything I learned and put it into one powerful video. Would love your thoughts and feedback! #ViX #NewRelease'",
                "Made punchier:\n'🔥 Just published something I'm really proud of. If you appreciate quality content, this is for you. Check it out now! #ViX #VideoCreator #Engage'"
            ];
            return improvements[Math.floor(Math.random() * improvements.length)];
        } else {
            return "Share your tweet with me and I'll help you make it more engaging! You can paste your draft and I'll suggest improvements with better hooks, emojis, and hashtags.";
        }
    }
    
    // Tweet writing responses
    if ((lastMessage.includes("tweet") || lastMessage.includes("write")) && (lastMessage.includes("about") || lastMessage.includes("for"))) {
        const tweets = [
            "Here's a tweet suggestion:\n💡 Just released fresh content on ViX! Check it out and let me know what you think. Feedback welcome! #ViX #ContentCreator #NewVideo",
            "Try this:\n🎬 New video is live! Join the conversation and share your thoughts. Would love to hear from you! #ViX #CreatorLife",
            "How about:\n✨ Excited to share my latest creation with you all! Come watch, engage, and be part of the community. #ViX #VideoContent",
            "Consider posting:\n📺 Fresh content alert! Dive in, enjoy, and don't forget to connect with me in the comments. Let's build this together! #ViX"
        ];
        return tweets[Math.floor(Math.random() * tweets.length)];
    }
    
    // Title generation responses
    if ((lastMessage.includes("title") || lastMessage.includes("name")) && (lastMessage.includes("video") || lastMessage.includes("generate"))) {
        const titles = [
            "Here are some engaging title ideas:\n1️⃣ The Complete Guide to Your Topic - Everything Explained\n2️⃣ You Won't Believe What Happens Next [Topic]\n3️⃣ [Topic] Mastery: Everything Creators Need to Know\n4️⃣ Shocking Truth About [Topic] Revealed\n5️⃣ [Topic]: The Ultimate Tutorial for 2024",
            "Title suggestions for maximum engagement:\n• Ultimate Secrets to [Topic] Success\n• How to [Desired Action] in [Topic] - Step by Step\n• [Topic] Breakdown: What You MUST Know\n• The [Topic] Revolution - Everything Changed\n• [Topic] Hacks That Actually Work",
            "Consider these catchy titles:\n» Why Everyone Is Talking About [Topic] Now\n» [Topic] Explained: A Beginner's Guide\n» Game-Changing [Topic] Strategies for 2024\n» The Truth About [Topic] - Full Breakdown\n» [Topic] Made Simple: Expert Tips Inside",
            "Compelling title options:\n✓ Master [Topic]: Expert Secrets Revealed\n✓ What You Didn't Know About [Topic]\n✓ The [Topic] Framework That Changed Everything\n✓ [Topic] 101: From Basics to Advanced\n✓ Inside Look: [Topic] Like Never Before"
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }
    
    // Upload help
    if (lastMessage.includes("upload") || lastMessage.includes("publish")) {
        const uploadHelp = [
            "Uploading to ViX is simple! Here's the process:\n1. Click 'Upload' in your dashboard\n2. Select your video (MP4, MOV, AVI supported)\n3. Add title, description, and thumbnail\n4. Set privacy (public/private/unlisted)\n5. Add tags and category\n6. Click 'Publish'\n\nTips: Compress your video, use clear thumbnails, and write engaging descriptions! 🎬",
            "Here's how to get your content live:\n✓ Go to your creator studio\n✓ Choose 'New Upload'\n✓ Drag & drop or select your file\n✓ Fill in metadata (title, description)\n✓ Customize visibility settings\n✓ Hit publish!\n\nMake sure your video is under 5GB and in a supported format!",
            "Upload guide:\n1. Access your upload section\n2. Select video file from your computer\n3. Add compelling title and description\n4. Choose appropriate category\n5. Add relevant tags\n6. Set visibility preference\n7. Publish and share!\n\nOptimize your video for better reach! 📈"
        ];
        return uploadHelp[Math.floor(Math.random() * uploadHelp.length)];
    }
    
    // General help/what can I do
    if (lastMessage.includes('what can') || lastMessage.includes('help') || lastMessage.includes('how do i') || lastMessage.includes('capabilities')) {
        const helpMessages = [
            "I can help you with:\n📹 Video Discovery - Get personalized recommendations\n📊 Video Overview - Quick summaries & analysis\n🐦 Tweet Magic - Write engaging tweets for your content\n✍️ Title Generator - Create catchy video titles\n⚡ Tweet Improver - Enhance your tweet content\n🚀 General Chat - Answer questions about ViX\n\nWhat would you like to do?",
            "Here's what I'm great at:\n• Suggesting videos based on your interests\n• Summarizing video content (just provide ID)\n• Crafting tweets for your projects\n• Generating creative video titles\n• Improving existing tweets\n• Answering ViX-related questions\n\nHow can I assist?",
            "I specialize in:\n→ Content recommendations tailored to you\n→ Quick video analysis & overviews\n→ Creative tweet composition\n→ Catchy title generation\n→ Tweet enhancement & optimization\n→ General platform guidance\n\nPick an area and let's get started!",
            "My superpowers:\n🎯 Smart video recommendations\n📺 Intelligent content summaries  \n💬 Tweet writing assistance\n🏷️ Title creation & optimization\n✨ Tweet polish & enhancement\n❓ Platform Q&A\n\nWhat interests you most?"
        ];
        return helpMessages[Math.floor(Math.random() * helpMessages.length)];
    }

    // Default conversational response
    const defaults = [
        "That's interesting! Tell me more about what you're working on, and I can help you with content recommendations, tweet writing, title ideas, or video analysis.",
        "I'm here to help with your ViX journey! Whether it's finding great content, crafting tweets, generating titles, or analyzing videos - I've got you covered. What's on your mind?",
        "Great question! I specialize in content discovery, tweet composition, title generation, and video insights. What would be most helpful for you right now?",
        "Sounds like you're creating great content! I can assist with recommendations, tweets, video titles, and more. What would help you most?"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
};

// AI Chatbot - General conversation
const chatWithAI = asyncHandler(async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        throw new ApiError(400, "Message is required");
    }

    const messages = [
        {
            role: "system",
            content: "You are a helpful AI assistant for ViX video platform. You can help users with: 1) Suggesting videos based on their interests, 2) Providing video overviews, 3) Writing tweets, 4) Generating video titles, 5) Improving tweets. Be friendly and concise."
        }
    ];

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
        messages.push(...history.slice(-5)); // Last 5 messages for context
    }

    messages.push({ role: "user", content: message });

    const response = await callAI(messages);

    return res.status(200).json(new ApiResponse(200, { response }, "AI response generated successfully"));
});

// Get Video Overview - Provide summary of a video
const getVideoOverview = asyncHandler(async (req, res) => {
    const { videoId } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId).populate("owner", "username avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const prompt = `Provide a brief overview of this video:
    Title: ${video.title}
    Description: ${video.description}
    Duration: ${Math.floor(video.duration / 60)} minutes
    Channel: ${video.owner.username}`;

    const messages = [
        {
            role: "system",
            content: "You are a helpful AI assistant that provides video overviews. Be concise and informative."
        },
        { role: "user", content: prompt }
    ];

    const overview = await callAI(messages);

    return res.status(200).json(new ApiResponse(200, { overview, video }, "Video overview generated successfully"));
});

// Get Video Recommendations - Suggest videos based on preferences
const getVideoRecommendations = asyncHandler(async (req, res) => {
    const { interests, userId } = req.body;

    // Build query based on user interests
    const filter = { isPublished: true };
    
    if (interests && Array.isArray(interests)) {
        filter.$or = interests.map(interest => ({
            title: { $regex: interest, $options: "i" }
        }));
    }

    // If user is logged in, get their preferences
    let userInterests = [];
    if (userId) {
        const user = await User.findById(userId);
        if (user) {
            userInterests = user.interests || [];
            if (userInterests.length > 0 && !interests) {
                filter.$or = userInterests.map(interest => ({
                    title: { $regex: interest, $options: "i" }
                }));
            }
        }
    }

    // Get recommended videos
    const recommendations = await Video.find(filter)
        .sort({ views: -1, createdAt: -1 })
        .limit(10)
        .populate("owner", "username avatar");

    const prompt = `Based on user interests: ${interests || userInterests.join(", ") || "general trending content"}, suggest personalized video recommendations.`;

    const messages = [
        {
            role: "system",
            content: "You are a helpful AI assistant that recommends videos. Be concise and friendly."
        },
        { role: "user", content: prompt }
    ];

    const aiSuggestions = await callAI(messages);

    return res.status(200).json(new ApiResponse(200, { 
        recommendations, 
        aiSuggestions 
    }, "Video recommendations generated successfully"));
});

// Write Tweet - Help users compose tweets
const writeTweet = asyncHandler(async (req, res) => {
    const { context, videoTitle, platform } = req.body;

    let prompt = "Write a catchy tweet about a video";
    
    if (videoTitle) {
        prompt = `Write a tweet promoting this video: "${videoTitle}"`;
    }
    
    if (context) {
        prompt += `. Additional context: ${context}`;
    }

    const messages = [
        {
            role: "system",
            content: "You are a helpful AI assistant that writes engaging tweets. Keep them concise (under 280 characters), catchy, and include relevant hashtags."
        },
        { role: "user", content: prompt }
    ];

    const tweet = await callAI(messages);

    return res.status(200).json(new ApiResponse(200, { tweet }, "Tweet generated successfully"));
});

// Generate Video Title - Generate catchy titles for videos
const generateVideoTitle = asyncHandler(async (req, res) => {
    const { topic, description, keywords } = req.body;

    if (!topic && !description) {
        throw new ApiError(400, "Topic or description is required");
    }

    const prompt = `Generate 5 catchy video titles for a video about: ${topic || description}. 
    ${keywords ? `Include these keywords: ${keywords}` : ''}`;

    const messages = [
        {
            role: "system",
            content: "You are a creative AI assistant that generates engaging video titles. Create titles that are catchy, descriptive, and likely to attract viewers."
        },
        { role: "user", content: prompt }
    ];

    const titles = await callAI(messages);

    // Parse the titles into an array
    const titleList = titles.split('\n').filter(t => t.trim()).slice(0, 5);

    return res.status(200).json(new ApiResponse(200, { titles: titleList }, "Video titles generated successfully"));
});

// Improve Tweet - Improve existing tweets
const improveTweet = asyncHandler(async (req, res) => {
    const { tweet } = req.body;

    if (!tweet) {
        throw new ApiError(400, "Tweet is required");
    }

    const prompt = `Improve this tweet to make it more engaging: "${tweet}". Make it catchy but keep it under 280 characters.`;

    const messages = [
        {
            role: "system",
            content: "You are a helpful AI assistant that improves tweets. Make them more engaging, add relevant hashtags, and keep them concise."
        },
        { role: "user", content: prompt }
    ];

    const improvedTweet = await callAI(messages);

    return res.status(200).json(new ApiResponse(200, { improvedTweet }, "Tweet improved successfully"));
});

export {
    chatWithAI,
    getVideoOverview,
    getVideoRecommendations,
    writeTweet,
    generateVideoTitle,
    improveTweet
};
