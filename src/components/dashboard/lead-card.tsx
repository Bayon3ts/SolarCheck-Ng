'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export interface Lead {
  id: string;
  created_at: string;
  full_name: string;
  city: string;
  state: string;
  system_size: string;
  monthly_bill_range: string;
  status: string;
  phone: string;
  whatsapp: string;
}

interface LeadCardProps {
  lead: Lead;
  isFree: boolean;
  isLoggedIn: boolean;
  updateLeadStatus: (id: string, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-[#FEF3E2] text-[#92610E]' },
  { value: 'quoted', label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  { value: 'won', label: 'Won', color: 'bg-[#EAF6EE] text-[#1A5E38]' },
  { value: 'lost', label: 'Lost', color: 'bg-gray-100 text-[#6B6B6B]' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function LeadCard({ lead, isFree, isLoggedIn, updateLeadStatus }: LeadCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ageMs = Date.now() - new Date(lead.created_at).getTime();
  const isNewBadge = ageMs < 24 * 3600000 && lead.status === 'new'; // < 24h
  const isJustReceived = ageMs < 5 * 60000; // < 5 min

  const currentStatus = STATUS_OPTIONS.find(s => s.value === (lead.status || 'new')) || STATUS_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`bg-[#FFFFFF] rounded-2xl border border-[#E5E5E0] shadow-sm relative overflow-hidden transition-colors hover:border-[#1A5E38]/30 ${isJustReceived ? 'animate-pulse-once' : ''}`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        
        {/* Info Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-bold text-base text-[#1A1A1A] truncate">{lead.full_name}</h3>
            {isNewBadge && (
              <span className="text-[10px] bg-[#F5A623] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                New
              </span>
            )}
          </div>
          <div className="text-xs text-[#6B6B6B] truncate flex items-center gap-1.5">
            <span>{lead.city}, {lead.state}</span>
            <span>&middot;</span>
            <span>{lead.system_size || lead.monthly_bill_range}</span>
            <span>&middot;</span>
            <span>{timeAgo(lead.created_at)}</span>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${currentStatus.color} hover:opacity-80`}
          >
            {currentStatus.label}
            <span className="text-[10px] opacity-60">▼</span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-[#FFFFFF] border border-[#E5E5E0] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateLeadStatus(lead.id, opt.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                    opt.value === lead.status ? 'bg-[#FAFAF8] text-[#1A1A1A]' : 'text-[#6B6B6B] hover:bg-[#FAFAF8] hover:text-[#1A1A1A]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      {isFree || !isLoggedIn ? (
        <div className="mx-5 mb-5 bg-[#FAFAF8] rounded-xl p-4 border border-dashed border-[#E5E5E0] text-center">
          <p className="text-xs text-[#6B6B6B] mb-2 flex items-center justify-center gap-1.5">
            <span className="opacity-50">🔒</span> Contact details hidden
          </p>
          <p className="text-sm font-mono text-[#1A1A1A] mb-3 select-none opacity-40" style={{ filter: 'blur(4px)' }}>
            +234 803 XXX XXXX
          </p>
          <Link href="/for-installers/apply?plan=featured"
            className="text-xs font-bold text-[#1A5E38] hover:text-[#0F3D24] transition-colors inline-block underline underline-offset-4">
            Upgrade plan to unlock contact details
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2.5 px-5 pb-5">
          <a 
            href={`https://wa.me/${(lead.whatsapp || lead.phone).replace(/\D/g, '')}?text=Hi ${lead.full_name}, I saw your solar inquiry on SolarCheck. I'd love to discuss your needs.`}
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#1A5E38] text-white text-sm font-bold py-2 pr-4 pl-2 rounded-full hover:bg-[#0F3D24] transition-colors sm:w-auto w-full justify-center sm:justify-start"
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-[10px]">
              💬
            </span>
            Message on WhatsApp
          </a>
          <a 
            href={`tel:${lead.phone || lead.whatsapp}`}
            className="flex items-center gap-2 bg-[#1A5E38]/10 text-[#1A5E38] text-sm font-bold py-2 px-5 rounded-full hover:bg-[#1A5E38]/20 transition-colors sm:w-auto w-full justify-center"
          >
            Call
          </a>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseOnce {
          0% { box-shadow: 0 0 0 0 rgba(245, 166, 35, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 166, 35, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 166, 35, 0); }
        }
        .animate-pulse-once {
          animation: pulseOnce 1.5s cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }
      `}} />
    </div>
  );
}
