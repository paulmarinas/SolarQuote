
import React, { useState } from 'react';
import { AppStep, Location, RoofData, SolarConfig, EstimationResults } from './types';
import { DEFAULT_CONFIG } from './constants';
import { calculateSolarEstimation } from './services/calculator';
import { getExpertSolarAnalysis } from './services/gemini';
import StepIndicator from './components/StepIndicator';
import MapStep from './components/MapStep';
import ResultCard from './components/ResultCard';
import { 
  Home, MapPin, Zap, DollarSign, Calendar, TrendingUp, 
  Settings, Info, ChevronRight, Sun, Leaf, BarChart3,
  Search, Crosshair
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [location, setLocation] = useState<Location | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [roofData, setRoofData] = useState<RoofData | null>(null);
  const [config, setConfig] = useState<SolarConfig>(DEFAULT_CONFIG);
  const [results, setResults] = useState<EstimationResults | null>(null);
  const [expertAnalysis, setExpertAnalysis] = useState<string>('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  // --- Step Handlers ---
  const handleStart = () => setStep(AppStep.LOCATION);
  
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput) {
      // Mock geocoding - In a real app, use Google Geocoding API
      setLocation({ lat: 37.7749, lng: -122.4194, address: addressInput });
      setStep(AppStep.DRAWING);
    }
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStep(AppStep.DRAWING);
      });
    }
  };

  const handleRoofConfirm = (data: RoofData) => {
    setRoofData(data);
    setStep(AppStep.CONFIG);
  };

  const handleCalculate = async () => {
    if (roofData) {
      const res = calculateSolarEstimation(roofData, config);
      setResults(res);
      setStep(AppStep.RESULTS);
      
      setIsGeneratingAnalysis(true);
      const analysis = await getExpertSolarAnalysis(roofData, config, res);
      setExpertAnalysis(analysis);
      setIsGeneratingAnalysis(false);
    }
  };

  // --- Render Helpers ---
  const renderWelcome = () => (
    <div className="max-w-2xl mx-auto text-center py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100">
        <Sun size={40} />
      </div>
      <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Harness the <span className="text-emerald-600">Sun's Power</span>
      </h1>
      <p className="text-xl text-slate-600 mb-10 leading-relaxed">
        Estimate your potential solar savings and system size in under 2 minutes. 
        Start by locating your property and outlining your roof.
      </p>
      <button 
        onClick={handleStart}
        className="group bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl active:scale-95"
      >
        Get Your Quote <ChevronRight className="group-hover:translate-x-1 transition-transform" />
      </button>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <MapPin />, title: "Locate", desc: "Find your house on the satellite map" },
          { icon: <Zap />, title: "Design", desc: "Outline your roof area manually" },
          { icon: <BarChart3 />, title: "Save", desc: "See your ROI and annual savings" }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-emerald-500 mb-3">{item.icon}</div>
            <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Where is your property?</h2>
      <form onSubmit={handleLocationSubmit} className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Enter home address" 
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all shadow-sm text-lg"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            type="submit"
            disabled={!addressInput}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            Show on Map
          </button>
          <button 
            type="button"
            onClick={handleUseGPS}
            className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:border-emerald-500 hover:text-emerald-500 transition-all shadow-sm"
            title="Use Current Location"
          >
            <Crosshair />
          </button>
        </div>
      </form>
      <p className="mt-8 text-center text-slate-400 text-sm">
        We use satellite imagery to measure your roof's surface area accurately.
      </p>
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Settings />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Fine-tune Your Details</h2>
            <p className="text-slate-500 text-sm">Adjust rates for higher accuracy.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Electricity Rate ($/kWh)</label>
              <input 
                type="number" 
                step="0.01"
                value={config.electricityRate}
                onChange={(e) => setConfig({ ...config, electricityRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Panel Wattage (W)</label>
              <input 
                type="number" 
                value={config.panelWattage}
                onChange={(e) => setConfig({ ...config, panelWattage: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Installed Cost/Panel ($)</label>
              <input 
                type="number" 
                value={config.costPerPanel}
                onChange={(e) => setConfig({ ...config, costPerPanel: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Avg. Sun Hours/Day</label>
              <input 
                type="number" 
                step="0.1"
                value={config.avgSunHours}
                onChange={(e) => setConfig({ ...config, avgSunHours: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-3">
            <Info className="text-emerald-600" size={20} />
            <p className="text-sm text-emerald-800 font-medium">Your roof area: {roofData?.areaM2.toFixed(1)} m²</p>
          </div>
          <button 
            onClick={handleCalculate}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-md active:scale-95"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const chartData = [
      { name: 'Year 1', savings: results.monthlySavings * 12 },
      { name: 'Year 5', savings: results.monthlySavings * 12 * 5 },
      { name: 'Year 10', savings: results.monthlySavings * 12 * 10 },
      { name: 'Year 20', savings: results.monthlySavings * 12 * 20 },
    ];

    return (
      <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Analysis Complete</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Your Solar Report</h2>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Leaf size={16} /> Eco Impact
            </button>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              Download PDF
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ResultCard 
            label="System Size" 
            value={results.systemSizeKw.toFixed(1)} 
            unit="kW" 
            icon={<Zap size={20} />}
            description="Peak power output capacity"
          />
          <ResultCard 
            label="Panel Count" 
            value={results.panelCount} 
            unit="Modules" 
            icon={<MapPin size={20} />}
            description={`Using ${config.panelWattage}W panels`}
          />
          <ResultCard 
            label="Est. Monthly Saving" 
            value={`$${results.monthlySavings.toFixed(0)}`} 
            icon={<DollarSign size={20} />}
            description="Reduction in electricity bills"
            colorClass="text-blue-600"
          />
          <ResultCard 
            label="Break Even" 
            value={results.roiYears} 
            unit="Years" 
            icon={<Calendar size={20} />}
            description="Estimated ROI period"
            colorClass="text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-slate-50">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" /> Projected Savings Over Time
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    formatter={(val) => [`$${Math.round(Number(val))}`, 'Total Savings']}
                  />
                  <Bar dataKey="savings" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#10b981' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Financial Summary</h3>
              <p className="text-emerald-300 text-sm mb-6">A breakdown of your investment</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-emerald-800">
                  <span className="text-emerald-400">Total System Cost</span>
                  <span className="font-bold text-lg">${results.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-emerald-800">
                  <span className="text-emerald-400">Est. Tax Credits (30%)</span>
                  <span className="font-bold text-lg text-emerald-400">-${(results.totalCost * 0.3).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-emerald-800">
                  <span className="text-emerald-400">Net Investment</span>
                  <span className="font-bold text-lg">${(results.totalCost * 0.7).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-emerald-400">Annual Production</span>
                  <span className="font-bold text-lg text-emerald-100">{Math.round(results.annualProductionKwh).toLocaleString()} kWh</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-800/50 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Leaf className="text-emerald-400" size={18} />
                <span className="text-sm font-bold">Environmental Impact</span>
              </div>
              <p className="text-xs text-emerald-300 leading-relaxed">
                By installing this system, you'll prevent approximately <strong>{((results.annualProductionKwh * 0.7) / 1000).toFixed(1)} tons</strong> of CO2 emissions annually. That's equivalent to planting {Math.round(results.annualProductionKwh / 40)} trees!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-50">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Info className="text-emerald-500" /> AI Expert Analysis
          </h3>
          {isGeneratingAnalysis ? (
            <div className="flex items-center gap-3 text-slate-500 animate-pulse">
              <div className="w-5 h-5 bg-emerald-200 rounded-full"></div>
              <span>Expert AI is analyzing your roof data...</span>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
              {expertAnalysis.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-8">
          <button 
            onClick={() => setStep(AppStep.WELCOME)}
            className="text-slate-400 font-semibold hover:text-slate-600 transition-colors flex items-center gap-2"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep(AppStep.WELCOME)}>
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Sun size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">SolarQuote</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">How it Works</a>
            <a href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">About Solar</a>
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md">
              Talk to Expert
            </button>
          </div>
        </div>
      </nav>

      {step !== AppStep.WELCOME && <StepIndicator currentStep={step} />}

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {step === AppStep.WELCOME && renderWelcome()}
        {step === AppStep.LOCATION && renderLocation()}
        {step === AppStep.DRAWING && location && (
          <MapStep 
            location={location} 
            onConfirm={handleRoofConfirm}
            onBack={() => setStep(AppStep.LOCATION)}
          />
        )}
        {step === AppStep.CONFIG && renderConfig()}
        {step === AppStep.RESULTS && renderResults()}
      </main>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-700 transition-all">
          <Zap />
        </button>
      </div>
    </div>
  );
};

export default App;
