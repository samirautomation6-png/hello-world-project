import { Trophy, Shield } from 'lucide-react';
import { useLeagueStore } from '@/store/leagueStore';

export function LeagueHeader() {
  const { teams } = useLeagueStore();
  const team1 = teams.find(t => t.id === 'team1');
  const team2 = teams.find(t => t.id === 'team2');

  return (
    <header className="relative py-8 md:py-12 text-center">
      {/* Decorative bubbles */}
      <div className="bubble w-4 h-4 top-10 left-[10%] hidden md:block" style={{ animationDelay: '0s' }} />
      <div className="bubble w-6 h-6 top-20 left-[20%] hidden md:block" style={{ animationDelay: '1s' }} />
      <div className="bubble w-3 h-3 top-8 right-[15%] hidden md:block" style={{ animationDelay: '2s' }} />
      <div className="bubble w-5 h-5 top-16 right-[25%] hidden md:block" style={{ animationDelay: '0.5s' }} />

      <div className="relative z-10 animate-fade-in">
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
          <Trophy className="w-6 h-6 md:w-10 md:h-10 text-gold drop-shadow-lg" />
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-display font-bold tracking-wider text-gradient-gold">
            ATLANTIS LEAGUE V2
          </h1>
          <Trophy className="w-6 h-6 md:w-10 md:h-10 text-gold drop-shadow-lg" />
        </div>
        <p className="text-sm md:text-lg text-muted-foreground font-body tracking-wide">
          50 Matches • 2 Teams • 1 Champion
        </p>
        <div className="mt-6 flex justify-center gap-6 md:gap-12">
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-primary/50 bg-muted/30 flex items-center justify-center">
              {team1?.logo ? (
                <img src={team1.logo} alt={team1.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary/50" />
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{team1?.name}</p>
            <p className="text-primary font-medium text-sm md:text-base">Coach {team1?.coach}</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-secondary/50 bg-muted/30 flex items-center justify-center">
              {team2?.logo ? (
                <img src={team2.logo} alt={team2.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-secondary/50" />
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{team2?.name}</p>
            <p className="text-secondary font-medium text-sm md:text-base">Coach {team2?.coach}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
