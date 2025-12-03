import { useState, useEffect } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface MatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
}

export function MatchForm({ open, onOpenChange, onSave }: MatchFormProps) {
  const { teams, players, matches, addMatch, selectedHomeTeam, selectedAwayTeam, setSelectedHomeTeam, setSelectedAwayTeam } = useLeagueStore();
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [scorers, setScorers] = useState<{ playerId: string; goals: number }[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && teams?.length >= 2) {
      setSelectedHomeTeam(teams[0]);
      setSelectedAwayTeam(teams[1]);
      setInitialized(true);
    }
  }, [teams, initialized, setSelectedHomeTeam, setSelectedAwayTeam]);

  const matchNumber = (matches?.length || 0) + 1;

  const handleAddScorer = () => {
    if (!players || players.length === 0) { toast.error('Add players first'); return; }
    setScorers((s) => [...s, { playerId: players[0].id, goals: 1 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomeTeam || !selectedAwayTeam) { toast.error('Select both teams'); return; }
    const totalScorerGoals = scorers.reduce((sum, s) => sum + (s.goals || 0), 0);
    if (scorers.length > 0 && totalScorerGoals !== homeGoals + awayGoals) {
      toast.error(`Scorer goals (${totalScorerGoals}) must equal match goals (${homeGoals + awayGoals})`);
      return;
    }
    if (matchNumber > 50) { toast.error('League complete!'); return; }

    const updatedState = addMatch(homeGoals, awayGoals, scorers);
    if (typeof onSave === 'function') onSave(updatedState);
    toast.success(`Match ${matchNumber} recorded!`);
    setHomeGoals(0); setAwayGoals(0); setScorers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader><DialogTitle className="font-display text-xl">Record Match {matchNumber}/50</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-2">{selectedHomeTeam?.name || 'Home'}</p>
              <Input type="number" min={0} value={homeGoals} onChange={(e) => setHomeGoals(parseInt(e.target.value || '0') || 0)} className="text-center text-3xl font-bold h-16 bg-input border-border" />
            </div>
            <span className="text-2xl text-muted-foreground font-display">VS</span>
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-2">{selectedAwayTeam?.name || 'Away'}</p>
              <Input type="number" min={0} value={awayGoals} onChange={(e) => setAwayGoals(parseInt(e.target.value || '0') || 0)} className="text-center text-3xl font-bold h-16 bg-input border-border" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Goal Scorers (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddScorer}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
            {scorers.map((scorer, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={scorer.playerId} onValueChange={(v) => setScorers(s => s.map((sc, idx) => idx === i ? { ...sc, playerId: v } : sc))}>
                  <SelectTrigger className="flex-1 bg-input border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {players?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={scorer.goals} onChange={(e) => setScorers(s => s.map((sc, idx) => idx === i ? { ...sc, goals: parseInt(e.target.value || '1') || 1 } : sc))} className="w-16 bg-input border-border" />
                <Button type="button" variant="ghost" size="icon" onClick={() => setScorers(s => s.filter((_, idx) => idx !== i))} className="text-destructive"><Minus className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full">Record Match</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
