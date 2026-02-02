// =================================================================================
//  项目: puter-2api (Cloudflare Worker 单文件版)
//  版本: 1.0.3-cfw-pro (代号: Chimera Synthesis - Puter Pro)
//  作者: 首席AI执行官 (Principal AI Executive Officer)
//  协议: 奇美拉协议 · 综合版 (Project Chimera: Synthesis Edition)
//  日期: 2025-11-20
//
//  描述:
//  本文件是一个完全自包含、可一键部署的 Cloudflare Worker。它将 Puter.com 的
//  统一后端服务，无损地转换为一个高性能、兼容 OpenAI 标准的 API 套件，涵盖
//  文本、图像和视频生成。Worker 内置了一个功能强大的"开发者驾驶舱"Web UI，
//  用于实时监控、多模态测试和快速集成。
//
// =================================================================================

// --- [第一部分: 核心配置 (Configuration-as-Code)] ---
// 架构核心：所有关键参数在此定义，后续逻辑必须从此对象读取。
const CONFIG = {
  // 项目元数据
  PROJECT_NAME: "puter-2api",
  PROJECT_VERSION: "1.0.3-cfw-pro", // [升级] 版本号迭代

  // 安全配置
  API_MASTER_KEY: "1", // 您的主 API 密钥。留空或设为 "1" 以禁用认证。

  // 上游服务配置
  UPSTREAM_URL: "https://api.puter.com/drivers/call",

  // Puter.com 凭证池 (支持多账号轮询)
  PUTER_AUTH_TOKENS: [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoiYXUiLCJ2IjoiMC4wLjAiLCJ1dSI6IlZxclZ4K2NEU3UrWkZwamlNbkdCeFE9PSIsImF1IjoiSWFrS3pzZ29WZ0dENzQrM0Q4bVlYZz09IiwicyI6ImhxcHZHUHJlMGZVa1FFZllaSFcwaHc9PSIsImlhdCI6MTc3MDA0NzM1MH0.hl6gTTADrXyGoo5hMzIMbyPzKM2PPiVU56TKhfksAtE,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoiYXUiLCJ2IjoiMC4wLjAiLCJ1dSI6Ino4U1N4Z3k2VEJtbDZMTGVOUFVaZVE9PSIsImF1IjoiaWRnL2ZEMDdVTkdhSk5sNXpXUGZhUT09IiwicyI6Inc0UTJ3djM1ZHhwdkkyTlg3L3lWMlE9PSIsImlhdCI6MTc2MzQ5NDg5NX0.rSOf1PJ9ZL6Aup2Tn4mkAnVUHJCNN37tCUSlQZtBBM0",
    // 在此添加更多 auth_token 实现轮询, 例如: "eyJhbGciOi..."
  ],

  // 模型列表
  CHAT_MODELS: [
    "gpt-5.1","gpt-5.1-codex","gpt-5.1-codex-mini","gpt-5.1-chat-latest","gpt-5-2025-08-07","gpt-5","gpt-5-mini-2025-08-07","gpt-5-mini","gpt-5-nano-2025-08-07","gpt-5-chat-latest","gpt-4o","gpt-4o-mini","o1","o1-mini","o1-pro","o3","o3-mini","o4-mini","gpt-4.1","gpt-4.1-mini","gpt-4.1-nano","gpt-4.5-preview","claude-opus-4-5-20251101","claude-opus-4-5-latest","claude-opus-4-5","claude-opus-4.5","claude-haiku-4-5-20251001","claude-haiku-4.5","claude-haiku-4-5","claude-sonnet-4-5-20250929","claude-sonnet-4.5","claude-sonnet-4-5","claude-opus-4-1-20250805","claude-opus-4-1","claude-opus-4-20250514","claude-opus-4","claude-opus-4-latest","claude-sonnet-4-20250514","claude-sonnet-4","claude-sonnet-4-latest","claude-3-7-sonnet-20250219","claude-3-7-sonnet-latest","claude-3-5-sonnet-20241022","claude-3-5-sonnet-latest","claude-3-5-sonnet-20240620","claude-3-haiku-20240307","togetherai:togethercomputer/Refuel-Llm-V2","togetherai:cartesia/sonic","togetherai:meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo","togetherai:cartesia/sonic-2","togetherai:Meta-Llama/Llama-Guard-7b","togetherai:togethercomputer/MoA-1","togetherai:meta-llama/LlamaGuard-2-8b","togetherai:meta-llama/Llama-3.3-70B-Instruct-Turbo","togetherai:Qwen/Qwen2.5-72B-Instruct-Turbo","togetherai:black-forest-labs/FLUX.1-dev","togetherai:Alibaba-NLP/gte-modernbert-base","togetherai:mistralai/Mistral-Small-24B-Instruct-2501","togetherai:marin-community/marin-8b-instruct","togetherai:kwaivgI/kling-1.6-standard","togetherai:meta-llama/Llama-Guard-3-11B-Vision-Turbo","togetherai:black-forest-labs/FLUX.2-flex","togetherai:meta-llama/Meta-Llama-Guard-3-8B","togetherai:deepseek-ai/DeepSeek-R1","togetherai:Qwen/Qwen3-Next-80B-A3B-Thinking","togetherai:meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo","togetherai:black-forest-labs/FLUX.1-dev-lora","togetherai:HiDream-ai/HiDream-I1-Full","togetherai:black-forest-labs/FLUX.1-krea-dev","togetherai:togethercomputer/MoA-1-Turbo","togetherai:Lykon/DreamShaper","togetherai:HiDream-ai/HiDream-I1-Dev","togetherai:Qwen/Qwen-Image","togetherai:RunDiffusion/Juggernaut-pro-flux","togetherai:google/imagen-4.0-preview","togetherai:google/imagen-4.0-ultra","togetherai:google/veo-3.0","togetherai:minimax/hailuo-02","togetherai:stabilityai/stable-diffusion-3-medium","togetherai:deepcogito/cogito-v2-preview-llama-405B","togetherai:deepcogito/cogito-v2-preview-llama-70B","togetherai:arcee-ai/trinity-mini","togetherai:minimax/video-01-director","togetherai:togethercomputer/m2-bert-80M-32k-retrieval","togetherai:deepseek-ai/DeepSeek-R1-0528-tput","togetherai:google/flash-image-2.5","togetherai:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8","togetherai:moonshotai/Kimi-K2-Thinking","togetherai:Qwen/Qwen3-Next-80B-A3B-Instruct","togetherai:ServiceNow-AI/Apriel-1.5-15b-Thinker","togetherai:scb10x/scb10x-typhoon-2-1-gemma3-12b","togetherai:meta-llama/Llama-Guard-4-12B","togetherai:HiDream-ai/HiDream-I1-Fast","togetherai:Wan-AI/Wan2.2-T2V-A14B","togetherai:ByteDance/Seedance-1.0-pro","togetherai:google/veo-3.0-fast-audio","togetherai:vidu/vidu-q1","togetherai:intfloat/multilingual-e5-large-instruct","togetherai:meta-llama/Llama-4-Scout-17B-16E-Instruct","togetherai:meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo","togetherai:ByteDance-Seed/Seedream-3.0","togetherai:ByteDance-Seed/Seedream-4.0","togetherai:meta-llama/Meta-Llama-3.1-405B-Instruct-Lite-Pro","togetherai:meta-llama/Llama-3.2-3B-Instruct-Turbo","togetherai:black-forest-labs/FLUX.1-kontext-max","togetherai:ideogram/ideogram-3.0","togetherai:mixedbread-ai/Mxbai-Rerank-Large-V2","togetherai:Salesforce/Llama-Rank-V1","togetherai:black-forest-labs/FLUX.1-schnell","togetherai:deepseek-ai/DeepSeek-R1-Distill-Llama-70B","togetherai:Qwen/Qwen2.5-VL-72B-Instruct","togetherai:black-forest-labs/FLUX.1-kontext-dev","togetherai:zai-org/GLM-4.5-Air-FP8","togetherai:black-forest-labs/FLUX.1-pro","togetherai:black-forest-labs/FLUX.1.1-pro","togetherai:meta-llama/Meta-Llama-3-70B-Instruct-Turbo","togetherai:black-forest-labs/FLUX.1-schnell-Free","togetherai:Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8","togetherai:black-forest-labs/FLUX.1-kontext-pro","togetherai:mistralai/Mixtral-8x7B-Instruct-v0.1","togetherai:nvidia/NVIDIA-Nemotron-Nano-9B-v2","togetherai:openai/gpt-oss-120b","togetherai:openai/sora-2","togetherai:kwaivgI/kling-2.1-standard","togetherai:google/imagen-4.0-fast","togetherai:mistralai/Mistral-7B-Instruct-v0.3","togetherai:google/gemma-3n-E4B-it","togetherai:deepseek-ai/DeepSeek-V3","togetherai:kwaivgI/kling-2.1-master","togetherai:google/veo-3.0-audio","togetherai:Rundiffusion/Juggernaut-Lightning-Flux","togetherai:Wan-AI/Wan2.2-I2V-A14B","togetherai:google/veo-2.0","togetherai:google/veo-3.0-fast","togetherai:kwaivgI/kling-2.0-master","togetherai:pixverse/pixverse-v5","togetherai:stabilityai/stable-diffusion-xl-base-1.0","togetherai:openai/sora-2-pro","togetherai:ByteDance/Seedance-1.0-lite","togetherai:kwaivgI/kling-1.6-pro","togetherai:vidu/vidu-2.0","togetherai:kwaivgI/kling-2.1-pro","togetherai:Virtue-AI/VirtueGuard-Text-Lite","togetherai:meta-llama/Meta-Llama-3-8B-Instruct-Lite","togetherai:Qwen/Qwen3-235B-A22B-fp8-tput","togetherai:togethercomputer/Refuel-Llm-V2-Small","togetherai:arize-ai/qwen-2-1.5b-instruct","togetherai:moonshotai/Kimi-K2-Instruct-0905","togetherai:Qwen/Qwen2.5-7B-Instruct-Turbo","togetherai:deepcogito/cogito-v2-preview-llama-109B-MoE","togetherai:hexgrad/Kokoro-82M","togetherai:google/gemini-3-pro-image","togetherai:mercor/cwm","togetherai:pangram/mistral-small-2501","togetherai:Qwen/Qwen3-235B-A22B-Instruct-2507-tput","togetherai:deepcogito/cogito-v2-1-671b","togetherai:black-forest-labs/FLUX.2-pro","togetherai:black-forest-labs/FLUX.2-dev","togetherai:zai-org/GLM-4.6","togetherai:openai/whisper-large-v3","togetherai:canopylabs/orpheus-3b-0.1-ft","togetherai:meta-llama/Llama-3-70b-chat-hf","togetherai:meta-llama/Llama-3.1-405B-Instruct","togetherai:meta-llama/Llama-3-70b-hf","togetherai:Qwen/Qwen3-235B-A22B-Thinking-2507","togetherai:Qwen/Qwen2.5-72B-Instruct","togetherai:openai/gpt-oss-20b","togetherai:meta-llama/Meta-Llama-3.1-70B-Instruct-Reference","togetherai:BAAI/bge-large-en-v1.5","togetherai:meta-llama/Llama-3.2-1B-Instruct","togetherai:Qwen/Qwen2.5-14B-Instruct","togetherai:meta-llama/Meta-Llama-3.1-8B-Instruct-Reference","togetherai:meta-llama/Meta-Llama-3-8B-Instruct","togetherai:BAAI/bge-base-en-v1.5","togetherai:mistralai/Mistral-7B-Instruct-v0.2","togetherai:deepseek-ai/DeepSeek-V3.1","model-fallback-test-1","mistral-large-latest","mistral-medium-2508","mistral-medium-latest","mistral-medium","ministral-3b-2410","ministral-3b-latest","ministral-8b-2410","ministral-8b-latest","open-mistral-7b","mistral-tiny","mistral-tiny-2312","open-mistral-nemo","open-mistral-nemo-2407","mistral-tiny-2407","mistral-tiny-latest","pixtral-large-2411","pixtral-large-latest","mistral-large-pixtral-2411","codestral-2508","codestral-latest","devstral-small-2507","devstral-small-latest","pixtral-12b-2409","pixtral-12b","pixtral-12b-latest","mistral-small-2506","mistral-small-latest","magistral-medium-2509","magistral-medium-latest","magistral-small-2509","magistral-small-latest","mistral-moderation-2411","mistral-moderation-latest","mistral-ocr-2505","mistral-ocr-latest","grok-beta","grok-vision-beta","grok-3","grok-3-fast","grok-3-mini","grok-3-mini-fast","grok-2-vision","grok-2","deepseek-chat","deepseek-reasoner","gemini-1.5-flash","gemini-2.0-flash","gemini-2.0-flash-lite","gemini-2.5-flash","gemini-2.5-flash-lite","gemini-2.5-pro","gemini-3-pro-preview","openrouter:arcee-ai/trinity-mini:free","openrouter:arcee-ai/trinity-mini","openrouter:deepseek/deepseek-v3.2-speciale","openrouter:deepseek/deepseek-v3.2","openrouter:prime-intellect/intellect-3","openrouter:tngtech/tng-r1t-chimera:free","openrouter:tngtech/tng-r1t-chimera","openrouter:anthropic/claude-opus-4.5","openrouter:openrouter/bert-nebulon-alpha","openrouter:allenai/olmo-3-32b-think","openrouter:allenai/olmo-3-7b-instruct","openrouter:allenai/olmo-3-7b-think","openrouter:google/gemini-3-pro-image-preview","openrouter:x-ai/grok-4.1-fast:free","openrouter:google/gemini-3-pro-preview","openrouter:deepcogito/cogito-v2.1-671b","openrouter:openai/gpt-5.1","openrouter:openai/gpt-5.1-chat","openrouter:openai/gpt-5.1-codex","openrouter:openai/gpt-5.1-codex-mini","openrouter:kwaipilot/kat-coder-pro:free","openrouter:moonshotai/kimi-linear-48b-a3b-instruct","openrouter:moonshotai/kimi-k2-thinking","openrouter:amazon/nova-premier-v1","openrouter:perplexity/sonar-pro-search","openrouter:mistralai/voxtral-small-24b-2507","openrouter:openai/gpt-oss-safeguard-20b","openrouter:nvidia/nemotron-nano-12b-v2-vl:free","openrouter:nvidia/nemotron-nano-12b-v2-vl","openrouter:minimax/minimax-m2","openrouter:liquid/lfm2-8b-a1b","openrouter:liquid/lfm-2.2-6b","openrouter:ibm-granite/granite-4.0-h-micro","openrouter:deepcogito/cogito-v2-preview-llama-405b","openrouter:openai/gpt-5-image-mini","openrouter:anthropic/claude-haiku-4.5","openrouter:qwen/qwen3-vl-8b-thinking","openrouter:qwen/qwen3-vl-8b-instruct","openrouter:openai/gpt-5-image","openrouter:openai/o3-deep-research","openrouter:openai/o4-mini-deep-research","openrouter:nvidia/llama-3.3-nemotron-super-49b-v1.5","openrouter:baidu/ernie-4.5-21b-a3b-thinking","openrouter:google/gemini-2.5-flash-image","openrouter:qwen/qwen3-vl-30b-a3b-thinking","openrouter:qwen/qwen3-vl-30b-a3b-instruct","openrouter:openai/gpt-5-pro","openrouter:z-ai/glm-4.6","openrouter:z-ai/glm-4.6:exacto","openrouter:anthropic/claude-sonnet-4.5","openrouter:deepseek/deepseek-v3.2-exp","openrouter:thedrummer/cydonia-24b-v4.1","openrouter:relace/relace-apply-3","openrouter:google/gemini-2.5-flash-preview-09-2025","openrouter:google/gemini-2.5-flash-lite-preview-09-2025","openrouter:qwen/qwen3-vl-235b-a22b-thinking","openrouter:qwen/qwen3-vl-235b-a22b-instruct","openrouter:qwen/qwen3-max","openrouter:qwen/qwen3-coder-plus","openrouter:openai/gpt-5-codex","openrouter:deepseek/deepseek-v3.1-terminus","openrouter:deepseek/deepseek-v3.1-terminus:exacto","openrouter:x-ai/grok-4-fast","openrouter:alibaba/tongyi-deepresearch-30b-a3b:free","openrouter:alibaba/tongyi-deepresearch-30b-a3b","openrouter:qwen/qwen3-coder-flash","openrouter:opengvlab/internvl3-78b","openrouter:qwen/qwen3-next-80b-a3b-thinking","openrouter:qwen/qwen3-next-80b-a3b-instruct","openrouter:meituan/longcat-flash-chat:free","openrouter:meituan/longcat-flash-chat","openrouter:qwen/qwen-plus-2025-07-28","openrouter:qwen/qwen-plus-2025-07-28:thinking","openrouter:nvidia/nemotron-nano-9b-v2:free","openrouter:nvidia/nemotron-nano-9b-v2","openrouter:moonshotai/kimi-k2-0905","openrouter:moonshotai/kimi-k2-0905:exacto","openrouter:deepcogito/cogito-v2-preview-llama-70b","openrouter:deepcogito/cogito-v2-preview-llama-109b-moe","openrouter:deepcogito/cogito-v2-preview-deepseek-671b","openrouter:stepfun-ai/step3","openrouter:qwen/qwen3-30b-a3b-thinking-2507","openrouter:x-ai/grok-code-fast-1","openrouter:nousresearch/hermes-4-70b","openrouter:nousresearch/hermes-4-405b","openrouter:google/gemini-2.5-flash-image-preview","openrouter:deepseek/deepseek-chat-v3.1","openrouter:openai/gpt-4o-audio-preview","openrouter:mistralai/mistral-medium-3.1","openrouter:baidu/ernie-4.5-21b-a3b","openrouter:baidu/ernie-4.5-vl-28b-a3b","openrouter:z-ai/glm-4.5v","openrouter:ai21/jamba-mini-1.7","openrouter:ai21/jamba-large-1.7","openrouter:openai/gpt-5-chat","openrouter:openai/gpt-5","openrouter:openai/gpt-5-mini","openrouter:openai/gpt-5-nano","openrouter:openai/gpt-oss-120b:exacto","openrouter:openai/gpt-oss-120b","openrouter:openai/gpt-oss-20b:free","openrouter:openai/gpt-oss-20b","openrouter:anthropic/claude-opus-4.1","openrouter:mistralai/codestral-2508","openrouter:qwen/qwen3-coder-30b-a3b-instruct","openrouter:qwen/qwen3-30b-a3b-instruct-2507","openrouter:z-ai/glm-4.5","openrouter:z-ai/glm-4.5-air:free","openrouter:z-ai/glm-4.5-air","openrouter:qwen/qwen3-235b-a22b-thinking-2507","openrouter:z-ai/glm-4-32b","openrouter:qwen/qwen3-coder:free","openrouter:qwen/qwen3-coder","openrouter:qwen/qwen3-coder:exacto","openrouter:bytedance/ui-tars-1.5-7b","openrouter:google/gemini-2.5-flash-lite","openrouter:qwen/qwen3-235b-a22b-2507","openrouter:switchpoint/router","openrouter:moonshotai/kimi-k2:free","openrouter:moonshotai/kimi-k2","openrouter:thudm/glm-4.1v-9b-thinking","openrouter:mistralai/devstral-medium","openrouter:mistralai/devstral-small","openrouter:cognitivecomputations/dolphin-mistral-24b-venice-edition:free","openrouter:x-ai/grok-4","openrouter:google/gemma-3n-e2b-it:free","openrouter:tencent/hunyuan-a13b-instruct","openrouter:tngtech/deepseek-r1t2-chimera:free","openrouter:tngtech/deepseek-r1t2-chimera","openrouter:morph/morph-v3-large","openrouter:morph/morph-v3-fast","openrouter:baidu/ernie-4.5-vl-424b-a47b","openrouter:baidu/ernie-4.5-300b-a47b","openrouter:thedrummer/anubis-70b-v1.1","openrouter:inception/mercury","openrouter:mistralai/mistral-small-3.2-24b-instruct","openrouter:minimax/minimax-m1","openrouter:google/gemini-2.5-flash","openrouter:google/gemini-2.5-pro","openrouter:moonshotai/kimi-dev-72b","openrouter:openai/o3-pro","openrouter:x-ai/grok-3-mini","openrouter:x-ai/grok-3","openrouter:mistralai/magistral-small-2506","openrouter:mistralai/magistral-medium-2506:thinking","openrouter:mistralai/magistral-medium-2506","openrouter:google/gemini-2.5-pro-preview","openrouter:deepseek/deepseek-r1-0528-qwen3-8b","openrouter:deepseek/deepseek-r1-0528","openrouter:anthropic/claude-opus-4","openrouter:anthropic/claude-sonnet-4","openrouter:mistralai/devstral-small-2505","openrouter:google/gemma-3n-e4b-it:free","openrouter:google/gemma-3n-e4b-it","openrouter:openai/codex-mini","openrouter:nousresearch/deephermes-3-mistral-24b-preview","openrouter:mistralai/mistral-medium-3","openrouter:google/gemini-2.5-pro-preview-05-06","openrouter:arcee-ai/spotlight","openrouter:arcee-ai/maestro-reasoning","openrouter:arcee-ai/virtuoso-large","openrouter:arcee-ai/coder-large","openrouter:microsoft/phi-4-reasoning-plus","openrouter:inception/mercury-coder","openrouter:qwen/qwen3-4b:free","openrouter:deepseek/deepseek-prover-v2","openrouter:meta-llama/llama-guard-4-12b","openrouter:qwen/qwen3-30b-a3b","openrouter:qwen/qwen3-8b","openrouter:qwen/qwen3-14b","openrouter:qwen/qwen3-32b","openrouter:qwen/qwen3-235b-a22b:free","openrouter:qwen/qwen3-235b-a22b","openrouter:tngtech/deepseek-r1t-chimera:free","openrouter:tngtech/deepseek-r1t-chimera","openrouter:microsoft/mai-ds-r1","openrouter:openai/o4-mini-high","openrouter:openai/o3","openrouter:openai/o4-mini","openrouter:qwen/qwen2.5-coder-7b-instruct","openrouter:openai/gpt-4.1","openrouter:openai/gpt-4.1-mini","openrouter:openai/gpt-4.1-nano","openrouter:eleutherai/llemma_7b","openrouter:alfredpros/codellama-7b-instruct-solidity","openrouter:arliai/qwq-32b-arliai-rpr-v1","openrouter:x-ai/grok-3-mini-beta","openrouter:x-ai/grok-3-beta","openrouter:nvidia/llama-3.1-nemotron-ultra-253b-v1","openrouter:meta-llama/llama-4-maverick","openrouter:meta-llama/llama-4-scout","openrouter:qwen/qwen2.5-vl-32b-instruct","openrouter:deepseek/deepseek-chat-v3-0324","openrouter:openai/o1-pro","openrouter:mistralai/mistral-small-3.1-24b-instruct:free","openrouter:mistralai/mistral-small-3.1-24b-instruct","openrouter:allenai/olmo-2-0325-32b-instruct","openrouter:google/gemma-3-4b-it:free","openrouter:google/gemma-3-4b-it","openrouter:google/gemma-3-12b-it:free","openrouter:google/gemma-3-12b-it","openrouter:cohere/command-a","openrouter:openai/gpt-4o-mini-search-preview","openrouter:openai/gpt-4o-search-preview","openrouter:google/gemma-3-27b-it:free","openrouter:google/gemma-3-27b-it","openrouter:thedrummer/skyfall-36b-v2","openrouter:microsoft/phi-4-multimodal-instruct","openrouter:perplexity/sonar-reasoning-pro","openrouter:perplexity/sonar-pro","openrouter:perplexity/sonar-deep-research","openrouter:qwen/qwq-32b","openrouter:google/gemini-2.0-flash-lite-001","openrouter:anthropic/claude-3.7-sonnet:thinking","openrouter:anthropic/claude-3.7-sonnet","openrouter:mistralai/mistral-saba","openrouter:meta-llama/llama-guard-3-8b","openrouter:openai/o3-mini-high","openrouter:google/gemini-2.0-flash-001","openrouter:qwen/qwen-vl-plus","openrouter:aion-labs/aion-1.0","openrouter:aion-labs/aion-1.0-mini","openrouter:aion-labs/aion-rp-llama-3.1-8b","openrouter:qwen/qwen-vl-max","openrouter:qwen/qwen-turbo","openrouter:qwen/qwen2.5-vl-72b-instruct","openrouter:qwen/qwen-plus","openrouter:qwen/qwen-max","openrouter:openai/o3-mini","openrouter:mistralai/mistral-small-24b-instruct-2501","openrouter:deepseek/deepseek-r1-distill-qwen-32b","openrouter:perplexity/sonar-reasoning","openrouter:perplexity/sonar","openrouter:deepseek/deepseek-r1-distill-llama-70b","openrouter:deepseek/deepseek-r1","openrouter:minimax/minimax-01","openrouter:mistralai/codestral-2501","openrouter:microsoft/phi-4","openrouter:sao10k/l3.1-70b-hanami-x1","openrouter:deepseek/deepseek-chat","openrouter:sao10k/l3.3-euryale-70b","openrouter:openai/o1","openrouter:cohere/command-r7b-12-2024","openrouter:google/gemini-2.0-flash-exp:free","openrouter:meta-llama/llama-3.3-70b-instruct:free","openrouter:meta-llama/llama-3.3-70b-instruct","openrouter:amazon/nova-lite-v1","openrouter:amazon/nova-micro-v1","openrouter:amazon/nova-pro-v1","openrouter:openai/gpt-4o-2024-11-20","openrouter:mistralai/mistral-large-2411","openrouter:mistralai/mistral-large-2407","openrouter:mistralai/pixtral-large-2411","openrouter:qwen/qwen-2.5-coder-32b-instruct","openrouter:raifle/sorcererlm-8x22b","openrouter:thedrummer/unslopnemo-12b","openrouter:anthropic/claude-3.5-haiku-20241022","openrouter:anthropic/claude-3.5-haiku","openrouter:anthropic/claude-3.5-sonnet","openrouter:anthracite-org/magnum-v4-72b","openrouter:mistralai/ministral-8b","openrouter:mistralai/ministral-3b","openrouter:qwen/qwen-2.5-7b-instruct","openrouter:nvidia/llama-3.1-nemotron-70b-instruct","openrouter:inflection/inflection-3-productivity","openrouter:inflection/inflection-3-pi","openrouter:thedrummer/rocinante-12b","openrouter:meta-llama/llama-3.2-90b-vision-instruct","openrouter:meta-llama/llama-3.2-11b-vision-instruct","openrouter:meta-llama/llama-3.2-3b-instruct:free","openrouter:meta-llama/llama-3.2-3b-instruct","openrouter:meta-llama/llama-3.2-1b-instruct","openrouter:qwen/qwen-2.5-72b-instruct","openrouter:neversleep/llama-3.1-lumimaid-8b","openrouter:mistralai/pixtral-12b","openrouter:cohere/command-r-plus-08-2024","openrouter:cohere/command-r-08-2024","openrouter:qwen/qwen-2.5-vl-7b-instruct","openrouter:sao10k/l3.1-euryale-70b","openrouter:microsoft/phi-3.5-mini-128k-instruct","openrouter:nousresearch/hermes-3-llama-3.1-70b","openrouter:nousresearch/hermes-3-llama-3.1-405b:free","openrouter:nousresearch/hermes-3-llama-3.1-405b","openrouter:openai/chatgpt-4o-latest","openrouter:sao10k/l3-lunaris-8b","openrouter:openai/gpt-4o-2024-08-06","openrouter:meta-llama/llama-3.1-405b","openrouter:meta-llama/llama-3.1-70b-instruct","openrouter:meta-llama/llama-3.1-8b-instruct","openrouter:meta-llama/llama-3.1-405b-instruct","openrouter:mistralai/mistral-nemo","openrouter:openai/gpt-4o-mini","openrouter:openai/gpt-4o-mini-2024-07-18","openrouter:google/gemma-2-27b-it","openrouter:google/gemma-2-9b-it","openrouter:sao10k/l3-euryale-70b","openrouter:nousresearch/hermes-2-pro-llama-3-8b","openrouter:mistralai/mistral-7b-instruct-v0.3","openrouter:mistralai/mistral-7b-instruct:free","openrouter:mistralai/mistral-7b-instruct","openrouter:microsoft/phi-3-mini-128k-instruct","openrouter:microsoft/phi-3-medium-128k-instruct","openrouter:openai/gpt-4o-2024-05-13","openrouter:openai/gpt-4o","openrouter:openai/gpt-4o:extended","openrouter:meta-llama/llama-guard-2-8b","openrouter:meta-llama/llama-3-70b-instruct","openrouter:meta-llama/llama-3-8b-instruct","openrouter:mistralai/mixtral-8x22b-instruct","openrouter:microsoft/wizardlm-2-8x22b","openrouter:openai/gpt-4-turbo","openrouter:anthropic/claude-3-haiku","openrouter:anthropic/claude-3-opus","openrouter:mistralai/mistral-large","openrouter:openai/gpt-3.5-turbo-0613","openrouter:openai/gpt-4-turbo-preview","openrouter:mistralai/mistral-small","openrouter:mistralai/mistral-tiny","openrouter:mistralai/mistral-7b-instruct-v0.2","openrouter:mistralai/mixtral-8x7b-instruct","openrouter:neversleep/noromaid-20b","openrouter:alpindale/goliath-120b","openrouter:openrouter/auto","openrouter:openai/gpt-4-1106-preview","openrouter:openai/gpt-3.5-turbo-instruct","openrouter:mistralai/mistral-7b-instruct-v0.1","openrouter:openai/gpt-3.5-turbo-16k","openrouter:mancer/weaver","openrouter:undi95/remm-slerp-l2-13b","openrouter:gryphe/mythomax-l2-13b","openrouter:openai/gpt-3.5-turbo","openrouter:openai/gpt-4-0314","openrouter:openai/gpt-4","fake","costly","abuse"
  ],
  IMAGE_MODELS: ["gpt-image-1"],
  VIDEO_MODELS: ["sora-2", "sora-2-pro"],

  DEFAULT_CHAT_MODEL: "gpt-4o-mini",
  DEFAULT_IMAGE_MODEL: "gpt-image-1",
  DEFAULT_VIDEO_MODEL: "sora-2",
};

