import PrizeWheel from './PrizeWheel.jsx';
import OddsNeedle from './OddsNeedle.jsx';
import MultiplierWheel from './MultiplierWheel.jsx';
import VaultDial from './VaultDial.jsx';
import SlotReels from './SlotReels.jsx';
import LuckyGrid from './LuckyGrid.jsx';
import PrizeTicker from './PrizeTicker.jsx';
import LuckyCoin from './LuckyCoin.jsx';

// Spinner component for each variant id in src/data/rewards.js.
// Each takes { variant, left, onSpin } and owns its own spin button.
export const SPINNERS = {
  wheel: PrizeWheel,
  needle: OddsNeedle,
  double: MultiplierWheel,
  dial: VaultDial,
  slots: SlotReels,
  grid: LuckyGrid,
  ticker: PrizeTicker,
  coin: LuckyCoin,
};
