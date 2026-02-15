import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro-vision', 'gemini-1.0-pro'];

console.log('Testing available models with provided API key...\n');

for (const model of models) {
  try {
    console.log(`✓ Attempting: ${model}`);
    const m = genAI.getGenerativeModel({ model });
    const response = await m.generateContent('Hi!');
    console.log(`✅ SUCCESS with ${model}`);
    console.log(`Response: ${response.response.text()}\n`);
    break;
  } catch (error) {
    console.log(`❌ FAILED: ${model}`);
    console.log(`Error: ${error.message || error}\n`);
  }
}