// 凭证轮询状态
let tokenIndex = 0;

// --- [第二部分: Worker 入口与路由] ---
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return handleUI(request);
    } else if (url.pathname.startsWith('/v1/')) {
      return handleApi(request);
    } else {
      return createErrorResponse(`路径未找到: ${url.pathname}`, 404, 'not_found');
    }
  }
};

// --- [第三部分: API 代理逻辑] ---

/**
 * 处理所有 /v1/ 路径下的 API 请求
 * @param {Request} request - 传入的请求对象
 * @returns {Promise<Response>}
 */
async function handleApi(request) {
  if (request.method === 'OPTIONS') {
    return handleCorsPreflight();
  }

  const authHeader = request.headers.get('Authorization');
  if (CONFIG.API_MASTER_KEY && CONFIG.API_MASTER_KEY !== "1") {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('需要 Bearer Token 认证。', 401, 'unauthorized');
    }
    const token = authHeader.substring(7);
    if (token !== CONFIG.API_MASTER_KEY) {
      return createErrorResponse('无效的 API Key。', 403, 'invalid_api_key');
    }
  }

  const url = new URL(request.url);
  const requestId = `puter-${crypto.randomUUID()}`;

  switch (url.pathname) {
    case '/v1/models':
      return handleModelsRequest();
    case '/v1/chat/completions':
      return handleChatCompletions(request, requestId);
    case '/v1/images/generations':
      return handleImageGenerations(request, requestId);
    case '/v1/videos/generations':
      return handleVideoGenerations(request, requestId);
    default:
      return createErrorResponse(`API 路径不支持: ${url.pathname}`, 404, 'not_found');
  }
}

