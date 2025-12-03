import { useLeagueStore } from '@/store/leagueStore';
import { User, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TopScorersProps {
  onEditPlayer: (playerId: string) => void;
  isAdmin: boolean;
}

export function TopScorers({ onEditPlayer, isAdmin }: TopScorersProps) {
  const { players = [], teams = [], deletePlayer } = useLeagueStore();

  const sortedPlayers = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0));

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  return (
    <div className="atlantis-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-xl md:text-2xl font-display font-semibold mb-4 md:mb-6 glow-text text-primary">Top Scorers</h2>

      {sortedPlayers.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No players added yet. Add players to track their goals!</p>
      ) : (
        <div className="space-y-2 md:space-y-3 max-h-[600px] overflow-y-auto">
          {sortedPlayers.map((player, index) => {
            const team = getTeam(player.teamId);
            const isTopThree = index < 3;

            return (
              <div
                key={player.id}
                className={cn(
                  'flex items-center gap-2 md:gap-4 p-3 md:p-4 rounded-lg transition-all hover:bg-muted/30',
                  isTopThree && 'bg-muted/20'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0',
                    index === 0 && 'bg-gold text-primary-foreground',
                    index === 1 && 'bg-gray-400 text-primary-foreground',
                    index === 2 && 'bg-amber-700 text-primary-foreground',
                    index > 2 && 'bg-muted text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>

                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-border shrink-0 bg-muted">
                  {player.image ? (
                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm md:text-base">{player.name}</p>
                  <p className={cn('text-xs md:text-sm', player.teamId === 'team1' ? 'text-primary' : 'text-secondary')}>
                    {team?.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl md:text-2xl font-bold text-gold">{player.goals || 0}</p>
                  <p className="text-xs text-muted-foreground">goals</p>
                </div>

                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-primary" 
                    onClick={() => onEditPlayer(player.id)}
                    disabled={!isAdmin}
                  >
                    <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-destructive" 
                    onClick={() => deletePlayer(player.id)}
                    disabled={!isAdmin}
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
