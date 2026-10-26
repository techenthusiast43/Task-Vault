import { defineChain } from 'viem';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Bohr Testnet Specification
export const bohrTestnet = defineChain({
  id: 968,
  name: 'Bohr Testnet',
  nativeCurrency: {
    name: 'Bohr Token',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

// Reown AppKit Cloud Project ID (read from .env or fallback)
export const projectId =
  import.meta.env.VITE_REOWN_PROJECT_ID || 'c46522c06950293da27d04b3cf409f08';

export const metadata = {
  name: 'TaskVault',
  description: 'Smart Contract Escrow for Freelance Jobs on BOT Chain',
  url: 'https://scan.bohr.life',
  icons: ['https://scan.bohr.life/logo.png'],
};

// Initialize Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [bohrTestnet],
  projectId,
  ssr: false,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Initialize Reown AppKit Modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [bohrTestnet],
  defaultNetwork: bohrTestnet,
  projectId,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#6366f1',
    '--w3m-color-mix': '#0f172a',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'Outfit, sans-serif',
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
});