/**
 * 处理 /v1/models 请求，并应用缓存
 * @returns {Promise<Response>}
 */
async function handleModelsRequest() {
    const cache = caches.default;
    const cacheKey = new Request(new URL('/v1/models', 'https://puter-2api.cache').toString());
    let response = await cache.match(cacheKey);

    if (!response) {
        const allModels = [...CONFIG.CHAT_MODELS, ...CONFIG.IMAGE_MODELS, ...CONFIG.VIDEO_MODELS];
        const modelsData = {
            object: 'list',
            data: allModels.map(modelId => ({
                id: modelId,
                object: 'model',
                created: Math.floor(Date.now() / 1000),
                owned_by: 'puter-2api',
            })),
        };
        response = new Response(JSON.stringify(modelsData), {
            headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
        });
        response.headers.set("Cache-Control", "s-maxage=3600"); // 缓存1小时
        await cache.put(cacheKey, response.clone());
    }
    return response;
}

/**
 * 处理 /v1/chat/completions 请求
 * @param {Request} request
 * @param {string} requestId
 * @returns {Promise<Response>}
 */
async function handleChatCompletions(request, requestId) {
  try {
    const requestData = await request.json();
    const upstreamPayload = createUpstreamPayload('chat', requestData);

    const upstreamResponse = await fetch(CONFIG.UPSTREAM_URL, {
      method: 'POST',
      headers: createUpstreamHeaders(requestId),
      body: JSON.stringify(upstreamPayload),
    });

    if (!upstreamResponse.ok) {
      return await handleErrorResponse(upstreamResponse);
    }

    const transformStream = createUpstreamToOpenAIStream(requestId, requestData.model || CONFIG.DEFAULT_CHAT_MODEL);

    if (upstreamResponse.body) {
        const [pipedStream] = upstreamResponse.body.tee();
        return new Response(pipedStream.pipeThrough(transformStream), {
            headers: corsHeaders({
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Worker-Trace-ID': requestId,
            }),
        });
    } else {
        return createErrorResponse('上游未返回有效响应体。', 502, 'bad_gateway');
    }

  } catch (e) {
    console.error('处理聊天请求时发生异常:', e);
    return createErrorResponse(`处理请求时发生内部错误: ${e.message}`, 500, 'internal_server_error');
  }
}

