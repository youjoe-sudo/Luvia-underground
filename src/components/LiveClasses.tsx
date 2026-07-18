import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Users, 
  Hand, 
  BarChart, 
  Edit3, 
  Settings, 
  PhoneOff, 
  Send, 
  Sparkles,
  Camera,
  Layers,
  Eraser
} from 'lucide-react';

interface LiveClassesProps {
  onGoBack: () => void;
  speakerName?: string;
}

type PanelMode = 'chat' | 'participants' | 'polls' | 'whiteboard';

export default function LiveClasses({ onGoBack, speakerName = "Marcus Vance" }: LiveClassesProps) {
  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  
  const [activePanel, setActivePanel] = useState<PanelMode>('chat');
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sarah Jenkins', message: 'Welcome everyone! We are launching in 2 minutes.', time: '13:10' },
    { id: 2, sender: 'Eleanor', message: 'Super excited for the spring physics math!', time: '13:11' }
  ]);

  // Poll state
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [pollOptions, setPollOptions] = useState([
    { text: 'Underdamped (Elastic spring bounce)', votes: 84 },
    { text: 'Overdamped (Smooth, no overshoot)', votes: 21 },
    { text: 'Critically damped (Fastest settle)', votes: 55 }
  ]);

  // Interactive Whiteboard drawing logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    if (activePanel === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a'; // match Slate 900 background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw initial design outline mock
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 20; i < canvas.width; i += 40) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 20; i < canvas.height; i += 40) {
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }
      }
    }
  }, [activePanel, inWaitingRoom]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearWhiteboard = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = {
      id: Date.now(),
      sender: 'Alex Mercer',
      message: chatInput,
      time: '13:12'
    };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const handleVote = (idx: number) => {
    if (pollVoted !== null) return;
    setPollVoted(idx);
    setPollOptions(prev => prev.map((opt, i) => {
      if (i === idx) return { ...opt, votes: opt.votes + 1 };
      return opt;
    }));
  };

  const totalVotes = pollOptions.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-12 font-sans">
      
      {inWaitingRoom ? (
        /* The Waiting Room Area */
        <div className="max-w-4xl mx-auto px-6 pt-16 text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest animate-pulse">● VIRTUAL LOBBY ACTIVE</span>
            <h1 className="font-display text-3xl font-bold tracking-tight">Design Systems Seminar</h1>
            <p className="text-xs text-slate-500">Configure your parameters before decanting into the active session with {speakerName}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-2xl mx-auto">
            
            {/* Camera Preview Mock Box */}
            <div className="relative aspect-video rounded-3xl bg-slate-900 border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center">
              {cameraOn ? (
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="flex justify-between items-center text-white text-[10px] font-mono">
                    <span className="bg-emerald-500/85 px-2 py-0.5 rounded font-bold">1080P PRO</span>
                    <span>SECURE_FEED</span>
                  </div>
                  
                  {/* Mock vector face avatar container represent camera capture */}
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
                    <Camera className="w-8 h-8" />
                  </div>

                  <span className="block text-[8px] font-mono text-slate-400">FPS REFRESH LOCK: 60HZ</span>
                </div>
              ) : (
                <div className="space-y-2 text-slate-400 text-center">
                  <VideoOff className="w-10 h-10 mx-auto text-slate-500" />
                  <span className="block text-xs font-mono">Camera Shield Active</span>
                </div>
              )}
            </div>

            {/* Config controls column */}
            <div className="space-y-6 text-left">
              <h3 className="font-display font-semibold text-sm">Hardware Setup</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setCameraOn(!cameraOn)}
                  className={`w-full p-4 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer border-solid bg-transparent ${
                    cameraOn 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                      : 'bg-rose-500/10 border-rose-500 text-rose-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    <span>{cameraOn ? 'CAMERA ENABLED' : 'CAMERA MUTED'}</span>
                  </div>
                  <span className="text-[10px] font-mono">TOGGLE</span>
                </button>

                <button
                  onClick={() => setMicOn(!micOn)}
                  className={`w-full p-4 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer border-solid bg-transparent ${
                    micOn 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                      : 'bg-rose-500/10 border-rose-500 text-rose-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    <span>{micOn ? 'MICROPHONE ACTIVE' : 'MICROPHONE MUTED'}</span>
                  </div>
                  <span className="text-[10px] font-mono">TOGGLE</span>
                </button>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200/10 rounded-2xl text-[10px] font-mono text-slate-400">
                HOST LATENCY: 12MS • BANDWIDTH: HIGH
              </div>
            </div>

          </div>

          <div className="flex justify-center space-x-3 pt-4">
            <button
              onClick={onGoBack}
              className="px-6 py-3.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs cursor-pointer border-none"
            >
              Abort Entry
            </button>
            <button
              onClick={() => setInWaitingRoom(false)}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer border-none"
              id="join-seminar-btn"
            >
              Enter Interactive Room
            </button>
          </div>
        </div>
      ) : (
        /* The Active Conference UI */
        <div className="max-w-7xl mx-auto px-6 pt-6">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-left">
              <span className="inline-block px-2 py-0.5 bg-rose-500 text-white rounded text-[9px] font-mono font-bold uppercase tracking-wider animate-pulse">● LIVE WORKSHOP</span>
              <h2 className="font-display font-bold text-lg mt-1">Design Systems at Scale ({speakerName} Live)</h2>
            </div>

            <button 
              onClick={() => setInWaitingRoom(true)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer border-none"
              id="exit-seminar-btn"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave Session</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Primary Speaker Stream details - 8/12 layout */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              
              <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-200/10 shadow-2xl overflow-hidden flex items-center justify-center">
                {/* Simulated Speaker Presentation feed */}
                <div className="absolute inset-0">
                  <img 
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200" 
                    alt="Presentation Slide" 
                    className="w-full h-full object-cover filter brightness-50" 
                  />
                  <div className="absolute inset-0 bg-slate-950/20" />
                </div>

                {/* Speaker PIP layout overlay */}
                <div className="absolute bottom-4 right-4 w-28 h-20 rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden shadow-lg flex items-center justify-center font-bold text-white text-xs">
                  {speakerName.charAt(0)}
                </div>

                <div className="absolute top-4 left-4 p-3 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/5 text-left text-white max-w-xs space-y-1">
                  <span className="block text-[8px] font-mono text-cyan-400 font-bold uppercase">PRESENTATION FEED</span>
                  <span className="block text-xs font-semibold leading-tight">Deconstructing system variables & interaction layouts</span>
                </div>

                {/* Waiting indicator overlay */}
                <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white bg-slate-950/80 backdrop-blur px-3 py-1 rounded-xl">
                  {isHandRaised && (
                    <span className="text-cyan-400 font-bold">✋ HAND RAISED IN ACTIVE STACK</span>
                  )}
                </div>
              </div>

              {/* Floating conference participant layout triggers */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-center space-x-3 shadow-sm">
                <button
                  onClick={() => setMicOn(!micOn)}
                  className={`p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent ${
                    micOn ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white' : 'bg-rose-500 text-white'
                  }`}
                  title="Toggle Mic"
                >
                  {micOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
                </button>

                <button
                  onClick={() => setCameraOn(!cameraOn)}
                  className={`p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent ${
                    cameraOn ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white' : 'bg-rose-500 text-white'
                  }`}
                  title="Toggle Video"
                >
                  {cameraOn ? <Video className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
                </button>

                <button
                  onClick={() => setIsHandRaised(!isHandRaised)}
                  className={`p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent ${
                    isHandRaised ? 'bg-cyan-500 text-slate-950 font-bold animate-bounce' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'
                  }`}
                  title="Raise Hand"
                  id="raise-hand-btn"
                >
                  <Hand className="w-4.5 h-4.5" />
                </button>

                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

                <button
                  onClick={() => setActivePanel('chat')}
                  className={`p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent ${
                    activePanel === 'chat' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'
                  }`}
                  title="Show Chat"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={() => setActivePanel('polls')}
                  className={`p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent ${
                    activePanel === 'polls' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'
                  }`}
                  title="Show Polls"
                >
                  <BarChart className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={() => setActivePanel('whiteboard')}
                  className={`p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent ${
                    activePanel === 'whiteboard' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'
                  }`}
                  title="Show Whiteboard"
                  id="whiteboard-toggle-btn"
                >
                  <Edit3 className="w-4.5 h-4.5" />
                </button>
              </div>

            </div>

            {/* Right Interactive Sidebar - 4/12 layout */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between min-h-[400px]">
              
              {/* Sidebar Header tabs */}
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/80 mb-2">
                  <span className="font-display font-bold text-sm uppercase">
                    {activePanel === 'chat' && 'CHAT STREAM'}
                    {activePanel === 'polls' && 'ACTIVE SURVEYS'}
                    {activePanel === 'whiteboard' && 'SANDBOX DRAWING'}
                  </span>
                  
                  <span className="text-[10px] font-mono text-slate-400">SESSION V3</span>
                </div>

                {/* Panels Area */}
                <div className="flex-1 overflow-y-auto max-h-96">
                  {activePanel === 'chat' && (
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="text-xs p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{msg.sender}</span>
                            <span className="text-[9px] font-mono text-slate-400">{msg.time}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-normal font-light">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activePanel === 'polls' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl text-xs border border-indigo-500/10 font-medium">
                        SURVEY QUESTION: Which damping configsettle is ideal for search boxes layout grids?
                      </div>

                      <div className="space-y-2.5">
                        {pollOptions.map((opt, idx) => {
                          const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                          const isSelected = pollVoted === idx;
                          return (
                            <button
                              key={idx}
                              disabled={pollVoted !== null}
                              onClick={() => handleVote(idx)}
                              className={`w-full p-3.5 rounded-xl border border-solid text-left text-xs transition-all relative overflow-hidden flex flex-col cursor-pointer bg-transparent ${
                                isSelected 
                                  ? 'bg-blue-500/10 border-blue-500 font-bold' 
                                  : 'bg-slate-50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex justify-between items-center z-10 w-full mb-1">
                                <span className="truncate pr-4 font-light">{opt.text}</span>
                                <span className="font-mono text-[10px] font-semibold">{percentage}%</span>
                              </div>
                              
                              {/* Background percent progress filler */}
                              {pollVoted !== null && (
                                <div 
                                  className="absolute left-0 top-0 bottom-0 bg-blue-500/5 z-0"
                                  style={{ width: `${percentage}%` }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <span className="block text-center text-[9px] font-mono text-slate-400">{totalVotes} VOTES TOTAL</span>
                    </div>
                  )}

                  {activePanel === 'whiteboard' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2">
                        <span>INTERACTIVE SKETCHPAD</span>
                        <div className="flex space-x-1.5">
                          <button onClick={() => setColor('#3b82f6')} className="w-3 h-3 rounded-full bg-blue-500 border-none cursor-pointer" title="Blue" />
                          <button onClick={() => setColor('#ec4899')} className="w-3 h-3 rounded-full bg-pink-500 border-none cursor-pointer" title="Pink" />
                          <button onClick={() => setColor('#22d3ee')} className="w-3 h-3 rounded-full bg-cyan-400 border-none cursor-pointer" title="Cyan" />
                          <button onClick={() => setColor('#10b981')} className="w-3 h-3 rounded-full bg-emerald-500 border-none cursor-pointer" title="Green" />
                        </div>
                      </div>

                      {/* Whiteboard HTML5 Canvas drawing element */}
                      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden aspect-video bg-slate-950">
                        <canvas
                          ref={canvasRef}
                          width={280}
                          height={160}
                          onMouseDown={startDrawing}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onMouseMove={draw}
                          className="w-full h-full cursor-crosshair block"
                        />
                      </div>

                      <button
                        onClick={clearWhiteboard}
                        className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer border-none"
                      >
                        <Eraser className="w-4.5 h-4.5" />
                        <span>Reset Workspace Sketch</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Send Form */}
              {activePanel === 'chat' && (
                <form onSubmit={handleSendChat} className="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Contribute text..."
                    className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/20 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                    id="chat-send-input"
                  />
                  <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-xl cursor-pointer border-none">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
