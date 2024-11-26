import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Brain, Key, Zap, Info, Github } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { OutputDisplay } from './components/OutputDisplay';

type ModelType = 'gemini-1.5-flash' | 'gemini-1.5-pro';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-1.5-flash');

  const processText = async () => {
    if (!apiKey) {
      setError('Please enter your Gemini API key');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setIsStreaming(true);
      setOutput('');
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });

      const prompt = `Convert the following text into a flashcard format with "Definition: Term" structure, where the colon acts as a strict separator. Ensure there is no extra text or formatting, and avoid issues like misplaced colons. Each term and definition pair must be in this exact format. The content must make sense for learners to understand both the term and the definition as standalone flashcards.

Example:

The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll and carbon dioxide: Photosynthesis
The chemical element with the symbol O and atomic number 8: Oxygen
Always remember the front is the definition and the back is the term.
Now, convert the text provided:${input}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Simulate streaming for better UX
      const text = response.text();
      let currentOutput = '';
      const words = text.split(' ');
      
      for (const word of words) {
        currentOutput += word + ' ';
        setOutput(currentOutput);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (err) {
      setError('Error processing text. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-green-600" />
            Gemki
          </h1>
          <p className="mt-2 text-gray-600">Convert any text into Anki-ready flashcards using AI</p>
        </div>

        <div className="bg-white/50 backdrop-blur rounded-lg p-4 border border-green-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-700">⚠️ Important: When importing to Anki, select COLON (:) as the Field Separator!</p>
            <div className="mt-1">
              Process your content lesson by lesson rather than entire chapters at once.
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Ensures better context understanding by the AI</li>
                <li>Produces more accurate and relevant flashcards</li>
                <li>Avoids hitting content length limits</li>
                <li>Makes reviewing and organizing cards easier</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your Gemini API key"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedModel('gemini-1.5-flash')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${selectedModel === 'gemini-1.5-flash' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
            >
              <Zap className="w-4 h-4" /> Flash (Faster)
            </button>
            <button
              onClick={() => setSelectedModel('gemini-1.5-pro')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${selectedModel === 'gemini-1.5-pro' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
            >
              <Brain className="w-4 h-4" /> Pro (Smarter)
            </button>
          </div>

          <FileUploader
            onTextExtracted={setInput}
            onError={setError}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Or Enter Text Manually</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your text here..."
            />
          </div>

          <button
            onClick={processText}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Generate Flashcards'}
          </button>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {(output || isStreaming) && (
            <OutputDisplay output={output} isStreaming={isStreaming} />
          )}
        </div>

        <footer className="text-center text-sm text-gray-600">
          <a 
            href="https://github.com/phyraPH/Gemki" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <Github className="w-4 h-4" />
            View source code on GitHub (@phyraPH)
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
