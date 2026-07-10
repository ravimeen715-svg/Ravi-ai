// ==========================================
// API — Google Gemini API Integration
// ==========================================

const GeminiAPI = {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',

    async call(prompt, loadingText = 'Generating...') {
        const apiKey = Storage.getApiKey();
        if (!apiKey) {
            App.showToast('API key not found. Please add it in Settings.', 'error');
            throw new Error('No API key');
        }

        let maxRetries = 4;
        let attempt = 0;

        while (attempt < maxRetries) {
            attempt++;
            App.showLoading(attempt > 1 ? `Google API limit hit. Auto-retrying in a few seconds... (Attempt ${attempt}/${maxRetries}) ⏳` : loadingText);

            try {
                // Ensure model URL dynamically uses what's injected in index.html, else fallback
                const modelUrl = window.GeminiAPI?.baseUrl || this.baseUrl;
                const response = await fetch(`${modelUrl}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.9, topP: 0.95, topK: 40, maxOutputTokens: 8192 },
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                        ]
                    })
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    const errMsg = err.error?.message || `API error: ${response.status}`;

                    // Root Cause Resolution: Deterministic 404 handling
                    if (response.status === 404 && errMsg.includes('is not found')) {
                        console.warn(`[JOHNSON AI - AUTO-RECOVERY] Model ${modelUrl} rejected. Falling back to legacy 'gemini-pro'`);
                        // Set fallback globally
                        const fallbackModel = 'gemini-pro';
                        window.GeminiAPI.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent`;
                        localStorage.setItem('johnson_ai_working_model', fallbackModel);
                        // Retry immediately with the correct endpoint
                        continue;
                    }

                    if (response.status === 429 || response.status === 503) {
                        if (attempt < maxRetries) {
                            console.warn(`[JOHNSON AI] Rate limit (429) hit on attempt ${attempt}. Waiting 15 seconds...`);
                            await new Promise(r => setTimeout(r, 15000));
                            continue;
                        }
                        throw new Error('Google API quota exhausted. Try again later.');
                    }
                    if (response.status === 400) {
                        throw new Error(`Bad Request/Invalid Key. Message: ${errMsg}`);
                    }
                    throw new Error(errMsg);
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!text) {
                    throw new Error('No response received from AI. Try again.');
                }

                App.hideLoading();
                return text;

            } catch (error) {
                // If the error is our thrown quota error, break out
                if (error.message.includes('quota exhausted') || error.message.includes('Invalid API key')) {
                    App.hideLoading();
                    App.showToast(error.message, 'error');
                    throw error;
                }

                // For fetch errors (like network drop), retry as well
                if (attempt < maxRetries) {
                    console.warn(`[JOHNSON AI] Network issue on attempt ${attempt}: ${error.message}. Waiting 10s...`);
                    await new Promise(r => setTimeout(r, 10000));
                    continue;
                }

                App.hideLoading();
                App.showToast(error.message, 'error');
                throw error;
            }
        }
    },

    // Prompt templates for each phase
    prompts: {
        trends(niche, context = '') {
            return `You are JOHNSON AI, an elite YouTube Shorts trend research expert specializing in USA audience content.

NICHE: ${niche}
${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

Your task: Research and identify the TOP 5 most viral-potential topics for YouTube Shorts right now.

For each topic, provide:
1. **Topic Title** — Clear, specific topic
2. **Why It's Trending** — What's driving interest
3. **Trend Score** (1-10) — How fast it's growing
4. **Virality Score** (1-10) — Shareability potential
5. **Curiosity Score** (1-10) — How much it makes people want to learn more
6. **Competition Score** (1-10) — 10 = low competition (good)
7. **Retention Potential** (1-10) — How well it keeps viewers watching
8. **TOTAL SCORE** — Average of all scores
9. **Best Angle** — The specific angle to cover this topic

After listing all 5, clearly state which topic is the **#1 RECOMMENDED** pick and why.

Focus on:
- Topics that would make a USA viewer stop scrolling
- Topics related to: AI tools, AI breakthroughs, AI business, tech innovations, emerging trends
- Topics with high emotional triggers (curiosity, surprise, fear, excitement, hope, urgency)
- Topics that are NEW, not overdone

Be specific. Use real current trends and tools. No generic topics.`;
        },

        strategy(topic) {
            return `You are JOHNSON AI, a YouTube Shorts content strategist for USA audience.

TOPIC: ${topic}

Validate this topic for viral YouTube Shorts content. Analyze:

## 1. Scroll-Stop Test
Would a USA viewer STOP scrolling to watch this? (YES/NO and why)

## 2. Emotional Trigger Analysis
Rate each trigger (1-10):
- Curiosity
- Surprise
- Fear
- Excitement
- Hope
- Urgency

## 3. Target Audience
- Who exactly would watch this?
- Age range
- Interests
- What they want to learn

## 4. Content Angle
- Best angle to cover this topic
- What makes this different from existing content
- Unique value proposition

## 5. Verdict
**PASS** or **FAIL** — Should we proceed with this topic?

If FAIL, suggest 3 better alternatives.
If PASS, explain why this will work and expected performance.`;
        },

        script(topic, duration = '45 seconds', tone = 'Educational & Clear', angle = '') {
            return `You are JOHNSON AI, an expert YouTube Shorts scriptwriter for USA faceless channels.

TOPIC: ${topic}
DURATION: ${duration}
TONE: ${tone}
${angle ? `ANGLE: ${angle}` : ''}

Write a complete YouTube Shorts script.

## Structure:

### HOOK (0-3 seconds)
- Create a STRONG interruption pattern
- First sentence MUST make viewers stop scrolling
- Use shock, curiosity, or bold claim
- Keep it under 10 words

### BODY (3-25 seconds for 30s / 3-50 seconds for 60s)
- Explain WHAT happened
- WHY it matters
- Give a REAL-WORLD example
- Show FUTURE impact
- Every sentence must ADD value and increase curiosity
- NO filler words
- Keep sentences SHORT and punchy

### ENDING (last 5 seconds)
- Strong CTA that drives engagement
- Ask a question to drive comments
- Create reason to follow/subscribe

## Rules:
- Write for USA English audience
- Use simple, direct language
- No jargon unless explained
- Every sentence must earn the next second of watch time
- Include [PAUSE] markers for dramatic effect
- Include (emphasis) markers for important words
- Include estimated timing for each section

Provide the complete script with word count and estimated duration.`;
        },

        scenes(script) {
            return `You are JOHNSON AI, a visual director for YouTube Shorts.

SCRIPT:
${script}

Break this script into 6-10 individual scenes. For EACH scene provide:

## Scene [Number]
- **Timestamp**: Start - End
- **Script Line**: The exact words spoken during this scene
- **Scene Description**: What the viewer sees
- **AI Image Prompt**: A detailed prompt for generating this image (for Midjourney/Leonardo/DALL-E). Include: subject, style, lighting, camera angle, mood. Use "cinematic, ultra realistic, 4K, high detail, vertical format 9:16" in every prompt.
- **Camera Movement**: Static / Slow zoom in / Slow zoom out / Pan left/right / Ken Burns
- **Lighting**: Warm / Cool / Dramatic / Neon / Natural
- **Emotion**: What should the viewer feel
- **Text Overlay**: Any text that should appear on screen

Make every scene visually DIFFERENT and dynamic. No two consecutive scenes should look the same.`;
        },

        voiceover(script) {
            return `You are JOHNSON AI, a professional voiceover director.

SCRIPT:
${script}

Create a detailed voiceover guide:

## Voiceover Script
Rewrite the script with professional delivery annotations:

For each line include:
- **Pace**: (Fast / Normal / Slow / Dramatic pause)
- **Energy**: (Low / Medium / High / Intense)
- **Emphasis words**: Underline key words to stress
- **Tone**: (Excited / Serious / Curious / Urgent / Calm)
- **Timing**: Estimated seconds

## Pronunciation Guide
List any technical terms with pronunciation tips.

## Voice Requirements
- Style: Clear American English
- Gender recommendation
- Pitch
- Pace (words per minute)

## Free Tools to Generate Voice
1. ElevenLabs (free tier — 10,000 chars/month)
2. Google Cloud TTS (free tier)
3. Murf.ai (free tier)
4. Natural Reader (free)

Provide the exact text to paste into these tools, cleaned and ready for TTS.`;
        },

        videoplan(script, scenes = '') {
            return `You are JOHNSON AI, a YouTube Shorts video editor.

SCRIPT:
${script}

${scenes ? `SCENES:\n${scenes}` : ''}

Create a complete VIDEO EDITING BLUEPRINT:

## Video Specifications
- Resolution: 1080x1920 (vertical)
- Frame Rate: 30 or 60fps
- Duration: Exact timing

## Scene-by-Scene Editing Plan

For each scene:
- **Duration**: Exact seconds
- **Transition IN**: Cut / Fade / Slide / Zoom / Whip
- **Zoom Effect**: Slow zoom in / Ken Burns / None
- **Text Overlay**: Position, font style, animation
- **Sound Effect**: Whoosh / Impact / Pop / Ding / etc.
- **Background Music**: Energy level, genre
- **Visual Effect**: Color grade, vignette, glow, particles

## Caption Style
- Font: Bold, large, centered
- Colors: White with black outline or dynamic colors
- Animation: Word-by-word / Line-by-line / Highlight

## Background Music Recommendations
- Genre & mood
- BPM range
- 3 specific royalty-free tracks from YouTube Audio Library

## Editing Software Guide
Step-by-step instructions for:
1. CapCut (free, mobile + desktop)
2. DaVinci Resolve (free, desktop)

## Retention Target: 80%+
List specific editing techniques to maintain high retention.`;
        },

        thumbnail(topic, visual = '') {
            return `You are JOHNSON AI, a YouTube thumbnail design expert targeting USA audience.

TOPIC: ${topic}
${visual ? `KEY VISUAL: ${visual}` : ''}

Create 5 UNIQUE thumbnail concepts. For each concept:

## Concept [Number]
- **Title**: 3 words MAX on the thumbnail
- **Visual Description**: What the viewer sees
- **Focal Subject**: Main element (face, object, text)
- **Background**: Color/gradient/scene
- **Color Palette**: Primary, secondary, accent colors
- **Emotion Conveyed**: What feeling it triggers
- **AI Image Prompt**: Complete prompt for Midjourney/Leonardo to generate this thumbnail. Include style: "YouTube thumbnail style, high contrast, vibrant colors, dramatic lighting, 16:9 aspect ratio, photorealistic, eye-catching"
- **Predicted CTR**: Estimated click-through rate (%)
- **Why It Works**: Psychology behind this design

## Rules Applied:
- Strong emotion in every thumbnail
- High contrast colors
- Maximum curiosity gap
- Large focal subject
- Three words or fewer text
- No clickbait — honest curiosity

## RECOMMENDED: Pick the best concept and explain why.`;
        },

        seo(topic, script = '') {
            return `You are JOHNSON AI, a YouTube SEO optimization expert for USA audience.

TOPIC: ${topic}
${script ? `SCRIPT SUMMARY:\n${script}` : ''}

Generate COMPLETE SEO optimization:

## Viral Titles (5 options)
Create 5 viral title options ranked by predicted CTR. Each under 60 characters.

## SEO Title
One fully SEO-optimized title with primary keyword.

## Description
Write a 500-character YouTube description with:
- Hook in first 2 lines (shown before "...more")
- Keywords naturally integrated
- CTA to subscribe
- Relevant links section placeholder

## Hashtags (30)
List 30 hashtags, ordered by relevance. Mix of:
- High-volume general hashtags
- Niche-specific hashtags
- Trending hashtags

## Tags (20)
List 20 YouTube tags, ordered by search volume.

## Target Keywords (10)
List the 10 most important keywords for this video.

## YouTube Category
Recommended category and why.

All content must be optimized for USA English-speaking audience.`;
        },

        quality(script, meta = '') {
            return `You are JOHNSON AI, a quality control expert for YouTube content.

SCRIPT:
${script}

${meta ? `TITLE & DESCRIPTION:\n${meta}` : ''}

Perform a COMPLETE quality audit:

## 1. Fact Check
- Identify any claims that need verification
- Rate factual accuracy (1-10)
- Flag any potentially misleading statements
- Suggest corrections if needed

## 2. Copyright Check
- Any copyrighted material referenced?
- Any trademark issues?
- Any music/image licensing concerns?
- Risk level: LOW / MEDIUM / HIGH

## 3. Platform Policy Check
- YouTube Community Guidelines compliance
- Any content that could cause demonetization?
- Any age-restriction triggers?
- Risk level: LOW / MEDIUM / HIGH

## 4. Grammar & Language
- Identify any grammar errors
- Identify any awkward phrasing
- Suggest improvements
- Rate language quality (1-10)

## 5. SEO Quality
- Are keywords well-integrated?
- Title optimization score (1-10)
- Description optimization score (1-10)
- Overall SEO score (1-10)

## 6. Engagement Prediction
- Predicted retention rate
- Predicted CTR
- Predicted engagement rate
- Overall quality score (1-10)

## 7. Auto-Fix
Provide the corrected versions of any issues found.

## VERDICT: PUBLISH READY or NEEDS REVISION`;
        },

        publish(topic) {
            return `You are JOHNSON AI, a YouTube publishing strategist for USA audience.

TOPIC: ${topic}

Generate a complete PUBLISHING GUIDE:

## Upload Checklist
✅ Step-by-step checklist for uploading to YouTube

## Optimal Upload Times (USA)
- Best days of the week
- Best hours (EST, CST, PST)
- Why these times work
- Timezone-specific recommendations

## YouTube Studio Settings
- **Category**: Recommendation with reason
- **Audience**: Kids content? Age settings
- **Visibility**: Public / Unlisted / Scheduled
- **Language**: English
- **License**: Standard YouTube License
- **Comments**: Moderation settings
- **Shorts-specific**: Any Shorts-specific settings

## First Hour Strategy
What to do in the first hour after publishing:
- Comment engagement
- Social media sharing
- Community tab post
- Stories/Shorts cross-promotion

## Cross-Platform Promotion
Where else to share:
- Instagram Reels
- TikTok
- X (Twitter)
- Reddit
- Facebook

## Performance Benchmarks
What metrics to check at:
- 1 hour
- 24 hours
- 48 hours
- 1 week`;
        },

        improve(analyticsData) {
            return `You are JOHNSON AI, a YouTube analytics expert specializing in self-improvement.

PERFORMANCE DATA FROM PAST VIDEOS:
${JSON.stringify(analyticsData, null, 2)}

Analyze this data and provide:

## Performance Overview
Summary of overall channel performance trends.

## Top Performing Content
- Which videos performed best and why?
- Common patterns in successful videos

## Underperforming Content
- Which videos underperformed and why?
- Common patterns in weak videos

## Key Insights
- What hooks work best?
- What topics drive the most views?
- What retention patterns do you see?
- What CTR patterns do you see?

## Action Plan for Next Video
Based on the data, provide specific recommendations:
1. Best topic to cover next
2. Best hook style to use
3. Best thumbnail approach
4. Best posting time
5. Script style that works best

## Growth Projections
Based on current trends, predict:
- Expected views per video
- Areas with biggest improvement potential
- 30-day growth estimate

Be DATA-DRIVEN. Reference specific numbers from the data. No generic advice.`;
        }
    }
};
