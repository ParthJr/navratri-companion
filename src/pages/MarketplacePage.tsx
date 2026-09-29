import React, { useState, useMemo } from 'react';
import { Companion } from '../types';
import { ShieldCheck, Star, MapPin, CheckCircle, Search, Sparkles, Filter, X } from 'lucide-react';

interface MarketplacePageProps {
  companions: Companion[];
  onSelectCompanion: (companion: Companion) => void;
  onOpenQuickModal: (companion: Companion) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  companions,
  onSelectCompanion,
  onOpenQuickModal,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [dateFilter, setDateFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredCompanions = useMemo(() => {
    return companions.filter((comp: any) => {
      // 1. Account status eligibility
      if (comp.status === 'suspended' || comp.status === 'rejected' || comp.status === 'deleted') return false;
      if (comp.registrationFeePaid === false && comp.feePaid === false) return false;

      // 2. Date Filter
      if (dateFilter) {
        if (dateFilter === 'tonight' && !comp.availableTonight) return false;
        if (dateFilter !== 'tonight' && !comp.availableDates?.includes(dateFilter)) return false;
      }

      // 3. Experience Filter
      if (experienceFilter) {
        const matchExp = comp.experiences?.some(
          (e: string) => e.toLowerCase() === experienceFilter.toLowerCase()
        );
        if (!matchExp) return false;
      }

      // 4. Duration Filter
      if (durationFilter) {
        const durNum = Number(durationFilter);
        if (!comp.durations?.includes(durNum)) return false;
      }

      // 5. Price Filter
      if (priceFilter) {
        const max = Number(priceFilter);
        if (comp.price2h && comp.price2h > max) return false;
      }

      // 6. Case-Insensitive Search Filter (name, city, area, bio, experience, skills, venues)
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = comp.name?.toLowerCase().includes(query);
        const matchCity = comp.city?.toLowerCase().includes(query);
        const matchArea = comp.area?.toLowerCase().includes(query);
        const matchBio =
          comp.bioSnippet?.toLowerCase().includes(query) ||
          comp.fullBio?.toLowerCase().includes(query);
        const matchExp = comp.experiences?.some((e: string) => e.toLowerCase().includes(query));
        const matchSkill = comp.skills?.some((s: string) => s.toLowerCase().includes(query));
        const matchVenue = comp.preferredVenues?.some((v: string) => v.toLowerCase().includes(query));

        if (!matchName && !matchCity && !matchArea && !matchBio && !matchExp && !matchSkill && !matchVenue) {
          return false;
        }
      }

      return true;
    });
  }, [companions, dateFilter, experienceFilter, durationFilter, priceFilter, searchQuery]);

