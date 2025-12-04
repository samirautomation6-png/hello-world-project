import { useState, useCallback } from 'react';
import { LeagueHeader } from '@/components/LeagueHeader';
import { StandingsTable } from '@/components/StandingsTable';
import { TopScorers } from '@/components/TopScorers';
import { MatchHistory } from '@/components/MatchHistory';
import { PlayerForm } from '@/components/PlayerForm';
import { MatchForm } from '@/components/MatchForm';
import { TeamLogoUploader } from '@/components/TeamLogoUploader';
import { Button } from '@/components/ui/button';
import { useLeagueStore } from '@/store/leagueStore';
import { useGitHubData } from '@/hooks/useGitHubData';
import { UserPlus, Play, RotateCcw, Save, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAdmin } from '@/hooks/useAdmin';

const Index = () => {
  const isAdmin = useAdmin();
  const [playerFormOpen, setPlayerFormOpen] = useState(false);
  const [matchFormOpen, setMatchFormOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { matches, teams, players, resetLeague } = useLeagueStore();
  const { updateData } = useGitHubData();

  const handleSaveToGitHub = useCallback(async () => {
    setSaving(true);
    await updateData({ teams, players, matches });
    setSaving(false);
  }, [updateData, teams, players, matches]);

  const handleEditPlayer = (playerId: string) => {
    setEditingPlayerId(playerId);
    setPlayerFormOpen(true);
  };

  const handlePlayerFormClose = (open: boolean) => {
    setPlayerFormOpen(open);
    if (!open) setEditingPlayerId(null);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-ocean-deep via-ocean-mid to-ocean-light" />
      
      <div className="relative z-10 container mx-auto px-4 pb-12">
        <LeagueHeader />

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8 animate-fade-in">
          <Button onClick={() => setPlayerFormOpen(true)} className="gap-2 text-sm md:text-base" variant="outline" disabled={!isAdmin}>
            <UserPlus className="w-4 h-4" /> Add Player
          </Button>
          <Button onClick={() => setMatchFormOpen(true)} className="gap-2 text-sm md:text-base" disabled={!isAdmin || matches.length >= 50}>
            <Play className="w-4 h-4" /> Record Match ({matches.length}/50)
          </Button>
          <Button
            onClick={handleSaveToGitHub}
            className="gap-2 text-sm md:text-base"
            variant="secondary"
            disabled={!isAdmin || saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save to GitHub
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2 text-sm md:text-base" disabled={!isAdmin}>
                <RotateCcw className="w-4 h-4" /> Reset League
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset League?</AlertDialogTitle>
                <AlertDialogDescription>This will delete all matches and reset team stats.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetLeague}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-6 order-1">
            <StandingsTable />
            <TeamLogoUploader isAdmin={isAdmin} />
            <MatchHistory />
          </div>
          <div className="order-2">
            <TopScorers onEditPlayer={handleEditPlayer} isAdmin={isAdmin} />
          </div>
        </div>
      </div>

      {isAdmin && <PlayerForm open={playerFormOpen} onOpenChange={handlePlayerFormClose} editingPlayerId={editingPlayerId} />}
      {isAdmin && <MatchForm open={matchFormOpen} onOpenChange={setMatchFormOpen} />}
    </div>
  );
};

export default Index;
