export type UserTier = 
  | "free" 
  | "freelancer" 
  | "pro" 
  | "startup" 
  | "business" 
  | "gov" 
  | "enterprise";

export interface User {
  id: string
  email: string
  mfaEnabled: boolean
  tier?: UserTier
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  mfaVerified: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setMfaVerified: (verified: boolean) => void
  setUserTier: (tier: UserTier) => void
}

export type CloudProvider = "aws" | "azure" | "gcp" | "oci" | "ibm" | "digitalocean" | "alibaba" | "tencent"

export type FeatureType =
  | "cost-analytics"
  | "ai-agents"
  | "infrastructure-guides"
  | "deployment-playbooks"
  | "monitoring"
  | "inventory"
  | "security"
  | "automation"
  | "collaboration"
  | "business"

export interface AppState {
  selectedFeature: FeatureType | null
  selectedProvider: CloudProvider | null
  theme: "light" | "dark"
  setSelectedFeature: (feature: FeatureType | null) => void
  setSelectedProvider: (provider: CloudProvider | null) => void
  toggleTheme: () => void
}