  const resetFilters = () => {
    setDateFilter('');
    setExperienceFilter('');
    setDurationFilter('');
    setPriceFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = Boolean(
    dateFilter || experienceFilter || durationFilter || priceFilter || searchQuery
  );

  return (
    <div className="flex flex-col w-full">
      {/* Hero / Header Intro Banner */}
      <section className="w-full bg-[#12001f] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Festive Background Image Overlay */}
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKGhOQuATpYLVw36o5c837ml_QC4F2NiK3g3HoPxcCnIeADBEqW0paH5GlOwCAvSFEhr-IB5IywXUwz9Bi4ZHKsQpaqFy9hP4xiSJLM7aP2CAY70GspR_ZNv76NIpZdmfXnWWoo1Q_hBiVOa_bMPc6ehftJkHhBiv2R8csjY9KxIwZBWWmuJ1hnS-FTb6IQvLGTDDNvxTTu1bsYnqVlVtqyEAQwy537jOXrOlaae-EHn6-xQ7QW9a2')`,
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fd8a42]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-2xl">
            <span className="text-[#ffdbca] text-xs sm:text-sm uppercase tracking-wider mb-2 block font-bold">
              Ahmedabad &amp; Gandhinagar • Oct 11–19, 2026
            </span>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-4 tracking-tight leading-tight">
              Find Your Verified Navratri Companion
            </h1>
            <p className="text-base sm:text-lg text-[#e6eeff] leading-relaxed">
              Experience authentic Garba nights safely with background-checked local partners. Book experiences, not people — non-sexual, trusted community celebrations.
            </p>
          </div>

          {/* 100% ID Verified Trust Tag */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15 shrink-0 shadow-lg">
            <span className="material-symbols-outlined filled text-[#fd8a42] text-[34px]">
              verified_user
            </span>
            <div>
              <div className="font-bold text-white text-base font-['Plus_Jakarta_Sans']">
                100% ID Verified
              </div>
              <div className="text-[#e6eeff] text-xs">All hosts vetted for community safety</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Top Filter Bar */}
      <section className="sticky top-20 z-40 bg-[#f8f9ff]/95 backdrop-blur-xl border-b border-[#cec3ce]/30 shadow-xs py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Date Filter */}
            <div className="relative">
              <select
                id="filter-date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[#eff4ff] text-[#121c2a] text-xs sm:text-sm rounded-lg px-3 py-2 border border-[#cec3ce]/40 focus:outline-none focus:border-[#311042] cursor-pointer appearance-none pr-8 font-medium"
              >
                <option value="">All Dates (Oct 11–19)</option>
                <option value="tonight">Available Tonight</option>
                <option value="oct11">Oct 11 (Pratipada)</option>
                <option value="oct12">Oct 12 (Dwitiya)</option>
                <option value="oct15">Oct 15 (Panchami)</option>
                <option value="oct18">Oct 18 (Ashtami)</option>
                <option value="oct19">Oct 19 (Navami)</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-2.5 text-[#596579] text-xs">▼</div>
            </div>

            {/* Experience Filter */}
            <div className="relative">
              <select
                id="filter-experience"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="bg-[#eff4ff] text-[#121c2a] text-xs sm:text-sm rounded-lg px-3 py-2 border border-[#cec3ce]/40 focus:outline-none focus:border-[#311042] cursor-pointer appearance-none pr-8 font-medium"
              >
                <option value="">All Experiences</option>
                <option value="Garba">Garba</option>
                <option value="Conversation">Conversation</option>
                <option value="Photos">Photos</option>
                <option value="Dinner">Dinner</option>
                <option value="Garba Event">Garba Event</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-2.5 text-[#596579] text-xs">▼</div>
            </div>

            {/* Duration Filter */}
            <div className="relative">
              <select
                id="filter-duration"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="bg-[#eff4ff] text-[#121c2a] text-xs sm:text-sm rounded-lg px-3 py-2 border border-[#cec3ce]/40 focus:outline-none focus:border-[#311042] cursor-pointer appearance-none pr-8 font-medium"
              >
                <option value="">Any Duration</option>
                <option value="2">2 Hours</option>
                <option value="4">4 Hours</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-2.5 text-[#596579] text-xs">▼</div>
            </div>

            {/* Price Range Filter */}
            <div className="relative">
              <select
                id="filter-price"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="bg-[#eff4ff] text-[#121c2a] text-xs sm:text-sm rounded-lg px-3 py-2 border border-[#cec3ce]/40 focus:outline-none focus:border-[#311042] cursor-pointer appearance-none pr-8 font-medium"
              >
                <option value="">Max Price</option>
                <option value="1500">Under ₹1,500</option>
                <option value="2000">Under ₹2,000</option>
                <option value="3000">Under ₹3,000</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-2.5 text-[#596579] text-xs">▼</div>
            </div>

            {/* Search Input for companion/skill */}
            <div className="relative flex-1 min-w-[140px] max-w-[200px]">
              <input
                type="text"
                placeholder="Search companion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#121c2a] text-xs sm:text-sm rounded-lg pl-8 pr-2.5 py-2 border border-[#cec3ce]/40 focus:outline-none focus:border-[#311042]"
              />
              <Search className="w-3.5 h-3.5 text-[#596579] absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#9b4500] hover:text-[#311042] font-semibold flex items-center gap-1 px-2 py-1"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#596579] ml-auto">
            <span className="font-bold text-[#121c2a] text-base" id="results-count">
              {filteredCompanions.length}
            </span>{' '}
            companions found
          </div>
        </div>
      </section>

      {/* Main Marketplace Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {filteredCompanions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="companions-grid">
            {filteredCompanions.map((comp) => (
              <div
                key={comp.id}
                className="companion-card bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-[#cec3ce]/30 group"
              >
                {/* Photo & Verified Badges */}
                <div className="relative overflow-hidden cursor-pointer" onClick={() => onSelectCompanion(comp)}>
                  <div
                    className="w-full h-72 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${comp.avatarUrl}')` }}
                    role="img"
                    aria-label={`Portrait of ${comp.name}`}
                  />

                  {/* Verification Badges floating on top-left */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    <span className="bg-[#f8f9ff]/90 backdrop-blur-md text-[#121c2a] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined filled text-[14px] text-emerald-600">
                        check_circle
                      </span>{' '}
                      ID Verified
                    </span>
                    <span className="bg-[#f8f9ff]/90 backdrop-blur-md text-[#121c2a] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined filled text-[14px] text-emerald-600">
                        check_circle
                      </span>{' '}
                      Phone Verified
                    </span>
                  </div>

                  {/* Availability Badge floating on bottom-left */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    {comp.availableTonight ? (
                      <span className="bg-[#fd8a42] text-[#682c00] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        Available tonight
                      </span>
                    ) : (
                      <span className="bg-[#dee9fc] text-[#121c2a] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        Available Oct {comp.availableDates[0]?.replace('oct', '') || '12'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        onClick={() => onSelectCompanion(comp)}
                        className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#121c2a] hover:text-[#9b4500] cursor-pointer transition-colors"
                      >
                        {comp.name}, {comp.age}
                      </h3>
                      <div className="flex items-center text-xs text-[#596579] gap-1">
                        <span className="material-symbols-outlined filled text-[#9b4500] text-[16px]">
                          star
                        </span>
                        <span className="font-bold text-[#121c2a]">{comp.rating}</span>{' '}
                        <span>({comp.reviewCount})</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#596579] mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#9b4500]" />
                      <span>{comp.city || 'Gujarat'} • Verified Companion</span>
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {comp.experiences.map((exp) => (
                        <span
                          key={exp}
                          className="bg-[#e6eeff] text-[#121c2a] text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-[#121c2a] line-clamp-2 leading-relaxed">
                      {comp.bioSnippet}
                    </p>
                  </div>

                  {/* Pricing and CTA button */}
                  <div className="pt-3.5 border-t border-[#cec3ce]/30 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#596579]">2 Hours / 4 Hours</div>
                      <div className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#121c2a]">
                        ₹{comp.price2h.toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-[#596579] font-normal">
                          | ₹{comp.price4h.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenQuickModal(comp)}
                        className="text-xs text-[#311042] border border-[#311042]/40 hover:bg-[#eff4ff] px-2.5 py-2 rounded-lg font-medium transition-colors"
                        title="Quick View"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => onSelectCompanion(comp)}
                        className="bg-[#311042] text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg hover:bg-[#9b4500] active:scale-95 transition-all shadow-sm"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isLoading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#cec3ce]/30 p-8 shadow-xs">
            <div className="w-16 h-16 bg-[#eff4ff] rounded-full flex items-center justify-center mb-4 text-[#9b4500]">
              <span className="material-symbols-outlined text-[36px] animate-spin">progress_activity</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#121c2a] mb-2">
              Finding verified companions...
            </h3>
            <p className="text-sm text-[#596579] max-w-md leading-relaxed">
              Checking live registry for background-checked Navratri companions in Ahmedabad & Gandhinagar.
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-red-200 p-8 shadow-xs">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
              <span className="material-symbols-outlined text-[36px]">error_outline</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#121c2a] mb-2">
              Unable to load companions. Please try again.
            </h3>
            <p className="text-sm text-[#596579] max-w-md mb-6 leading-relaxed">
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-[#311042] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#9b4500] transition-colors"
              >
                Retry Connection
              </button>
            )}
          </div>
        ) : companions.length > 0 ? (
          /* Zero results from active filters */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#cec3ce]/30 p-8 shadow-xs">
            <div className="w-16 h-16 bg-[#eff4ff] rounded-full flex items-center justify-center mb-4 text-[#596579]">
              <span className="material-symbols-outlined text-[36px]">filter_alt_off</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#121c2a] mb-2">
              No companions match your current filters.
            </h3>
            <p className="text-sm text-[#596579] max-w-md mb-6 leading-relaxed">
              Try adjusting your date, duration, price, or search criteria to see available companions.
            </p>
            <button
              onClick={resetFilters}
              className="bg-[#311042] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#9b4500] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Genuinely zero approved companions in database */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#cec3ce]/30 p-8 shadow-xs">
            <div className="w-16 h-16 bg-[#eff4ff] rounded-full flex items-center justify-center mb-4 text-[#596579]">
              <span className="material-symbols-outlined text-[36px]">group_off</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#121c2a] mb-2">
              No verified companions are available yet.
            </h3>
            <p className="text-sm text-[#596579] max-w-md leading-relaxed">
              Verified companion profiles will appear here once they complete registration and approval.
            </p>
          </div>
        )}
      </section>

      {/* Trust & Safety Banner - 3 Pillars */}
      <section className="bg-[#eff4ff] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#cec3ce]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 bg-white p-6 rounded-xl border border-[#cec3ce]/30 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#ffdbca] flex items-center justify-center text-[#9b4500] mb-2">
              <span className="material-symbols-outlined filled text-[24px]">security</span>
            </div>
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#121c2a]">
              Book an Experience, Not a Person
            </h4>
            <p className="text-xs sm:text-sm text-[#596579] leading-relaxed">
              All bookings are structured strictly for shared cultural celebration, Garba dance partnership, photography, and dining companionship.
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-white p-6 rounded-xl border border-[#cec3ce]/30 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#ffdbca] flex items-center justify-center text-[#9b4500] mb-2">
              <span className="material-symbols-outlined filled text-[24px]">public</span>
            </div>
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#121c2a]">
              Mutually Agreed Public Locations
            </h4>
            <p className="text-xs sm:text-sm text-[#596579] leading-relaxed">
              Guests and companions finalize their meeting place together. All sessions take place exclusively in open, well-lit public festival grounds and festive areas.
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-white p-6 rounded-xl border border-[#cec3ce]/30 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#ffdbca] flex items-center justify-center text-[#9b4500] mb-2">
              <span className="material-symbols-outlined filled text-[24px]">verified</span>
            </div>
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#121c2a]">
              Rigorous ID Verification
            </h4>
            <p className="text-xs sm:text-sm text-[#596579] leading-relaxed">
              Every host undergoes government ID verification, phone authentication, and community background screening prior to listing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
