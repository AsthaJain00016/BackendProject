import express from 'express';
import {
    chatWithAI,
    getVideoOverview,
    getVideoRecommendations,
    writeTweet,
    generateVideoTitle,
    improveTweet
} from '../contollers/ai.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// AI Chatbot - General conversation
router.post('/chat', asyncHandler(chatWithAI));

// Get Video Overview - Provide summary of a video
router.post('/video/overview', asyncHandler(getVideoOverview));

// Get Video Recommendations - Suggest videos based on preferences
router.post('/video/recommendations', asyncHandler(getVideoRecommendations));

// Write Tweet - Help users compose tweets
router.post('/tweet/write', asyncHandler(writeTweet));

// Generate Video Title - Generate catchy titles for videos
router.post('/title/generate', asyncHandler(generateVideoTitle));

// Improve Tweet - Improve existing tweets
router.post('/tweet/improve', asyncHandler(improveTweet));

export default router;
