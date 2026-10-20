// DUMMY DATA — diganti dengan API nyata pada Fase 2.

import { models } from "./models-data";
import { providers } from "./providers-data";
import type { Model, Provider } from "./types";
export async function getModels(): Promise<Model[]> {
  return models;
}
export async function getModelBySlug(slug: string): Promise<Model | null> {
  return models.find((m) => m.slug === slug) ?? null;
}
export async function getProviders(): Promise<Provider[]> {
  return providers;
}
export async function getProviderById(id: string): Promise<Provider | null> {
  return providers.find((p) => p.id === id) ?? null;
}