/**
 * 处理 /v1/images/generations 请求
 * @param {Request} request
 * @param {string} requestId
 * @returns {Promise<Response>}
 */
async function handleImageGenerations(request, requestId) {
    try {
        const requestData = await request.json();
        const upstreamPayload = createUpstreamPayload('image', requestData);

        const upstreamResponse = await fetch(CONFIG.UPSTREAM_URL, {
            method: 'POST',
            headers: createUpstreamHeaders(requestId),
            body: JSON.stringify(upstreamPayload),
        });

        if (!upstreamResponse.ok) {
            return await handleErrorResponse(upstreamResponse);
        }

        const imageBytes = await upstreamResponse.arrayBuffer();

        // [修复] 使用循环代替扩展运算符来处理二进制数据，防止堆栈溢出
        const bytes = new Uint8Array(imageBytes);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const b64_json = btoa(binary);

        const responseData = {
            created: Math.floor(Date.now() / 1000),
            data: [{ b64_json: b64_json }]
        };

        return new Response(JSON.stringify(responseData), {
            headers: corsHeaders({
                'Content-Type': 'application/json; charset=utf-8',
                'X-Worker-Trace-ID': requestId,
            }),
        });

    } catch (e) {
        console.error('处理图像生成请求时发生异常:', e);
        return createErrorResponse(`处理请求时发生内部错误: ${e.message}`, 500, 'internal_server_error');
    }
}

