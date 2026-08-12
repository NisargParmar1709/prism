import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-20 px-4 font-sans text-[#0F172A]">
      
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]">
          Prism
        </h1>
        <p className="text-xl text-[#475569]">
          See your money clearly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* SurfaceCard Component */}
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-[24px] shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Surface Card</h2>
          <p className="text-sm text-[#475569] mb-4">
            Used for standard content, forms, and secondary data.
          </p>
          <button className="bg-[#8B5CF6] text-white px-4 py-2 rounded-[10px] text-sm font-semibold hover:bg-[#7C3AED] transition-colors">
            Primary Action
          </button>
        </div>

        {/* DarkHeroCard Component */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[16px] p-[24px] shadow-[0_8px_24px_rgba(30,41,59,0.3)] text-[#F8FAFC]">
          <p className="text-sm text-[#94A3B8] mb-1">HDFC Savings</p>
          <h2 className="text-3xl font-mono font-bold mb-6 tracking-tight tabular-nums text-right">₹1,24,500.00</h2>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">Card Holder</p>
              <p className="text-sm font-medium">Alex Chen</p>
            </div>
            <div className="w-10 h-6 bg-white/10 rounded backdrop-blur-sm"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
