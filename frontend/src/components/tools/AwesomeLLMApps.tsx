import React from 'react';

export default function AwesomeLLMApps() {
    const folders = [
        { name: 'Advanced AI Agents', description: 'Complex agent workflows and multi-agent systems', icon: '🤖' },
        { name: 'Advanced LLM Apps', description: 'Production-ready LLM applications', icon: '🚀' },
        { name: 'AI Agent Framework Crash Course', description: 'Learn how to build AI agents from scratch', icon: '📚' },
        { name: 'Awesome Agent Skills', description: 'Tools and skills to plug into your AI agents', icon: '🛠️' },
        { name: 'MCP AI Agents', description: 'Model Context Protocol agents', icon: '🔌' },
        { name: 'RAG Tutorials', description: 'Retrieval-Augmented Generation guides', icon: '🔍' },
        { name: 'Starter AI Agents', description: 'Simple introductory agents to get started', icon: '👶' },
        { name: 'Voice AI Agents', description: 'Agents you can interact with via voice', icon: '🎙️' }
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 p-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl">
                            🌟
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">Awesome LLM Apps Integration</h2>
                            <p className="text-emerald-100 mt-2 max-w-2xl">
                                A curated collection of advanced agent frameworks, tutorials, and ready-to-use LLM applications seamlessly integrated into the AI Studio project workspace.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span>📂</span> Project Workspace Repository
                        </h3>
                        <p className="text-gray-300">
                            The <code>awesome-llm-apps-main</code> repository has been successfully mapped to your project workspace.
                            The Python scripts, Jupyter notebooks, and tutorials are available in the backend environment.
                            You can explore the source code or run these examples directly from your local IDE.
                        </p>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-6">Available Modules & Frameworks</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {folders.map(folder => (
                            <div key={folder.name} className="bg-gray-750 border border-gray-700 p-5 rounded-xl hover:border-teal-500/50 transition-all hover:-translate-y-1">
                                <div className="text-3xl mb-3">{folder.icon}</div>
                                <h4 className="text-lg font-bold text-white mb-2">{folder.name}</h4>
                                <p className="text-sm text-gray-400">{folder.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            To run these applications, navigate to the <code>awesome-llm-apps-main/awesome-llm-apps-main</code> directory in your terminal and follow the instructions in the respective README files.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