/**
 * 处理 /v1/videos/generations 请求
 * @param {Request} request
 * @param {string} requestId
 * @returns {Promise<Response>}
 */
async function handleVideoGenerations(request, requestId) {
    // [修改] 根据用户要求，禁用视频生成功能，并返回明确的错误提示。
    return createErrorResponse(
        '此部署版本不支持视频生成功能。该功能可能需要 Puter.com 的高级账户才能使用。',
        403, // 403 Forbidden 表示服务器理解请求但拒绝授权
        'access_denied'
    );

    /*
    // 原始代码已被禁用
    try {
        const requestData = await request.json();
        const upstreamPayload = createUpstreamPayload('video', requestData);

        const upstreamResponse = await fetch(CONFIG.UPSTREAM_URL, {
            method: 'POST',
            headers: createUpstreamHeaders(requestId),
            body: JSON.stringify(upstreamPayload),
        });

        if (!upstreamResponse.ok) {
            return await handleErrorResponse(upstreamResponse);
        }

        const result = await upstreamResponse.json();
        const videoUrl = typeof result === 'string' ? result : (result.url || '');

        if (!videoUrl) {
            return createErrorResponse('上游未返回有效的视频 URL。', 502, 'bad_gateway');
        }

        const responseData = {
            created: Math.floor(Date.now() / 1000),
            data: [{ url: videoUrl }]
        };

        return new Response(JSON.stringify(responseData), {
            headers: corsHeaders({
                'Content-Type': 'application/json; charset=utf-8',
                'X-Worker-Trace-ID': requestId,
            }),
        });

    } catch (e) {
        console.error('处理视频生成请求时发生异常:', e);
        return createErrorResponse(`处理请求时发生内部错误: ${e.message}`, 500, 'internal_server_error');
    }
    */
}

// --- 辅助函数 ---

function _get_auth_token() {
    const token = CONFIG.PUTER_AUTH_TOKENS[tokenIndex];
    tokenIndex = (tokenIndex + 1) % CONFIG.PUTER_AUTH_TOKENS.length;
    return token;
}

function getDriverFromModel(model) {
    if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4")) return "openai-completion";
    if (model.startsWith("claude")) return "claude";
    if (model.startsWith("gemini")) return "gemini";
    if (model.startsWith("grok")) return "xai";
    return "openai-completion"; // 默认
}

function createUpstreamPayload(type, requestData) {
    const authToken = _get_auth_token();
    switch (type) {
        case 'chat':
            const model = requestData.model || CONFIG.DEFAULT_CHAT_MODEL;
            return {
                interface: "puter-chat-completion",
                driver: getDriverFromModel(model),
                test_mode: false,
                method: "complete",
                args: {
                    messages: requestData.messages,
                    model: model,
                    stream: true
                },
                auth_token: authToken
            };
        case 'image':
            return {
                interface: "puter-image-generation",
                driver: "openai-image-generation",
                test_mode: false,
                method: "generate",
                args: {
                    model: requestData.model || CONFIG.DEFAULT_IMAGE_MODEL,
                    quality: requestData.quality || "high",
                    prompt: requestData.prompt
                },
                auth_token: authToken
            };
        case 'video':
            return {
                interface: "puter-video-generation",
                driver: "openai-video-generation",
                test_mode: false,
                method: "generate",
                args: {
                    model: requestData.model || CONFIG.DEFAULT_VIDEO_MODEL,
                    seconds: requestData.seconds || 8,
                    size: requestData.size || "1280x720",
                    prompt: requestData.prompt
                },
                auth_token: authToken
            };
    }
}

function createUpstreamHeaders(requestId) {
    return {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://docs.puter.com',
        'Referer': 'https://docs.puter.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'X-Request-ID': requestId,
    };
}

async function handleErrorResponse(response) {
    const errorBody = await response.text();
    console.error(`上游服务错误: ${response.status}`, errorBody);
    try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.error && errorJson.error.message) {
             return createErrorResponse(`上游服务错误: ${errorJson.error.message}`, response.status, errorJson.error.code || 'upstream_error');
        }
    } catch(e) {}
    return createErrorResponse(`上游服务返回错误 ${response.status}: ${errorBody}`, response.status, 'upstream_error');
}

function createUpstreamToOpenAIStream(requestId, model) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'text' && typeof data.text === 'string') {
              const openAIChunk = {
                id: requestId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{ index: 0, delta: { content: data.text }, finish_reason: null }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
            }
          } catch (e) {
            console.error('无法解析上游 NDJSON 数据块:', line, e);
          }
        }
      }
    },
    flush(controller) {
      const finalChunk = {
        id: requestId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    },
  });
}

function handleCorsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function createErrorResponse(message, status, code) {
  return new Response(JSON.stringify({ error: { message, type: 'api_error', code } }), {
    status,
    headers: corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  });
}

function corsHeaders(headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// --- [第四部分: 开发者驾驶舱 UI] ---
function handleUI(request) {
  const origin = new URL(request.url).origin;
  const allModels = [...CONFIG.CHAT_MODELS, ...CONFIG.IMAGE_MODELS, ...CONFIG.VIDEO_MODELS];

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.PROJECT_NAME} - 开发者驾驶舱</title>
    <style>
      :root { --bg-color: #121212; --sidebar-bg: #1E1E1E; --main-bg: #121212; --border-color: #333333; --text-color: #E0E0E0; --text-secondary: #888888; --primary-color: #FFBF00; --primary-hover: #FFD700; --input-bg: #2A2A2A; --error-color: #CF6679; --success-color: #66BB6A; --font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; --font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace; }
      * { box-sizing: border-box; }
      body { font-family: var(--font-family); margin: 0; background-color: var(--bg-color); color: var(--text-color); font-size: 14px; display: flex; height: 100vh; overflow: hidden; }
      .skeleton { background-color: #2a2a2a; background-image: linear-gradient(90deg, #2a2a2a, #3a3a3a, #2a2a2a); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 4px; }
      @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      select, textarea, input { background-color: var(--input-bg); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-color); padding: 10px; font-family: var(--font-family); font-size: 14px; width: 100%; }
      select:focus, textarea:focus, input:focus { outline: none; border-color: var(--primary-color); }
    </style>
</head>
<body>
    <main-layout></main-layout>
    <template id="main-layout-template">
      <style>
        .layout { display: flex; width: 100%; height: 100vh; }
        .sidebar { width: 380px; flex-shrink: 0; background-color: var(--sidebar-bg); border-right: 1px solid var(--border-color); padding: 20px; display: flex; flex-direction: column; overflow-y: auto; }
        .main-content { flex-grow: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); }
        .header h1 { margin: 0; font-size: 20px; }
        .header .version { font-size: 12px; color: var(--text-secondary); margin-left: 8px; }
        .collapsible-section { margin-top: 20px; }
        .collapsible-section summary { cursor: pointer; font-weight: bold; margin-bottom: 10px; list-style: none; }
        .collapsible-section summary::-webkit-details-marker { display: none; }
        .collapsible-section summary::before { content: '▶'; margin-right: 8px; display: inline-block; transition: transform 0.2s; }
        .collapsible-section[open] > summary::before { transform: rotate(90deg); }
        @media (max-width: 768px) { .layout { flex-direction: column; } .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border-color); } }
      </style>
      <div class="layout">
        <aside class="sidebar">
          <header class="header">
            <h1>${CONFIG.PROJECT_NAME}<span class="version">v${CONFIG.PROJECT_VERSION}</span></h1>
            <status-indicator></status-indicator>
          </header>
          <info-panel></info-panel>
          <details class="collapsible-section" open><summary>⚙️ 主流客户端集成</summary><client-guides></client-guides></details>
          <details class="collapsible-section"><summary>📚 模型总览</summary><model-list-panel></model-list-panel></details>
        </aside>
        <main class="main-content"><live-terminal></live-terminal></main>
      </div>
    </template>
    <template id="status-indicator-template">
      <style>
        .indicator { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; transition: background-color 0.3s; }
        .dot.grey { background-color: #555; } .dot.yellow { background-color: #FFBF00; animation: pulse 2s infinite; } .dot.green { background-color: var(--success-color); } .dot.red { background-color: var(--error-color); }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 191, 0, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(255, 191, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 191, 0, 0); } }
      </style>
      <div class="indicator"><div id="status-dot" class="dot grey"></div><span id="status-text">正在初始化...</span></div>
    </template>
    <template id="info-panel-template">
      <style>
        .panel { display: flex; flex-direction: column; gap: 12px; } .info-item { display: flex; flex-direction: column; } .info-item label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
        .info-value { background-color: var(--input-bg); padding: 8px 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; color: var(--primary-color); display: flex; align-items: center; justify-content: space-between; word-break: break-all; }
        .info-value.password { -webkit-text-security: disc; } .info-value.visible { -webkit-text-security: none; } .actions { display: flex; gap: 8px; }
        .icon-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px; display: flex; align-items: center; } .icon-btn:hover { color: var(--text-color); } .icon-btn svg { width: 16px; height: 16px; } .skeleton { height: 34px; }
      </style>
      <div class="panel">
        <div class="info-item"><label>API 端点 (Endpoint)</label><div id="api-url" class="info-value skeleton"></div></div>
        <div class="info-item"><label>API 密钥 (Master Key)</label><div id="api-key" class="info-value password skeleton"></div></div>
      </div>
    </template>
    <template id="client-guides-template">
       <style>
        .tabs { display: flex; border-bottom: 1px solid var(--border-color); } .tab { padding: 8px 12px; cursor: pointer; border: none; background: none; color: var(--text-secondary); } .tab.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
        .content { padding: 15px 0; } pre { background-color: var(--input-bg); padding: 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; white-space: pre-wrap; word-break: break-all; position: relative; }
        .copy-code-btn { position: absolute; top: 8px; right: 8px; background: #444; border: 1px solid #555; color: #ccc; border-radius: 4px; cursor: pointer; padding: 2px 6px; font-size: 12px; } .copy-code-btn:hover { background: #555; } .copy-code-btn.copied { background-color: var(--success-color); color: #121212; }
       </style>
       <div><div class="tabs"></div><div class="content"></div></div>
    </template>
    <template id="model-list-panel-template">
      <style>
        .model-list-container { padding-top: 10px; }
        .model-category h3 { font-size: 14px; color: var(--primary-color); margin: 15px 0 8px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 5px; }
        .model-list { list-style: none; padding: 0; margin: 0; }
        .model-list li { background-color: var(--input-bg); padding: 6px 10px; border-radius: 4px; margin-bottom: 5px; font-family: var(--font-mono); font-size: 12px; }
      </style>
      <div class="model-list-container"></div>
    </template>
    <template id="live-terminal-template">
      <style>
        .terminal { display: flex; flex-direction: column; height: 100%; background-color: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
        .mode-tabs { display: flex; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .mode-tab { padding: 10px 15px; cursor: pointer; background: none; border: none; color: var(--text-secondary); font-size: 14px; }
        .mode-tab.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
        /* [修改] 为视频功能的提示标签添加样式 */
        .pro-tag { font-size: 10px; color: var(--primary-color); margin-left: 5px; vertical-align: super; opacity: 0.8; }
        .output-window { flex-grow: 1; padding: 15px; overflow-y: auto; line-height: 1.6; }
        .output-window p, .output-window div { margin: 0 0 1em 0; }
        .output-window .message.user { color: var(--primary-color); font-weight: bold; }
        .output-window .message.assistant { color: var(--text-color); white-space: pre-wrap; }
        .output-window .message.error { color: var(--error-color); }
        .output-window img, .output-window video { max-width: 100%; border-radius: 4px; }
        .input-area { border-top: 1px solid var(--border-color); padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .tab-content { display: none; } .tab-content.active { display: flex; flex-direction: column; gap: 10px; }
        .param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        textarea { flex-grow: 1; resize: none; min-height: 80px; }
        .submit-btn { background-color: var(--primary-color); color: #121212; border: none; border-radius: 4px; padding: 10px 15px; height: 42px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .submit-btn:hover { background-color: var(--primary-hover); } .submit-btn:disabled { background-color: #555; cursor: not-allowed; }
        .submit-btn.cancel svg { width: 24px; height: 24px; } .submit-btn svg { width: 20px; height: 20px; }
        .placeholder { color: var(--text-secondary); }
      </style>
      <div class="terminal">
        <div class="mode-tabs">
          <button class="mode-tab active" data-mode="chat">文生文 (Chat)</button>
          <!-- [修改] 未修复目前不可用 -->
          <button class="mode-tab" data-mode="image">文生图 (Image)<span class="pro-tag">未修复目前不可用</span></button>
          <!-- [修改] 在UI上标注视频功能需要高级账户 -->
          <button class="mode-tab" data-mode="video">文生视频 (Video)<span class="pro-tag">需高级账户</span></button>
        </div>
        <div class="output-window"><p class="placeholder">多模态测试终端已就绪。请选择模式并输入指令...</p></div>
        <div class="input-area">
          <!-- Chat Panel -->
          <div id="chat-panel" class="tab-content active">
            <select id="chat-model-select"></select>
            <textarea id="chat-prompt-input" rows="3" placeholder="输入您的对话内容..."></textarea>
          </div>
          <!-- Image Panel -->
          <div id="image-panel" class="tab-content">
            <select id="image-model-select"></select>
            <textarea id="image-prompt-input" rows="3" placeholder="输入您的图片描述..."></textarea>
          </div>
          <!-- Video Panel -->
          <div id="video-panel" class="tab-content">
            <select id="video-model-select"></select>
            <textarea id="video-prompt-input" rows="3" placeholder="输入您的视频描述... (此功能当前不可用)"></textarea>
            <div class="param-grid">
              <input type="text" id="video-size-input" value="1280x720" placeholder="分辨率 (e.g., 1280x720)">
              <input type="number" id="video-seconds-input" value="8" placeholder="视频时长 (秒)">
            </div>
          </div>
          <button id="submit-btn" class="submit-btn" title="发送/生成">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l3.239-1.281a.75.75 0 000-1.39L4.23 6.28a.75.75 0 00-.95-.545L1.865 3.45a.75.75 0 00.95-.826l.002-.007.002-.006zm.002 14.422a.75.75 0 00.95.826l1.415-2.28a.75.75 0 00-.545-.95l-3.239-1.28a.75.75 0 00-1.39 0l-1.28 3.239a.75.75 0 00.544.95l4.95 1.414zM12.75 8.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></svg>
          </button>
        </div>
      </div>
    </template>
    <script>
      const CLIENT_CONFIG = { 
        WORKER_ORIGIN: '${origin}', 
        API_MASTER_KEY: '${CONFIG.API_MASTER_KEY}', 
        CHAT_MODELS: JSON.parse('${JSON.stringify(CONFIG.CHAT_MODELS)}'),
        IMAGE_MODELS: JSON.parse('${JSON.stringify(CONFIG.IMAGE_MODELS)}'),
        VIDEO_MODELS: JSON.parse('${JSON.stringify(CONFIG.VIDEO_MODELS)}'),
        DEFAULT_CHAT_MODEL: '${CONFIG.DEFAULT_CHAT_MODEL}',
        CUSTOM_MODELS_STRING: '${allModels.map(m => `+${m}`).join(',')}' 
      };

      const AppState = { INITIALIZING: 'INITIALIZING', HEALTH_CHECKING: 'HEALTH_CHECKING', READY: 'READY', REQUESTING: 'REQUESTING', STREAMING: 'STREAMING', ERROR: 'ERROR' };
      let currentState = AppState.INITIALIZING;
      let abortController = null;

      class BaseComponent extends HTMLElement {
        constructor(id) {
          super();
          this.attachShadow({ mode: 'open' });
          const template = document.getElementById(id);
          if (template) this.shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }

      class MainLayout extends BaseComponent { constructor() { super('main-layout-template'); } }
      customElements.define('main-layout', MainLayout);

      class StatusIndicator extends BaseComponent {
        constructor() { super('status-indicator-template'); this.dot = this.shadowRoot.getElementById('status-dot'); this.text = this.shadowRoot.getElementById('status-text'); }
        setState(state, message) {
          this.dot.className = 'dot';
          switch (state) {
            case 'checking': this.dot.classList.add('yellow'); break;
            case 'ok': this.dot.classList.add('green'); break;
            case 'error': this.dot.classList.add('red'); break;
            default: this.dot.classList.add('grey'); break;
          }
          this.text.textContent = message;
        }
      }
      customElements.define('status-indicator', StatusIndicator);

      class InfoPanel extends BaseComponent {
        constructor() { super('info-panel-template'); this.apiUrlEl = this.shadowRoot.getElementById('api-url'); this.apiKeyEl = this.shadowRoot.getElementById('api-key'); }
        connectedCallback() { this.render(); }
        render() {
          this.populateField(this.apiUrlEl, CLIENT_CONFIG.WORKER_ORIGIN + '/v1');
          this.populateField(this.apiKeyEl, CLIENT_CONFIG.API_MASTER_KEY, true);
        }
        populateField(el, value, isPassword = false) {
          el.classList.remove('skeleton');
          el.innerHTML = \`<span>\${value}</span><div class="actions">\${isPassword ? '<button class="icon-btn" data-action="toggle-visibility" title="切换可见性"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.473a1.65 1.65 0 012.899 0l.88 1.473a1.65 1.65 0 010 1.18l-.88 1.473a1.65 1.65 0 01-2.899 0l-.88-1.473zM18.45 10.59a1.651 1.651 0 010-1.18l.88-1.473a1.65 1.65 0 012.899 0l.88 1.473a1.65 1.65 0 010 1.18l-.88 1.473a1.65 1.65 0 01-2.899 0l-.88-1.473zM10 17a1.651 1.651 0 01-1.18 0l-1.473-.88a1.65 1.65 0 010-2.899l1.473-.88a1.651 1.651 0 011.18 0l1.473.88a1.65 1.65 0 010 2.899l-1.473.88a1.651 1.651 0 01-1.18 0z" clip-rule="evenodd"/></svg></button>' : ''}<button class="icon-btn" data-action="copy" title="复制"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0117 6.621V16.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 16.5v-13z"/><path d="M5 6.5A1.5 1.5 0 016.5 5h3.879a1.5 1.5 0 011.06.44l3.122 3.121A1.5 1.5 0 0115 9.621V14.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 14.5v-8z"/></svg></button></div>\`;
          el.querySelector('[data-action="copy"]').addEventListener('click', () => navigator.clipboard.writeText(value));
          if (isPassword) el.querySelector('[data-action="toggle-visibility"]').addEventListener('click', () => el.classList.toggle('visible'));
        }
      }
      customElements.define('info-panel', InfoPanel);

      class ClientGuides extends BaseComponent {
        constructor() { super('client-guides-template'); this.tabs = this.shadowRoot.querySelector('.tabs'); this.content = this.shadowRoot.querySelector('.content'); this.guides = { 'cURL': this.getCurlGuide(), 'Python': this.getPythonGuide(), 'LobeChat': this.getLobeChatGuide(), 'Next-Web': this.getNextWebGuide() }; }
        connectedCallback() {
          Object.keys(this.guides).forEach((name, index) => { const tab = document.createElement('button'); tab.className = 'tab'; tab.textContent = name; if (index === 0) tab.classList.add('active'); tab.addEventListener('click', () => this.switchTab(name)); this.tabs.appendChild(tab); });
          this.switchTab(Object.keys(this.guides)[0]);
          this.content.addEventListener('click', (e) => { const button = e.target.closest('.copy-code-btn'); if (button) { const code = button.closest('pre').querySelector('code').innerText; navigator.clipboard.writeText(code).then(() => { button.textContent = '已复制!'; button.classList.add('copied'); setTimeout(() => { button.textContent = '复制'; button.classList.remove('copied'); }, 2000); }); } });
        }
        switchTab(name) { this.tabs.querySelector('.active')?.classList.remove('active'); const newActiveTab = Array.from(this.tabs.children).find(tab => tab.textContent === name); newActiveTab?.classList.add('active'); this.content.innerHTML = this.guides[name]; }
        getCurlGuide() { return \`<pre><button class="copy-code-btn">复制</button><code>curl --location '\\\${CLIENT_CONFIG.WORKER_ORIGIN}/v1/chat/completions' \\\\<br>--header 'Content-Type: application/json' \\\\<br>--header 'Authorization: Bearer \\\${CLIENT_CONFIG.API_MASTER_KEY}' \\\\<br>--data '{<br>    "model": "\\\${CLIENT_CONFIG.DEFAULT_CHAT_MODEL}",<br>    "messages": [{"role": "user", "content": "你好"}],<br>    "stream": true<br>}'</code></pre>\`; }
        getPythonGuide() { return \`<pre><button class="copy-code-btn">复制</button><code>import openai<br><br>client = openai.OpenAI(<br>    api_key="\\\${CLIENT_CONFIG.API_MASTER_KEY}",<br>    base_url="\\\${CLIENT_CONFIG.WORKER_ORIGIN}/v1"<br>)<br><br>stream = client.chat.completions.create(<br>    model="\\\${CLIENT_CONFIG.DEFAULT_CHAT_MODEL}",<br>    messages=[{"role": "user", "content": "你好"}],<br>    stream=True,<br>)<br><br>for chunk in stream:<br>    print(chunk.choices[0].delta.content or "", end="")</code></pre>\`; }
        getLobeChatGuide() { return \`<p>在 LobeChat 设置中:</p><pre><button class="copy-code-btn">复制</button><code>API Key: \\\${CLIENT_CONFIG.API_MASTER_KEY}<br>API 地址: \\\${CLIENT_CONFIG.WORKER_ORIGIN}<br>模型列表: (请留空或手动填入)</code></pre>\`; }
        getNextWebGuide() { return \`<p>在 ChatGPT-Next-Web 部署时:</p><pre><button class="copy-code-btn">复制</button><code>CODE=\\\${CLIENT_CONFIG.API_MASTER_KEY}<br>BASE_URL=\\\${CLIENT_CONFIG.WORKER_ORIGIN}<br>CUSTOM_MODELS=\\\${CLIENT_CONFIG.CUSTOM_MODELS_STRING}</code></pre>\`; }
      }
      customElements.define('client-guides', ClientGuides);

      class ModelListPanel extends BaseComponent {
        constructor() { super('model-list-panel-template'); this.container = this.shadowRoot.querySelector('.model-list-container'); }
        connectedCallback() { this.render(); }
        render() {
          const categories = { '文生文 (Chat)': CLIENT_CONFIG.CHAT_MODELS, '文生图 (Image)': CLIENT_CONFIG.IMAGE_MODELS, '文生视频 (Video)': CLIENT_CONFIG.VIDEO_MODELS };
          for (const [title, models] of Object.entries(categories)) {
            if (models.length > 0) {
              const categoryDiv = document.createElement('div');
              categoryDiv.className = 'model-category';
              categoryDiv.innerHTML = \`<h3>\${title}</h3><ul class="model-list">\${models.map(m => \`<li>\${m}</li>\`).join('')}</ul>\`;
              this.container.appendChild(categoryDiv);
            }
          }
        }
      }
      customElements.define('model-list-panel', ModelListPanel);

      class LiveTerminal extends BaseComponent {
        constructor() {
          super('live-terminal-template');
          this.activeMode = 'chat';
          this.output = this.shadowRoot.querySelector('.output-window');
          this.btn = this.shadowRoot.getElementById('submit-btn');
          this.tabs = this.shadowRoot.querySelectorAll('.mode-tab');
          this.panels = this.shadowRoot.querySelectorAll('.tab-content');
          
          this.inputs = {
            chat: { model: this.shadowRoot.getElementById('chat-model-select'), prompt: this.shadowRoot.getElementById('chat-prompt-input') },
            image: { model: this.shadowRoot.getElementById('image-model-select'), prompt: this.shadowRoot.getElementById('image-prompt-input') },
            video: { model: this.shadowRoot.getElementById('video-model-select'), prompt: this.shadowRoot.getElementById('video-prompt-input'), size: this.shadowRoot.getElementById('video-size-input'), seconds: this.shadowRoot.getElementById('video-seconds-input') }
          };

          this.sendIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l3.239-1.281a.75.75 0 000-1.39L4.23 6.28a.75.75 0 00-.95-.545L1.865 3.45a.75.75 0 00.95-.826l.002-.007.002-.006zm.002 14.422a.75.75 0 00.95.826l1.415-2.28a.75.75 0 00-.545-.95l-3.239-1.28a.75.75 0 00-1.39 0l-1.28 3.239a.75.75 0 00.544.95l4.95 1.414zM12.75 8.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z"/></svg>';
          this.cancelIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"/></svg>';
        }
        connectedCallback() {
          this.btn.addEventListener('click', () => this.handleSubmit());
          this.tabs.forEach(tab => tab.addEventListener('click', () => this.switchMode(tab.dataset.mode)));
          this.populateModels();
        }
        populateModels() {
          this.populateSelect(this.inputs.chat.model, CLIENT_CONFIG.CHAT_MODELS);
          this.populateSelect(this.inputs.image.model, CLIENT_CONFIG.IMAGE_MODELS);
          this.populateSelect(this.inputs.video.model, CLIENT_CONFIG.VIDEO_MODELS);
        }
        populateSelect(selectEl, models) {
          if (!selectEl || !models || models.length === 0) return;
          selectEl.innerHTML = models.map(m => \`<option value="\${m}">\${m}</option>\`).join('');
        }
        switchMode(mode) {
          this.activeMode = mode;
          this.tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
          this.panels.forEach(p => p.classList.toggle('active', p.id === \`\${mode}-panel\`));
        }
        handleSubmit() {
          if (currentState === AppState.REQUESTING || currentState === AppState.STREAMING) {
            this.cancelRequest();
          } else {
            this.startRequest();
          }
        }
        addMessage(role, content, isHtml = false) {
          const el = document.createElement('div');
          el.className = 'message ' + role;
          if (isHtml) {
            el.innerHTML = content;
          } else {
            el.textContent = content;
          }
          this.output.appendChild(el);
          this.output.scrollTop = this.output.scrollHeight;
          return el;
        }
        async startRequest() {
          const currentInputs = this.inputs[this.activeMode];
          const prompt = currentInputs.prompt.value.trim();
          if (!prompt) return;

          setState(AppState.REQUESTING);
          this.output.innerHTML = '';
          this.addMessage('user', prompt);
          abortController = new AbortController();

          try {
            switch (this.activeMode) {
              case 'chat': await this.handleChatRequest(prompt); break;
              case 'image': await this.handleImageRequest(prompt); break;
              case 'video': await this.handleVideoRequest(prompt); break;
            }
          } catch (e) {
            if (e.name !== 'AbortError') {
              this.addMessage('error', '请求失败: ' + e.message);
              setState(AppState.ERROR);
            }
          } finally {
            if (currentState !== AppState.ERROR && currentState !== AppState.INITIALIZING) {
              setState(AppState.READY);
            }
          }
        }
        async handleChatRequest(prompt) {
          const model = this.inputs.chat.model.value;
          const assistantEl = this.addMessage('assistant', '▍');
          
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], stream: true }),
            signal: abortController.signal,
          });
          if (!response.ok) throw new Error((await response.json()).error.message);

          setState(AppState.STREAMING);
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullResponse = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\\n').filter(line => line.startsWith('data:'));
            for (const line of lines) {
              const data = line.substring(5).trim();
              if (data === '[DONE]') { assistantEl.textContent = fullResponse; return; }
              try {
                const json = JSON.parse(data);
                const delta = json.choices[0].delta.content;
                if (delta) { fullResponse += delta; assistantEl.textContent = fullResponse + '▍'; this.output.scrollTop = this.output.scrollHeight; }
              } catch (e) {}
            }
          }
          assistantEl.textContent = fullResponse;
        }
        async handleImageRequest(prompt) {
          const model = this.inputs.image.model.value;
          this.addMessage('assistant', '正在生成图片...');
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/images/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY },
            body: JSON.stringify({ model, prompt }),
            signal: abortController.signal,
          });
          if (!response.ok) throw new Error((await response.json()).error.message);
          const result = await response.json();
          const b64 = result.data[0].b64_json;
          this.output.innerHTML = '';
          this.addMessage('user', prompt);
          this.addMessage('assistant', \`<img src="data:image/png;base64,\${b64}" alt="Generated Image"> \`, true);
        }
        async handleVideoRequest(prompt) {
          const model = this.inputs.video.model.value;
          const size = this.inputs.video.size.value;
          const seconds = parseInt(this.inputs.video.seconds.value, 10);
          this.addMessage('assistant', '正在请求视频生成...');
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/videos/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY },
            body: JSON.stringify({ model, prompt, size, seconds }),
            signal: abortController.signal,
          });
          // [修改] 前端将直接处理后端返回的错误信息
          if (!response.ok) throw new Error((await response.json()).error.message);
          const result = await response.json();
          const url = result.data[0].url;
          this.output.innerHTML = '';
          this.addMessage('user', prompt);
          this.addMessage('assistant', \`<video src="\${url}" controls autoplay muted loop playsinline></video>\`, true);
        }
        cancelRequest() {
          if (abortController) {
            abortController.abort();
            abortController = null;
          }
          setState(AppState.READY);
        }
        updateButton(state) {
          if (state === AppState.REQUESTING || state === AppState.STREAMING) {
            this.btn.innerHTML = this.cancelIcon;
            this.btn.title = "取消";
            this.btn.classList.add('cancel');
            this.btn.disabled = false;
          } else {
            this.btn.innerHTML = this.sendIcon;
            this.btn.title = "发送/生成";
            this.btn.classList.remove('cancel');
            this.btn.disabled = state !== AppState.READY;
          }
        }
      }
      customElements.define('live-terminal', LiveTerminal);

      function setState(newState) {
        currentState = newState;
        const terminal = document.querySelector('live-terminal');
        if (terminal) terminal.updateButton(newState);
      }

      async function healthCheck() {
        const statusIndicator = document.querySelector('main-layout')?.shadowRoot.querySelector('status-indicator');
        if (!statusIndicator) return;
        statusIndicator.setState('checking', '检查服务...');
        try {
          const response = await fetch(CLIENT_CONFIG.WORKER_ORIGIN + '/v1/models', { headers: { 'Authorization': 'Bearer ' + CLIENT_CONFIG.API_MASTER_KEY } });
          if (response.ok) {
            statusIndicator.setState('ok', '服务正常');
            setState(AppState.READY);
          } else {
            throw new Error((await response.json()).error.message);
          }
        } catch (e) {
          statusIndicator.setState('error', '检查失败');
          setState(AppState.ERROR);
        }
      }

      document.addEventListener('DOMContentLoaded', () => {
        setState(AppState.INITIALIZING);
        customElements.whenDefined('main-layout').then(() => {
          healthCheck();
        });
      });
    <\/script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
